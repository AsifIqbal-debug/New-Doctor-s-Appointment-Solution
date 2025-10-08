import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// PUT /api/admin/doctors/[id]/schedule/[scheduleId] - Update schedule
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { scheduleId } = await params
    const body = await req.json()
    const { weekday, startTime, endTime, isActive } = body

    // Check if schedule exists
    const existing = await prisma.doctorAvailability.findUnique({
      where: { id: scheduleId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Update schedule
    const schedule = await prisma.doctorAvailability.update({
      where: { id: scheduleId },
      data: {
        ...(weekday !== undefined && { weekday: parseInt(weekday) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({
      message: 'Schedule updated successfully',
      schedule
    })

  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/doctors/[id]/schedule/[scheduleId] - Delete specific schedule
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { scheduleId } = await params

    // Check if schedule exists
    const existing = await prisma.doctorAvailability.findUnique({
      where: { id: scheduleId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Delete schedule
    await prisma.doctorAvailability.delete({
      where: { id: scheduleId }
    })

    return NextResponse.json({
      message: 'Schedule deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
