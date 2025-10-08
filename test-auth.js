#!/usr/bin/env node

// Test script to verify the authentication fix
const http = require('http');
const querystring = require('querystring');

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          cookies: res.headers['set-cookie'] || []
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow Fix...\n');

  try {
    // Step 1: Test Login
    console.log('1️⃣ Testing login...');
    const loginData = JSON.stringify({
      email: 'patient@clinic.local',
      password: 'patient123'
    });

    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);

    console.log('📊 Login Response:');
    console.log(`   Status: ${loginResponse.statusCode}`);
    console.log(`   Body: ${loginResponse.body}`);
    console.log(`   Cookies: ${loginResponse.cookies.join('; ')}`);

    // Extract auth cookie
    const authCookie = loginResponse.cookies.find(c => c.includes('auth-token'));
    if (!authCookie) {
      console.log('❌ No auth token cookie found in login response');
      return;
    }
    
    console.log(`✅ Auth cookie set: ${authCookie.substring(0, 50)}...\n`);

    // Step 2: Test Session with Cookie
    console.log('2️⃣ Testing session with cookie...');
    const sessionResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/session',
      method: 'GET',
      headers: {
        'Cookie': authCookie.split(';')[0] // Use just the cookie value
      }
    });

    console.log('📊 Session Response:');
    console.log(`   Status: ${sessionResponse.statusCode}`);
    console.log(`   Body: ${sessionResponse.body}\n`);

    // Step 3: Test Appointments with Cookie
    console.log('3️⃣ Testing appointments with cookie...');
    const appointmentsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/appointments',
      method: 'GET',
      headers: {
        'Cookie': authCookie.split(';')[0] // Use just the cookie value
      }
    });

    console.log('📊 Appointments Response:');
    console.log(`   Status: ${appointmentsResponse.statusCode}`);
    console.log(`   Body: ${appointmentsResponse.body}`);

    if (appointmentsResponse.statusCode === 200) {
      console.log('\n✅ SUCCESS: Authentication fix is working!');
      console.log('🎉 Cookies are now properly transmitted between requests.');
    } else if (appointmentsResponse.statusCode === 401) {
      console.log('\n❌ STILL FAILING: 401 Unauthorized');
      console.log('🔍 This indicates the cookie is still not being processed correctly.');
    } else {
      console.log(`\n⚠️  Unexpected status: ${appointmentsResponse.statusCode}`);
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    console.log('🔍 Make sure the development server is running on localhost:3000');
  }
}

// Run the test
testAuthFlow();