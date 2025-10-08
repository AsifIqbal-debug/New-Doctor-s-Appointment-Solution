import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/doctor/patients - checking auth')
    const user = await getAuthUser(request)
    console.log('GET /api/doctor/patients - user:', user)
    
    if (!user) {
      console.log('GET /api/doctor/patients - no user, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'DOCTOR') {
      console.log('GET /api/doctor/patients - not a doctor, returning 403')
      return NextResponse.json({ error: 'Forbidden - Doctor access required' }, { status: 403 })
    }

    // Get the doctor's ID
    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // Get all patients who have had appointments with this doctor
    const patients = await prisma.patient.findMany({
      where: {
        appointments: {
          some: {
            doctorId: doctor.id
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        appointments: {
          where: {
            doctorId: doctor.id
          },
          select: {
            id: true,
            startsAt: true,
            status: true,
            feeBdt: true
          },
          orderBy: {
            startsAt: 'desc'
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })

    console.log('GET /api/doctor/patients - found patients:', patients.length)

    return NextResponse.json({ patients })

  } catch (error) {
    console.error('Error fetching doctor patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient records' },
      { status: 500 }
    )
  }
}