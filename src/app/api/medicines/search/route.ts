import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }

    const medicines = await prisma.medicine.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            genericName: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: [
        { name: 'asc' },
        { strength: 'asc' }
      ],
      take: 20
    })

    return NextResponse.json(medicines)
  } catch {
    return NextResponse.json(
      { error: 'Failed to search medicines' },
      { status: 500 }
    )
  }
}
