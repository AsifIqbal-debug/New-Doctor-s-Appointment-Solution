import { prisma } from './db'
import { addMin, toUTC } from './time'

export interface TimeSlot {
  startUTC: Date
  endUTC: Date
}

export async function getFreeSlots(
  doctorId: string, 
  dateISO: string
): Promise<TimeSlot[]> {
  // Parse the date (YYYY-MM-DD format)
  const date = new Date(dateISO + 'T00:00:00')
  const weekday = date.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Get doctor's availability for this weekday
  const availability = await prisma.doctorAvailability.findFirst({
    where: { 
      doctorId, 
      weekday, 
      isActive: true 
    }
  })

  if (!availability) {
    return []
  }

  // Check if doctor has a day off
  const dayOff = await prisma.doctorDayOff.findFirst({
    where: {
      doctorId,
      date: {
        gte: new Date(dateISO + 'T00:00:00'),
        lt: new Date(dateISO + 'T23:59:59')
      }
    }
  })

  if (dayOff) {
    return []
  }

  // Parse start and end times
  const [startHour, startMinute] = availability.startTime.split(':').map(Number)
  const [endHour, endMinute] = availability.endTime.split(':').map(Number)
  
  const startLocal = new Date(date)
  startLocal.setHours(startHour, startMinute, 0, 0)
  
  const endLocal = new Date(date)
  endLocal.setHours(endHour, endMinute, 0, 0)

  // Get doctor's slot duration
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { defaultSlotMinutes: true }
  })
  
  const slotMinutes = doctor?.defaultSlotMinutes ?? 15

  // Get existing appointments for this date
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      startsAt: {
        gte: toUTC(startLocal),
        lt: toUTC(endLocal)
      },
      status: {
        in: ['BOOKED', 'COMPLETED']
      }
    },
    select: { startsAt: true }
  })

  // Create a set of busy time slots
  const busySlots = new Set(
    existingAppointments.map(appt => new Date(appt.startsAt).getTime())
  )

  // Generate available slots
  const availableSlots: TimeSlot[] = []
  
  for (let current = new Date(startLocal); current < endLocal; current = addMin(current, slotMinutes)) {
    const startUTC = toUTC(current)
    
    if (!busySlots.has(startUTC.getTime())) {
      availableSlots.push({
        startUTC,
        endUTC: addMin(startUTC, slotMinutes)
      })
    }
  }

  return availableSlots
}