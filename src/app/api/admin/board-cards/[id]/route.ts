import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// PUT /api/admin/board-cards/[id] - Update board card
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const body = await req.json()
    const { type, title, content, imageUrl, icon, link, color, isActive, order } = body

    const existing = await prisma.boardCard.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Board card not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.boardCard.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(icon !== undefined && { icon }),
        ...(link !== undefined && { link }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order: parseInt(order) })
      }
    })

    return NextResponse.json({
      message: 'Board card updated successfully',
      card: updated
    })
  } catch (error) {
    console.error('Error updating board card:', error)
    return NextResponse.json(
      { error: 'Failed to update board card' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/board-cards/[id] - Delete board card
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const existing = await prisma.boardCard.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Board card not found' },
        { status: 404 }
      )
    }

    await prisma.boardCard.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Board card deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting board card:', error)
    return NextResponse.json(
      { error: 'Failed to delete board card' },
      { status: 500 }
    )
  }
}
