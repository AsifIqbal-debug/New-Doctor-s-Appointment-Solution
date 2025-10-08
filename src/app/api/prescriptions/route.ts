import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/prescriptions - checking auth')
    const user = await getAuthUser(request)
    console.log('GET /api/prescriptions - user:', user)
    
    if (!user) {
      console.log('GET /api/prescriptions - no user, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = user.role
    const userId = user.id

    let prescriptions

    if (userRole === 'PATIENT') {
      // Get prescriptions for the logged-in patient
      const patient = await prisma.patient.findFirst({
        where: { userId }
      })

      if (!patient) {
        return NextResponse.json({ prescriptions: [] })
      }

      prescriptions = await prisma.prescription.findMany({
        where: { patientId: patient.id },
        include: {
          appointment: {
            include: {
              doctor: {
                select: {
                  user: { select: { name: true } },
                  specialty: true
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

    } else if (userRole === 'DOCTOR') {
      // Get prescriptions written by the logged-in doctor
      const doctor = await prisma.doctor.findFirst({
        where: { userId }
      })

      if (!doctor) {
        return NextResponse.json({ prescriptions: [] })
      }

      prescriptions = await prisma.prescription.findMany({
        where: { doctorId: doctor.id },
        include: {
          appointment: {
            include: {
              doctor: {
                select: {
                  user: { select: { name: true } },
                  specialty: true
                }
              },
              patient: {
                select: {
                  user: { select: { name: true } }
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

    } else if (userRole === 'ADMIN') {
      // Get all prescriptions for admin
      prescriptions = await prisma.prescription.findMany({
        include: {
          appointment: {
            include: {
              doctor: {
                select: {
                  user: { select: { name: true } },
                  specialty: true
                }
              },
              patient: {
                select: {
                  user: { select: { name: true } }
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

    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 })
    }

    console.log(`Found ${prescriptions.length} prescriptions for user ${user.email}`)
    return NextResponse.json({ prescriptions })

  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/prescriptions - checking auth')
    const user = await getAuthUser(request)
    
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized - Doctor access required' }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, medications, advice, attachmentUrl } = body

    if (!appointmentId || !medications) {
      return NextResponse.json(
        { error: 'appointmentId and medications are required' },
        { status: 400 }
      )
    }

    // Find the doctor profile
    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // Get the appointment to verify doctor ownership and get patient ID
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: doctor.id
      },
      include: {
        patient: true
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found or access denied' }, { status: 404 })
    }

    // Check if prescription already exists
    const existingPrescription = await prisma.prescription.findFirst({
      where: { appointmentId }
    })

    if (existingPrescription) {
      return NextResponse.json({ error: 'Prescription already exists for this appointment' }, { status: 409 })
    }

    // Create the prescription
    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        doctorId: doctor.id,
        patientId: appointment.patient.id,
        itemsJson: medications,
        advice: advice || null,
        attachmentUrl: attachmentUrl || null
      },
      include: {
        appointment: {
          include: {
            doctor: {
              select: {
                user: { select: { name: true } },
                specialty: true
              }
            },
            patient: {
              select: {
                user: { select: { name: true } }
              }
            }
          }
        }
      }
    })

    console.log('✅ Prescription created successfully:', prescription.id)
    return NextResponse.json({ prescription })

  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    )
  }
}