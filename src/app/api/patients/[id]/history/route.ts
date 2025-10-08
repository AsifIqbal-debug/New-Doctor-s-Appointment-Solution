import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUser } from '@/lib/auth-utils'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only doctors and admins can view patient history
    if (user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const resolvedParams = await params
    const patientId = resolvedParams.id

    // Get patient information
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Get all appointments for this patient
    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        prescription: {
          select: {
            id: true,
            itemsJson: true,
            advice: true
          }
        }
      },
      orderBy: {
        startsAt: 'desc'
      }
    })

    // Get all prescriptions for this patient
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
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

    // Get all test orders for this patient
    const testOrders = await prisma.testOrder.findMany({
      where: {
        appointment: {
          patientId
        }
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
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

    return NextResponse.json({
      success: true,
      patient,
      appointments,
      prescriptions,
      testOrders
    })
  } catch (error) {
    console.error('Error fetching patient history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient history' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}