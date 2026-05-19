const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Agar process.env.MONGO_URI khali milega, toh yeh automatically local URL 'mongodb://127.0.0.1:27017/auth_db' pakad lega
    const dbUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth_db';
    
    await mongoose.connect(dbUrl);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;