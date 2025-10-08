// Test availability API fix
const fetch = require('node-fetch')

async function testAvailabilityFix() {
  console.log('🧪 Testing Availability API Fix...\n')

  try {
    // 1. Login as doctor
    console.log('1️⃣ Logging in as doctor...')
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'doctor@clinic.local',
        password: 'doctor123'
      })
    })

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`)
    }

    console.log('✅ Login successful')
    const cookies = loginResponse.headers.get('set-cookie')

    // 2. Test setting availability
    console.log('\n2️⃣ Testing availability update...')
    const availabilityData = {
      weekday: 1, // Monday
      startTime: '09:00',
      endTime: '17:00'
    }

    const updateResponse = await fetch('http://localhost:3000/api/doctor/availability', {
      method: 'POST',
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(availabilityData)
    })

    console.log('📅 Availability Update Status:', updateResponse.status)
    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json()
      console.log('✅ Availability updated successfully!')
      console.log('📋 Result:', updateResult.availability)
    } else {
      const errorText = await updateResponse.text()
      console.log('❌ Availability update failed:', errorText)
    }

    // 3. Test retrieving availability
    console.log('\n3️⃣ Testing availability retrieval...')
    const getResponse = await fetch('http://localhost:3000/api/doctor/availability', {
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Availability Get Status:', getResponse.status)
    
    if (getResponse.ok) {
      const getResult = await getResponse.json()
      console.log('✅ Availability retrieved successfully!')
      console.log('📋 Availabilities found:', getResult.availabilities?.length || 0)
      if (getResult.availabilities?.length > 0) {
        console.log('📅 Sample availability:', getResult.availabilities[0])
      }
    }

    console.log('\n✅ Availability API Test Complete!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAvailabilityFix()