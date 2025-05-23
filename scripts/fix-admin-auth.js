// Script to fix admin authentication issues
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

// Create mock subscriptions
const SubscriptionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: false,
    index: true
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
    default: function() {
      return 'mock-' + Math.random().toString(36).substring(2, 15);
    },
    index: true
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
    default: function() {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);
      return endDate;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  transactionDetails: Object,
});

// Create the Subscription model
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123', // This will be hashed
  status: 'active',
  role: 'admin',
  createdAt: new Date(),
};

// Function to create admin user and mock subscriptions
async function fixAdminAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      
      // Update admin password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);
      
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('Admin password updated successfully');
    } else {
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
    }

    // Create mock subscriptions
    console.log('Creating mock subscriptions...');
    
    // Delete existing subscriptions
    await Subscription.deleteMany({});
    
    // Create new subscriptions
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
    
    await Subscription.insertMany(subscriptions);
    console.log('Mock subscriptions created successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    console.log('\nFix completed successfully!');
    console.log('You can now log in with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error fixing admin auth:', error);
    await mongoose.disconnect();
  }
}

// Run the function
fixAdminAuth();
