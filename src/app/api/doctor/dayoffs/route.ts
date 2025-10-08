import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/doctor/dayoffs - checking auth')
    const user = await getAuthUser(request)
    
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the doctor's ID
    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // Get doctor's day offs (future dates only)
    const dayOffs = await prisma.doctorDayOff.findMany({
      where: { 
        doctorId: doctor.id,
        date: {
          gte: new Date()
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ dayOffs })

  } catch (error) {
    console.error('Error fetching day offs:', error)
    return NextResponse.json({ error: 'Failed to fetch day offs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, reason } = await request.json()

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // Get the doctor's ID
    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const dayOffDate = new Date(date)
    
    // Check if date is in the future
    if (dayOffDate < new Date()) {
      return NextResponse.json({ error: 'Cannot add day off for past dates' }, { status: 400 })
    }

    // Create day off
    const dayOff = await prisma.doctorDayOff.create({
      data: {
        doctorId: doctor.id,
        date: dayOffDate,
        reason: reason || null
      }
    })

    return NextResponse.json({ dayOff })

  } catch (error: any) {
    console.error('Error adding day off:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Day off already exists for this date' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to add day off' }, { status: 500 })
  }
}