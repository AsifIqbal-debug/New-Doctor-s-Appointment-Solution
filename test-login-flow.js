const fetch = require('node-fetch');

async function testLoginFlow() {
    try {
        console.log('Testing full login and appointment flow...');
        
        // Test 1: Login
        console.log('\n1. Testing login...');
        const loginResponse = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'patient@clinic.local',
                password: 'patient123'
            })
        });

        if (!loginResponse.ok) {
            console.error('Login failed:', loginResponse.status, loginResponse.statusText);
            return;
        }

        const loginData = await loginResponse.json();
        console.log('Login successful:', loginData);

        // Extract cookies
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('Set-Cookie header:', cookies);

        if (!cookies) {
            console.error('No cookies set in login response!');
            return;
        }

        // Test 2: Make appointment request with cookies
        console.log('\n2. Testing appointment booking with cookies...');
        const appointmentResponse = await fetch('http://localhost:3000/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies
            },
            body: JSON.stringify({
                doctorId: 'dr1',
                date: '2025-10-01',
                slotIndex: 0
            })
        });

        console.log('Appointment response status:', appointmentResponse.status);
        
        if (!appointmentResponse.ok) {
            const errorText = await appointmentResponse.text();
            console.error('Appointment booking failed:', errorText);
        } else {
            const appointmentData = await appointmentResponse.json();
            console.log('Appointment booking successful:', appointmentData);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testLoginFlow();