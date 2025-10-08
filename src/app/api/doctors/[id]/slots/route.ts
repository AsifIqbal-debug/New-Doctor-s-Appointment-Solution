import { NextRequest, NextResponse } from 'next/server'
import { getFreeSlots } from '@/lib/slots'
import { toDhaka } from '@/lib/time'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required (YYYY-MM-DD format)' },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const slots = await getFreeSlots(id, date)

    // Convert UTC times to local display format
    const slotsWithLocalTime = slots.map((slot, index) => ({
      id: index,
      startsAt: slot.startUTC,
      endsAt: slot.endUTC,
      startTime: toDhaka(slot.startUTC).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      endTime: toDhaka(slot.endUTC).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }))

    return NextResponse.json(slotsWithLocalTime)
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}