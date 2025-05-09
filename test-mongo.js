// Simple MongoDB test
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'job-portal';

async function main() {
  try {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    
    const db = client.db(dbName);
    const collection = db.collection('test_payments');
    
    // Insert a test document
    const insertResult = await collection.insertOne({
      name: 'Test User',
      email: 'test@example.com',
      amount: 699,
      paymentId: 'test_' + Date.now(),
      timestamp: new Date()
    });
    
    console.log('Inserted document:', insertResult);
    
    // Find the document
    const findResult = await collection.findOne({ _id: insertResult.insertedId });
    console.log('Found document:', findResult);
    
    return 'done.';
  } catch (error) {
    console.error('Error:', error);
    return 'error';
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log('Connection closed');
  }
}

main()
  .then(console.log)
  .catch(console.error);
