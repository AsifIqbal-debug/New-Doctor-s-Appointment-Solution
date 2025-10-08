import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// GET /api/admin/board-cards - Get all board cards
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const cards = await prisma.boardCard.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Error fetching board cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board cards' },
      { status: 500 }
    )
  }
}

// POST /api/admin/board-cards - Create new board card
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
    const { type, title, content, imageUrl, icon, link, color, isActive, order } = body

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields (type, title, content)' },
        { status: 400 }
      )
    }

    const card = await prisma.boardCard.create({
      data: {
        type,
        title,
        content,
        imageUrl: imageUrl || null,
        icon: icon || null,
        link: link || null,
        color: color || null,
        isActive: isActive !== undefined ? isActive : true,
        order: order !== undefined ? parseInt(order) : 0
      }
    })

    return NextResponse.json({
      message: 'Board card created successfully',
      card
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating board card:', error)
    return NextResponse.json(
      { error: 'Failed to create board card' },
      { status: 500 }
    )
  }
}
