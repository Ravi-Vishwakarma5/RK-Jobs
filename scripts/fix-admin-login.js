// Script to fix admin login and create mock subscriptions
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection string (use the one from .env or default)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal';

console.log('Using MongoDB URI:', MONGODB_URI);

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

// Subscription schema
const SubscriptionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: false,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  plan: {
    type: String,
    required: true,
    enum: ['basic', 'professional', 'premium'],
    default: 'basic',
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
  },
  paymentId: { 
    type: String, 
    required: false,
  },
  paymentMethod: { 
    type: String, 
    required: false,
    default: 'razorpay'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'active',
  },
  features: {
    type: [String],
    default: [],
  },
  startDate: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  endDate: { 
    type: Date, 
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create models
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123', // This will be hashed
  status: 'active',
  role: 'admin',
  createdAt: new Date(),
};

// Function to create or update admin user
async function createOrUpdateAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);
      
      // Update admin password
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('Admin password updated successfully');
      return existingAdmin;
    } else {
      console.log('Creating new admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);
      
      // Create new admin
      const admin = new Admin({
        ...adminData,
        password: hashedPassword,
      });
      
      // Save admin to database
      await admin.save();
      console.log('Admin user created successfully');
      return admin;
    }
  } catch (error) {
    console.error('Error creating/updating admin:', error);
    throw error;
  }
}

// Function to create mock subscriptions
async function createMockSubscriptions() {
  try {
    // Delete existing subscriptions
    await Subscription.deleteMany({});
    console.log('Deleted existing subscriptions');
    
    // Create mock subscriptions
    const subscriptions = [];
    
    for (let i = 1; i <= 10; i++) {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
      
      const endDate = new Date(createdDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      subscriptions.push({
        email: `user${i}@example.com`,
        fullName: `Test User ${i}`,
        plan: ['basic', 'professional', 'premium'][Math.floor(Math.random() * 3)],
        amount: [499, 599, 699][Math.floor(Math.random() * 3)],
        currency: 'INR',
        status: ['active', 'expired', 'pending'][Math.floor(Math.random() * 3)],
        startDate: createdDate,
        endDate: endDate,
        createdAt: createdDate,
        paymentId: `mock-payment-${i}`
      });
    }
    
    const result = await Subscription.insertMany(subscriptions);
    console.log(`Created ${result.length} mock subscriptions`);
    return result;
  } catch (error) {
    console.error('Error creating mock subscriptions:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Create or update admin user
    const admin = await createOrUpdateAdmin();
    
    // Create mock subscriptions
    const subscriptions = await createMockSubscriptions();
    
    console.log('\nFix completed successfully!');
    console.log('Admin user:', admin.email);
    console.log('Subscriptions created:', subscriptions.length);
    console.log('\nYou can now log in with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error in main function:', error);
    
    // Disconnect from MongoDB
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
    
    process.exit(1);
  }
}

// Run the main function
main();
