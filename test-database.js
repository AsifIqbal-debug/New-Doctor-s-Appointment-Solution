const { prisma } = require('./src/lib/db');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Check if we can connect
    const userCount = await prisma.user.count();
    console.log('✅ Database connected successfully');
    console.log('👥 Total users in database:', userCount);
    
    // Test 2: Check if patient user exists
    const patient = await prisma.user.findUnique({
      where: { email: 'patient@clinic.local' }
    });
    
    if (patient) {
      console.log('✅ Patient user exists:', patient.email, 'Role:', patient.role);
    } else {
      console.log('❌ Patient user not found in database');
    }
    
    // Test 3: Check doctors
    const doctorCount = await prisma.doctor.count();
    console.log('👨‍⚕️ Total doctors in database:', doctorCount);
    
    console.log('\n🎯 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();