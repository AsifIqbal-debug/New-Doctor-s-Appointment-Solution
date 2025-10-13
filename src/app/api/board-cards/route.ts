import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/board-cards - Public endpoint to get active board cards
export async function GET() {
  try {
    const cards = await prisma.boardCard.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Error fetching board cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board cards', cards: [] },
      { status: 500 }
    )
  }
}
