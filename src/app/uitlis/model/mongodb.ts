import mongoose from 'mongoose';

// Use a more reliable connection string with fallback
// For local development, use mongodb://localhost:27017/job-portal
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://agraharishivam6388:nWdPqJrockPp5VzI@job-portal.c4i1dn9.mongodb.net/job-portal?retryWrites=true&w=majority&appName=job-portal';

// Log the MongoDB URI (with password masked)
console.log(`MongoDB URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

// Global variable to track connection status
let isConnected = false;

// Cache the mongoose connection
let cachedConnection: typeof mongoose | null = null;

const connectDB = async () => {
  try {
    console.log('MongoDB connection requested');

    // If we have a cached connection, use it
    if (cachedConnection) {
      console.log('Using cached MongoDB connection');
      return cachedConnection;
    }

    // Check if we already have a connection
    if (isConnected) {
      console.log('Using existing MongoDB connection');
      return mongoose;
    }

    // Check mongoose connection state
    if (mongoose.connections[0].readyState) {
      console.log('Using existing mongoose connection');
      isConnected = true;
      cachedConnection = mongoose;
      return mongoose;
    }

    // Log connection attempt
    console.log(`Connecting to MongoDB at ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);

    // Set mongoose options
    mongoose.set('strictQuery', false);

    // Connect to MongoDB with explicit options
    const conn = await mongoose.connect(MONGODB_URI);

    isConnected = true;
    cachedConnection = mongoose;
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);

    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
      cachedConnection = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
      cachedConnection = null;
    });

    // Return the mongoose instance
    return mongoose;
  } catch (error) {
    isConnected = false;
    cachedConnection = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;
