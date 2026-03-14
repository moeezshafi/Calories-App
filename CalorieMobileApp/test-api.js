// Quick test script to verify API connectivity
const axios = require('axios');

const API_URL = 'https://calories.saadzaheer.com';

async function testAPI() {
  console.log('Testing API connectivity...\n');
  
  // Test 1: Health check
  try {
    console.log('1. Testing /api/health...');
    const health = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Health check passed:', health.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: Auth test endpoint
  try {
    console.log('\n2. Testing /api/auth/test...');
    const authTest = await axios.get(`${API_URL}/api/auth/test`);
    console.log('✅ Auth test passed:', authTest.data);
  } catch (error) {
    console.log('❌ Auth test failed:', error.message);
  }
  
  // Test 3: OPTIONS preflight
  try {
    console.log('\n3. Testing OPTIONS preflight...');
    const options = await axios.options(`${API_URL}/api/auth/register`, {
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    console.log('✅ OPTIONS preflight passed');
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': options.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': options.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': options.headers['access-control-allow-headers'],
    });
  } catch (error) {
    console.log('❌ OPTIONS preflight failed:', error.message);
  }
  
  // Test 4: Register attempt (should fail with validation error, but connection should work)
  try {
    console.log('\n4. Testing POST /api/auth/register...');
    await axios.post(`${API_URL}/api/auth/register`, {
      email: 'test@example.com',
      password: 'Test123!@#',
      name: 'Test User'
    });
  } catch (error) {
    if (error.response) {
      console.log('✅ Server responded (connection works):', error.response.status, error.response.data);
    } else {
      console.log('❌ Connection failed:', error.message);
    }
  }
}

testAPI();
