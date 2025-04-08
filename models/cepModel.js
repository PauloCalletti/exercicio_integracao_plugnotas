const mongoose = require('mongoose');

const CepSchema = new mongoose.Schema({
  cepNumber: { type: String, required: true },
  status: { type: String, default: 'PENDENTE' },
  body: { type: Object, default: null }, 
},{ 
    collection: 'VIACEP',
    timestamps: true
  }
); 

const Cep = mongoose.model('VIACEP', CepSchema);

module.exports = Cep;
