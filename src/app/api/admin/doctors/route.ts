import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/admin/doctors - Fetch all doctors
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        availabilities: {
          orderBy: {
            weekday: 'asc'
          }
        },
        dayOffs: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })

    return NextResponse.json({ doctors })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

// POST /api/admin/doctors - Add new doctor
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, email, password, specialty, qualification, experienceYears, feeBdt, imageUrl } = body

    // Validate required fields
    if (!name || !email || !password || !specialty || !feeBdt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and doctor in a transaction
    const newDoctor = await prisma.$transaction(async (tx: any) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          role: 'DOCTOR'
        }
      })

      // Create doctor profile
      const doctor = await tx.doctor.create({
        data: {
          userId: newUser.id,
          specialty,
          qualification: qualification || null,
          experienceYears: experienceYears ? parseInt(experienceYears) : null,
          feeBdt: parseInt(feeBdt),
          imageUrl: imageUrl || null
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

      return doctor
    })

    return NextResponse.json({
      message: 'Doctor added successfully',
      doctor: newDoctor
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding doctor:', error)
    return NextResponse.json(
      { error: 'Failed to add doctor' },
      { status: 500 }
    )
  }
}
