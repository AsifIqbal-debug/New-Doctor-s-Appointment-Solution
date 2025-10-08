import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// GET /api/admin/doctors/[id]/dayoffs - Get doctor's day offs
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id: doctorId } = await params

    const dayOffs = await prisma.doctorDayOff.findMany({
      where: { 
        doctorId,
        date: {
          gte: new Date()
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ dayOffs })
  } catch (error) {
    console.error('Error fetching day offs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch day offs' },
      { status: 500 }
    )
  }
}

// POST /api/admin/doctors/[id]/dayoffs - Add a day off
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id: doctorId } = await params
    const body = await req.json()
    const { date, reason } = body

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    const offDate = new Date(date)
    offDate.setHours(0, 0, 0, 0)

    const existing = await prisma.doctorDayOff.findUnique({
      where: {
        doctorId_date: {
          doctorId,
          date: offDate
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Day off already exists for this date' },
        { status: 400 }
      )
    }

    const dayOff = await prisma.doctorDayOff.create({
      data: {
        doctorId,
        date: offDate,
        reason: reason || null
      }
    })

    return NextResponse.json({
      message: 'Day off added successfully',
      dayOff
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding day off:', error)
    return NextResponse.json(
      { error: 'Failed to add day off' },
      { status: 500 }
    )
  }
}
