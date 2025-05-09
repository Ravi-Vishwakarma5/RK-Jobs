// Simple script to test MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal';

console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connection successful!');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    // List all collections
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        console.log('Collections in database:');
        collections.forEach(collection => {
          console.log(`- ${collection.name}`);
        });
        
        // Close the connection
        mongoose.connection.close();
        console.log('Connection closed');
      })
      .catch(err => {
        console.error('Error listing collections:', err);
        mongoose.connection.close();
      });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
