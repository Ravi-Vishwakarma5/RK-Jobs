// Test script to directly save payment data to MongoDB
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal';

console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

// Define a simple payment schema
const paymentSchema = new mongoose.Schema({
  userId: String,
  email: String,
  fullName: String,
  amount: Number,
  currency: String,
  paymentId: String,
  orderId: String,
  paymentMethod: String,
  status: String,
  subscriptionId: String,
  paymentDate: Date,
  createdAt: { type: Date, default: Date.now }
});

async function testSavePayment() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully!');
    
    // Create a model from the schema
    const PaymentModel = mongoose.model('Payment', paymentSchema);
    
    // Create a test payment
    const testPayment = new PaymentModel({
      userId: 'test_user_' + Date.now(),
      email: 'test@example.com',
      fullName: 'Test User',
      amount: 699,
      currency: 'INR',
      paymentId: 'pay_' + Date.now(),
      orderId: 'order_' + Date.now(),
      paymentMethod: 'razorpay',
      status: 'success',
      subscriptionId: 'sub_' + Date.now(),
      paymentDate: new Date()
    });
    
    // Save the payment
    const savedPayment = await testPayment.save();
    console.log('Payment saved successfully!');
    console.log('Saved payment:', savedPayment);
    
    // Verify the payment was saved
    const foundPayment = await PaymentModel.findById(savedPayment._id);
    console.log('Found payment by ID:', foundPayment ? 'Yes' : 'No');
    
    // List all payments
    const allPayments = await PaymentModel.find();
    console.log(`Total payments in database: ${allPayments.length}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testSavePayment();
