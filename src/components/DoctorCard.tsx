import Link from 'next/link'
import { specialtyCategories } from './category-filter'

interface Doctor {
  id: string
  specialty?: string
  user: {
    name: string
  }
}

interface DoctorCardProps {
  doctor: Doctor
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  // Find matching specialty category for emoji
  const specialtyInfo = specialtyCategories.find(cat => cat.name === doctor.specialty)
  
  return (
    <div className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderWidth: '1px', color: 'var(--card-foreground)'}}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {specialtyInfo && (
              <span className="text-lg" role="img" aria-label={specialtyInfo.name}>
                {specialtyInfo.emoji}
              </span>
            )}
            <h3 className="text-lg font-semibold" style={{color: 'var(--card-foreground)'}}>
              {doctor.user.name}
            </h3>
          </div>
          <p className="text-sm mb-4 opacity-75" style={{color: 'var(--card-foreground)'}}>
            {doctor.specialty || 'General Practitioner'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--secondary)'}}>
          <span className="font-semibold text-lg" style={{color: 'var(--primary)'}}>
            {doctor.user.name.charAt(0)}
          </span>
        </div>
      </div>
      
      <Link
        href={`/book/${doctor.id}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
        style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)'}}
      >
        Book Appointment
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}