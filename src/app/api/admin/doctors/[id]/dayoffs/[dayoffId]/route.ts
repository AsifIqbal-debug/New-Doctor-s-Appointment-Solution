import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// DELETE /api/admin/doctors/[id]/dayoffs/[dayoffId] - Delete day off
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; dayoffId: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { dayoffId } = await params

    // Check if day off exists
    const existing = await prisma.doctorDayOff.findUnique({
      where: { id: dayoffId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Day off not found' },
        { status: 404 }
      )
    }

    // Delete day off
    await prisma.doctorDayOff.delete({
      where: { id: dayoffId }
    })

    return NextResponse.json({
      message: 'Day off deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting day off:', error)
    return NextResponse.json(
      { error: 'Failed to delete day off' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/doctors/[id]/dayoffs/[dayoffId] - Update day off
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; dayoffId: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { dayoffId } = await params
    const body = await req.json()
    const { reason } = body

    // Check if day off exists
    const existing = await prisma.doctorDayOff.findUnique({
      where: { id: dayoffId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Day off not found' },
        { status: 404 }
      )
    }

    // Update day off
    const dayOff = await prisma.doctorDayOff.update({
      where: { id: dayoffId },
      data: {
        reason: reason || null
      }
    })

    return NextResponse.json({
      message: 'Day off updated successfully',
      dayOff
    })

  } catch (error) {
    console.error('Error updating day off:', error)
    return NextResponse.json(
      { error: 'Failed to update day off' },
      { status: 500 }
    )
  }
}
