import { addMinutes } from 'date-fns'

const DHAKA_TZ_OFFSET_MIN = 6 * 60 // UTC+6 (no DST)

export function toUTC(dateLocal: Date): Date {
  return new Date(dateLocal.getTime() - DHAKA_TZ_OFFSET_MIN * 60000)
}

export function toDhaka(dateUTC: Date): Date {
  return new Date(dateUTC.getTime() + DHAKA_TZ_OFFSET_MIN * 60000)
}

export function addMin(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}