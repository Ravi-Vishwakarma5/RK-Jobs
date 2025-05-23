// Script to create an admin user directly in the database
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal';

// Admin schema
const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  avatar: {
    type: String,
  },
});

// Create the Admin model
const Admin = mongoose.model('Admin', AdminSchema);

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123', // This will be hashed
  status: 'active',
  role: 'admin',
  createdAt: new Date(),
};

// Function to create admin user
async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create new admin with hashed password
    const admin = new Admin({
      ...adminData,
      password: hashedPassword,
    });

    // Save admin to database
    await admin.save();
    console.log('Admin user created successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
  }
}

// Run the function
createAdmin();
