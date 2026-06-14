import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB using the URI from environment variables.
 * Exits the process on failure since the app cannot run without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
