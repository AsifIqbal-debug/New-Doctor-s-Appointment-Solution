const fetch = require('node-fetch')

async function testServer() {
  try {
    console.log('🔍 Testing server connectivity...')
    
    const response = await fetch('http://localhost:3000/')
    console.log('✅ Server responded with status:', response.status)
    
    if (response.ok) {
      console.log('✅ Server is working correctly')
    } else {
      console.log('❌ Server returned error status:', response.status)
    }
    
  } catch (error) {
    console.log('❌ Failed to connect to server:', error.message)
  }
}

testServer()