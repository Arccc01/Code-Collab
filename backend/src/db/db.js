const moongoose = require('mongoose');

const connectDB = async () => {
  try {
    await moongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }     
};

module.exports = connectDB;