const AWS = require('aws-sdk');
const connectDB = require('../config/connect');
const axios = require('axios');
const Cep = require('../models/cepModel');
require('dotenv').config();

const sqs = new AWS.SQS({
  region: process.env.region,
});

const receiveMessageFromSQS = async () => {
  const params = {
    QueueUrl: process.env.QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  };
  try {
    const data = await sqs.receiveMessage(params).promise();

    if (data.Messages && data.Messages.length > 0) {
      for (let message of data.Messages) {
        console.log('Mensagem recebida:', message.Body);

        await processMessage(message);
        await deleteMessageFromQueue(message.ReceiptHandle);
      }
    } else {
      console.log('Nenhuma mensagem na fila');
    }
  } catch (error) {
    console.error('Erro ao receber mensagens da fila SQS:', error);
  }
};
const processMessage = async (message) => {
  const ID = message.Body;
  try {
    const cep = await Cep.findById(ID);
    if (cep) {
      const cepBanco = cep.cepNumber;
      const cepVIACEP = await axios.get(`https://viacep.com.br/ws/${cepBanco}/json/`);
      //SALVA O VALOR CONSULTADO NO DATA DO BANCO
      cep.body = cepVIACEP.data; 
      cep.status = 'CONCLUIDO';
      await cep.save();
      console.log(cep.body)
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    cep.status = 'REJEITADO';
    await cep.save();
  }
};

const deleteMessageFromQueue = async (receiptHandle) => {
  const params = {
    QueueUrl: process.env.QUEUE_URL,
    ReceiptHandle: receiptHandle,
  };

  try {
    await sqs.deleteMessage(params).promise();
    console.log('Mensagem deletada da fila');
  } catch (error) {
    console.error('Erro ao deletar mensagem da fila SQS:', error);
  }
};
connectDB();

setInterval(receiveMessageFromSQS, 5000);
