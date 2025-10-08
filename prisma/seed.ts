import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clinic.local' },
    update: {},
    create: {
      email: 'admin@clinic.local',
      name: 'System Admin',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('admin123', 10),
      phone: '+8801234567890'
    }
  })

  console.log('✅ Created admin user')

  // Create doctor user
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@clinic.local' },
    update: {},
    create: {
      email: 'doctor@clinic.local',
      name: 'Dr. Rahman Khan',
      role: 'DOCTOR',
      passwordHash: await bcrypt.hash('doctor123', 10),
      phone: '+8801234567891'
    }
  })

  // Create patient user
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@clinic.local' },
    update: {},
    create: {
      email: 'patient@clinic.local',
      name: 'John Doe',
      role: 'PATIENT',
      passwordHash: await bcrypt.hash('patient123', 10),
      phone: '+8801234567892'
    }
  })

  console.log('✅ Created users')

  // Create price rule set
  const priceRuleSet = await prisma.priceRuleSet.create({
    data: {
      name: 'Default BDT Pricing',
      currency: 'BDT',
      rulesJson: {
        window_days: 30,
        first_visit_fee: 1500,
        within_window_fee: 1000,
        outside_window_fee: 1500
      }
    }
  })

  console.log('✅ Created price rule set')

  // Create doctor profile
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialty: 'General Medicine',
      bio: 'Experienced general practitioner with 10+ years of experience.',
      roomNo: 'Room 101',
      defaultSlotMinutes: 15,
      priceRuleSetId: priceRuleSet.id
    }
  })

  // Create patient profile
  await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      dob: new Date('1990-01-15'),
      gender: 'Male',
      notes: 'No known allergies'
    }
  })

  console.log('✅ Created doctor and patient profiles')

  // Create doctor availability (Monday to Friday, 8 AM to 5 PM)
  const availabilityData = [
    { weekday: 1, startTime: '08:00', endTime: '17:00' }, // Monday
    { weekday: 2, startTime: '08:00', endTime: '17:00' }, // Tuesday
    { weekday: 3, startTime: '08:00', endTime: '17:00' }, // Wednesday
    { weekday: 4, startTime: '08:00', endTime: '17:00' }, // Thursday
    { weekday: 5, startTime: '08:00', endTime: '17:00' }, // Friday
    { weekday: 6, startTime: '09:00', endTime: '13:00' }, // Saturday (half day)
  ]

  for (const availability of availabilityData) {
    await prisma.doctorAvailability.create({
      data: {
        doctorId: doctor.id,
        ...availability
      }
    })
  }

  console.log('✅ Created doctor availability')

  // Create a few more doctors for variety
  const additionalDoctors = [
    {
      email: 'cardio@clinic.local',
      name: 'Dr. Sarah Ahmed',
      specialty: 'Cardiology',
      bio: 'Specialist in heart diseases and cardiovascular health.',
      roomNo: 'Room 201'
    },
    {
      email: 'gyne@clinic.local',
      name: 'Dr. Fatima Khan',
      specialty: 'Gynecology',
      bio: 'Women\'s health specialist with 15+ years experience.',
      roomNo: 'Room 301'
    },
    {
      email: 'ortho@clinic.local',
      name: 'Dr. Mohammad Rahman',
      specialty: 'Orthopedics',
      bio: 'Bone and joint specialist, expert in sports injuries.',
      roomNo: 'Room 401'
    },
    {
      email: 'dentist@clinic.local',
      name: 'Dr. Ayesha Begum',
      specialty: 'Dentistry',
      bio: 'Dental care specialist, cosmetic and general dentistry.',
      roomNo: 'Room 501'
    },
    {
      email: 'derma@clinic.local',
      name: 'Dr. Karim Hassan',
      specialty: 'Dermatology',
      bio: 'Skin and hair specialist, treating all skin conditions.',
      roomNo: 'Room 601'
    },
    {
      email: 'medicine@clinic.local',
      name: 'Dr. Nasir Uddin',
      specialty: 'Internal Medicine',
      bio: 'Internal medicine physician, treating general health issues.',
      roomNo: 'Room 701'
    }
  ]

  for (const doctorData of additionalDoctors) {
    const doctorUser = await prisma.user.create({
      data: {
        email: doctorData.email,
        name: doctorData.name,
        role: 'DOCTOR',
        passwordHash: await bcrypt.hash('doctor123', 10),
        phone: '+8801234567893'
      }
    })

    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        specialty: doctorData.specialty,
        bio: doctorData.bio,
        roomNo: doctorData.roomNo,
        defaultSlotMinutes: 30,
        priceRuleSetId: priceRuleSet.id
      }
    })

    // Add availability for each doctor (Monday to Friday)
    for (const availability of availabilityData.slice(0, 5)) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doctor.id,
          ...availability
        }
      })
    }
  }

  console.log('✅ Created additional doctors')

  console.log('🎉 Database seeded successfully!')
  console.log('\n📝 Login credentials:')
  console.log('Admin: admin@clinic.local / admin123')
  console.log('Doctor: doctor@clinic.local / doctor123')
  console.log('Patient: patient@clinic.local / patient123')
  console.log('Cardiology: cardio@clinic.local / doctor123')
  console.log('Gynecology: gyne@clinic.local / doctor123')
  console.log('Orthopedics: ortho@clinic.local / doctor123')
  console.log('Dentistry: dentist@clinic.local / doctor123')
  console.log('Dermatology: derma@clinic.local / doctor123')
  console.log('Internal Medicine: medicine@clinic.local / doctor123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })