// Script to test the admin login API
const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('Testing admin login API...');
    
    const response = await fetch('http://localhost:3001/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
    } else {
      console.log('Login failed:', data.error);
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
  }
}

// Run the test
testAdminLogin();
