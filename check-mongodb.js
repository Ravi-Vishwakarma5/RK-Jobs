// Simple script to check if MongoDB is running and accessible
const { MongoClient } = require('mongodb');

async function checkMongoDB() {
  // Connection URL
  const url = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB server
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB!');

    // Get the list of databases
    const adminDb = client.db('admin');
    const result = await adminDb.command({ listDatabases: 1 });
    
    console.log('Available databases:');
    result.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });

    // Check if job-portal database exists
    const jobPortalExists = result.databases.some(db => db.name === 'job-portal');
    if (jobPortalExists) {
      console.log('\njob-portal database exists');
      
      // Check collections in job-portal database
      const db = client.db('job-portal');
      const collections = await db.listCollections().toArray();
      
      console.log('Collections in job-portal database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      // Create payments collection if it doesn't exist
      if (!collections.some(col => col.name === 'payments')) {
        console.log('\nCreating payments collection...');
        await db.createCollection('payments');
        console.log('payments collection created successfully');
      }
      
      // Insert a test document
      console.log('\nInserting a test payment document...');
      const paymentsCollection = db.collection('payments');
      const testPayment = {
        name: 'Test User',
        email: 'test@example.com',
        paymentId: 'test_' + Date.now(),
        amount: 699,
        date: new Date(),
        status: 'success'
      };
      
      const insertResult = await paymentsCollection.insertOne(testPayment);
      console.log(`Test payment inserted with ID: ${insertResult.insertedId}`);
      
      // Find the test document
      const foundPayment = await paymentsCollection.findOne({ _id: insertResult.insertedId });
      console.log('Found the test payment:', foundPayment ? 'Yes' : 'No');
    } else {
      console.log('\njob-portal database does not exist, creating it...');
      const db = client.db('job-portal');
      await db.createCollection('payments');
      console.log('payments collection created successfully');
    }

    return 'MongoDB check completed successfully';
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return `Error: ${error.message}`;
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the check
checkMongoDB()
  .then(console.log)
  .catch(console.error);
