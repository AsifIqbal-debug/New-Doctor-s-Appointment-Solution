import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id: doctorId } = await context.params
    const schedules = await prisma.doctorAvailability.findMany({
      where: { doctorId },
      orderBy: { weekday: 'asc' }
    })
    
    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id: doctorId } = await context.params
    const body = await req.json()
    const { weekday, startTime, endTime, isActive } = body

    if (weekday === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Parse weekday to integer
    const weekdayInt = parseInt(weekday, 10)
    
    if (isNaN(weekdayInt) || weekdayInt < 0 || weekdayInt > 6) {
      return NextResponse.json({ error: 'Invalid weekday (must be 0-6)' }, { status: 400 })
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Check for conflicting schedules
    const existing = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        weekday: weekdayInt,
        isActive: true
      }
    })

    for (const schedule of existing) {
      const existingStart = schedule.startTime
      const existingEnd = schedule.endTime
      
      if (
        (startTime >= existingStart && startTime < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (startTime <= existingStart && endTime >= existingEnd)
      ) {
        return NextResponse.json(
          { error: 'Schedule conflicts with existing time slot' },
          { status: 400 }
        )
      }
    }

    const schedule = await prisma.doctorAvailability.create({
      data: {
        doctorId,
        weekday: weekdayInt,
        startTime,
        endTime,
        isActive: isActive !== undefined ? isActive : true
      }
    })
    
    return NextResponse.json({ message: 'Schedule added', schedule }, { status: 201 })
  } catch (error) {
    console.error('Error adding schedule:', error)
    return NextResponse.json({ error: 'Failed to add schedule' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id: doctorId } = await context.params
    await prisma.doctorAvailability.deleteMany({ where: { doctorId } })
    
    return NextResponse.json({ message: 'All schedules deleted' })
  } catch (error) {
    console.error('Error deleting schedules:', error)
    return NextResponse.json({ error: 'Failed to delete schedules' }, { status: 500 })
  }
}
