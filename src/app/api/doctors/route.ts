import { NextRequest, NextResponse } from 'next/server'
import { prisma, ensureConnection } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection before querying
    await ensureConnection()
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    const doctors = await prisma.doctor.findMany({
      where: {
        OR: [
          {
            user: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            specialty: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        specialty: true,
        bio: true,
        roomNo: true,
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}