import mongoose from 'mongoose';

const connDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // stop app if DB fails
  }
};

export default connDB;