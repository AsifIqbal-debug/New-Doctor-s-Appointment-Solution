import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { computeFee } from '@/lib/pricing'
import { getFreeSlots } from '@/lib/slots'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/appointments - checking auth')
    console.log('POST /api/appointments - cookies received:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 10)}...`))
    const user = await getAuthUser(request)
    console.log('POST /api/appointments - user:', user)
    if (!user) {
      console.log('POST /api/appointments - no user, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { doctorId, date, slotIndex } = body

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: 'doctorId and date are required' },
        { status: 400 }
      )
    }

    // Find the patient profile for the logged-in user
    const patient = await prisma.patient.findFirst({
      where: { userId: user.id }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      )
    }

    // Get available slots before transaction
    const slots = await getFreeSlots(doctorId, date)
    
    if (slots.length === 0) {
      return NextResponse.json(
        { error: 'No slots available for the selected date' },
        { status: 400 }
      )
    }

    // Use the specified slot index or default to the first available slot
    const slotToBook = slots[slotIndex || 0]
    
    if (!slotToBook) {
      return NextResponse.json(
        { error: 'Selected slot is not available' },
        { status: 400 }
      )
    }

    // Calculate fee before transaction
    const { fee, rule } = await computeFee(doctorId, patient.id)

    // Use a transaction only for the critical section
    const appointment = await prisma.$transaction(async (tx: any) => {
      // Double-check if the slot is still available (race condition protection)
      const existingAppointment = await tx.appointment.findFirst({
        where: {
          doctorId,
          startsAt: slotToBook.startUTC,
          status: { in: ['BOOKED', 'COMPLETED'] }
        }
      })

      if (existingAppointment) {
        throw new Error('Selected slot is no longer available')
      }

      // Create the appointment
      const newAppointment = await tx.appointment.create({
        data: {
          doctorId,
          patientId: patient.id,
          startsAt: slotToBook.startUTC,
          endsAt: slotToBook.endUTC,
          feeBdt: fee,
          feeRule: rule,
          createdBy: user.id,
          status: 'BOOKED'
        },
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
      })

      return newAppointment
    }, {
      timeout: 10000 // 10 second timeout for the simplified transaction
    })

    return NextResponse.json({
      message: 'Appointment booked successfully',
      appointment
    })

  } catch (error: any) {
    console.error('Error booking appointment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to book appointment' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/appointments - checking auth')
    const user = await getAuthUser(request)
    console.log('GET /api/appointments - user:', user)
    if (!user) {
      console.log('GET /api/appointments - no user, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = user.role
    const userId = user.id

    let appointments

    if (userRole === 'PATIENT') {
      // Get appointments for the logged-in patient
      const patient = await prisma.patient.findFirst({
        where: { userId }
      })

      if (!patient) {
        return NextResponse.json({ appointments: [] })
      }

      appointments = await prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            select: {
              user: { select: { name: true } },
              specialty: true,
              roomNo: true
            }
          }
        },
        orderBy: { startsAt: 'desc' }
      })

    } else if (userRole === 'DOCTOR') {
      // Get appointments for the logged-in doctor
      const doctor = await prisma.doctor.findFirst({
        where: { userId }
      })

      if (!doctor) {
        return NextResponse.json({ appointments: [] })
      }

      appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: {
            select: {
              id: true,
              user: { select: { name: true } }
            }
          },
          prescription: {
            select: {
              id: true
            }
          },
          payments: {
            select: {
              id: true,
              amountBdt: true,
              method: true,
              receivedAt: true
            }
          }
        },
        orderBy: { startsAt: 'asc' }
      })

    } else if (userRole === 'ADMIN') {
      // Get all appointments for admin
      appointments = await prisma.appointment.findMany({
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
        },
        orderBy: { startsAt: 'desc' }
      })

    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 })
    }

    return NextResponse.json({ appointments })

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}