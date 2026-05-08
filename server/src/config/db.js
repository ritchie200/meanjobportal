const mongoose = require('mongoose');
const { mongoUri } = require('./env');

const connectDB = async () => {
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Create a local .env file from .env.example.');
  }

  const connection = await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
};

module.exports = connectDB;
