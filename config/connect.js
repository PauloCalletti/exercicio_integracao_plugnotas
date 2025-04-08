const mongoose = require('mongoose');

async function connectDB() {
    await mongoose.connect(process.env.DATABASE_MONGOOSE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => console.log('Conectado ao MongoDB'))
      .catch((err) => console.error('Houve erro ao conectar ao MongoDB:', err));
}

module.exports = connectDB;
