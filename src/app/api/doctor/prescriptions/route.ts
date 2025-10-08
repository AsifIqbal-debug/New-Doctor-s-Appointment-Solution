import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/doctor/prescriptions - checking auth')
    const user = await getAuthUser(request)
    console.log('GET /api/doctor/prescriptions - user:', user)
    
    if (!user) {
      console.log('GET /api/doctor/prescriptions - no user, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'DOCTOR') {
      console.log('GET /api/doctor/prescriptions - not a doctor, returning 403')
      return NextResponse.json({ error: 'Forbidden - Doctor access required' }, { status: 403 })
    }

    // Get the doctor's ID
    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // Get all prescriptions written by this doctor
    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctorId: doctor.id
      },
      include: {
        appointment: {
          select: {
            id: true,
            startsAt: true,
            doctor: {
              select: {
                user: {
                  select: {
                    name: true
                  }
                },
                specialty: true
              }
            },
            patient: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        appointment: {
          startsAt: 'desc'
        }
      }
    })

    console.log('GET /api/doctor/prescriptions - found prescriptions:', prescriptions.length)

    return NextResponse.json({ prescriptions })

  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    )
  }
}