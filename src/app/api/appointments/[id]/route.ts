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

    const resolvedParams = await params
    const appointmentId = resolvedParams.id

    // Get the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
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
        },
        prescription: true
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check authorization based on user role
    if (user.role === 'PATIENT' && appointment.patient.user.id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to view this appointment' }, { status: 403 })
    }

    if (user.role === 'DOCTOR' && appointment.doctor.user.id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to view this appointment' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      appointment
    })
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const resolvedParams = await params
    const appointmentId = resolvedParams.id
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the appointment to verify doctor ownership
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

    // Check if the user is the doctor for this appointment
    if (user.role !== 'DOCTOR' || appointment.doctor.user.id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to update this appointment' }, { status: 403 })
    }

    // Update the appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
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
        },
        prescription: true
      }
    })

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}