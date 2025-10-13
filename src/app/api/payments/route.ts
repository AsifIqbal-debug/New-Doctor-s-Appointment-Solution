import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUser } from '@/lib/auth-utils'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only doctors can record payments
    if (user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Only doctors can record payments' }, { status: 403 })
    }

    const { 
      appointmentId, 
      amount, 
      paymentMethod
    } = await request.json()

    // Validate required fields
    if (!appointmentId || !amount || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Appointment ID, amount, and payment method are required' 
      }, { status: 400 })
    }

    // Verify the appointment exists and belongs to the doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          include: {
            user: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (appointment.doctor.user.id !== user.id) {
      return NextResponse.json({ 
        error: 'Not authorized to record payment for this appointment' 
      }, { status: 403 })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        appointmentId,
        method: paymentMethod,
        amountBdt: Math.round(parseFloat(amount)),
        receivedByAdminId: user.id, // Using doctor ID for now
        receivedAt: new Date()
      },
      include: {
        appointment: {
          include: {
            patient: {
              include: {
                user: true
              }
            },
            doctor: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      payment,
      message: 'Payment recorded successfully'
    })
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    let whereClause: any = {}

    if (user.role === 'PATIENT') {
      // Patients can only see their own payments
      whereClause = {
        appointment: {
          patient: {
            user: {
              id: user.id
            }
          }
        }
      }
    } else if (user.role === 'DOCTOR') {
      // Doctors can only see payments for their appointments
      whereClause = {
        appointment: {
          doctor: {
            user: {
              id: user.id
            }
          }
        }
      }
    } else if (user.role === 'ADMIN') {
      // Admins can see all payments
      whereClause = {}
    }

    // Filter by appointment ID if provided
    if (appointmentId) {
      whereClause.appointmentId = appointmentId
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        appointment: {
          include: {
            patient: {
              include: {
                user: true
              }
            },
            doctor: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        receivedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      payments
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}