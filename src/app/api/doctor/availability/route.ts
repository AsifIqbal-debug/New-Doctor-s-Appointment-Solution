import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/doctor/availability - checking auth')
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

    // Get doctor's availability
    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctor.id },
      orderBy: { weekday: 'asc' }
    })

    return NextResponse.json({ availabilities })

  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { weekday, startTime, endTime } = await request.json()

    if (typeof weekday !== 'number' || !startTime || !endTime) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Get the doctor's ID
    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    // Check if availability already exists for this doctor and weekday
    const existingAvailability = await prisma.doctorAvailability.findFirst({
      where: {
        doctorId: doctor.id,
        weekday: weekday
      }
    })

    let availability
    if (existingAvailability) {
      // Update existing availability
      availability = await prisma.doctorAvailability.update({
        where: { id: existingAvailability.id },
        data: {
          startTime,
          endTime,
          isActive: true
        }
      })
    } else {
      // Create new availability
      availability = await prisma.doctorAvailability.create({
        data: {
          doctorId: doctor.id,
          weekday,
          startTime,
          endTime,
          isActive: true
        }
      })
    }

    return NextResponse.json({ availability })

  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}