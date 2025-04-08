const express = require('express');
//const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const connectDB = require('../config/connect');
const Cep = require('../models/cepModel');
require('dotenv').config();

const sqs = new AWS.SQS({
  region: process.env.region
});

//COMUNICANDO COM O SQS DA AWS
const sendMessageToSQS = async (messageBody) => {
  const params = {
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: messageBody,
  };

  try {
    await sqs.sendMessage(params).promise();
    console.log('Mensagem enviada para a fila SQS');
  } catch (error) {
    console.error('Erro ao enviar mensagem para a fila SQS:', error);
  }
};

//SALVAR NO BANCO UM NOVO REGISTRO COM BASE NO cepModel.js
const createCep = async (req, res) => {
  const { cepNumber } = req.body;

  try {
    const newCep = new Cep({ cepNumber });
    await newCep.save();

    await sendMessageToSQS(newCep._id.toString());

    res.status(201).json({ message: 'CEP registrado com sucesso', data: newCep });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar o CEP', error: error.message });
  }
};

const app = express();

//PARSE DO JSON
app.use(express.json());

connectDB();

//ENDPOINT DA API REST
app.post('/cep', createCep);

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
