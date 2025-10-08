import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// DELETE /api/admin/doctors/[id] - Remove doctor
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const params = await context.params
    const doctorId = params.id

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        appointments: {
          where: {
            status: {
              in: ['BOOKED']
            }
          }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Check for active appointments
    if (doctor.appointments.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete doctor with active appointments',
          activeAppointments: doctor.appointments.length
        },
        { status: 400 }
      )
    }

    // Delete doctor and related data in transaction
    await prisma.$transaction(async (tx: any) => {
      // Delete availability schedules
      await tx.doctorAvailability.deleteMany({
        where: { doctorId }
      })

      // Delete day offs
      await tx.doctorDayOff.deleteMany({
        where: { doctorId }
      })

      // Delete prescriptions
      await tx.prescription.deleteMany({
        where: { doctorId }
      })

      // Delete completed/cancelled appointments
      await tx.appointment.deleteMany({
        where: { doctorId }
      })

      // Delete doctor profile
      await tx.doctor.delete({
        where: { id: doctorId }
      })

      // Delete user account
      await tx.user.delete({
        where: { id: doctor.userId }
      })
    })

    return NextResponse.json({
      message: 'Doctor removed successfully'
    })

  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json(
      { error: 'Failed to remove doctor' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/doctors/[id] - Update doctor
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const params = await context.params
    const doctorId = params.id
    const body = await req.json()
    const { name, specialty, qualification, experienceYears, feeBdt } = body

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Update doctor and user in transaction
    const updatedDoctor = await prisma.$transaction(async (tx: any) => {
      // Update user name if provided
      if (name) {
        await tx.user.update({
          where: { id: doctor.userId },
          data: { name }
        })
      }

      // Update doctor profile
      const updated = await tx.doctor.update({
        where: { id: doctorId },
        data: {
          specialty: specialty || undefined,
          qualification: qualification !== undefined ? qualification : undefined,
          experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
          feeBdt: feeBdt ? parseFloat(feeBdt) : undefined
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      return updated
    })

    return NextResponse.json({
      message: 'Doctor updated successfully',
      doctor: updatedDoctor
    })

  } catch (error) {
    console.error('Error updating doctor:', error)
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    )
  }
}
