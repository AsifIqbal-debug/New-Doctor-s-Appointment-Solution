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

    // Only doctors can order tests
    if (user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Only doctors can order tests' }, { status: 403 })
    }

    const { 
      appointmentId, 
      tests, 
      instructions, 
      urgency = 'ROUTINE',
      totalAmount
    } = await request.json()

    // Validate required fields
    if (!appointmentId || !tests || !Array.isArray(tests) || tests.length === 0) {
      return NextResponse.json({ 
        error: 'Appointment ID and tests are required' 
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
        },
        patient: {
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
        error: 'Not authorized to order tests for this appointment' 
      }, { status: 403 })
    }

    // Create test order record - using existing schema fields
    const testOrder = await prisma.testOrder.create({
      data: {
        appointmentId,
        type: `${urgency}_TESTS`, // Using type field as required
        notes: instructions || `Tests ordered: ${tests.map((t: any) => t.testName).join(', ')}`
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
      testOrder,
      message: 'Tests ordered successfully'
    })
  } catch (error) {
    console.error('Error ordering tests:', error)
    return NextResponse.json(
      { error: 'Failed to order tests' },
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
      // Patients can only see their own test orders
      whereClause = {
        patient: {
          user: {
            id: user.id
          }
        }
      }
    } else if (user.role === 'DOCTOR') {
      // Doctors can only see test orders they created
      whereClause = {
        doctor: {
          user: {
            id: user.id
          }
        }
      }
    } else if (user.role === 'ADMIN') {
      // Admins can see all test orders
      whereClause = {}
    }

    // Filter by appointment ID if provided
    if (appointmentId) {
      whereClause.appointmentId = appointmentId
    }

    const testOrders = await prisma.testOrder.findMany({
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
        appointment: {
          startsAt: 'desc'
        }
      }
    })

    return NextResponse.json({
      success: true,
      testOrders
    })
  } catch (error) {
    console.error('Error fetching test orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test orders' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}