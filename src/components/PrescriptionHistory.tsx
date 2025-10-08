"use client"

import { useState } from 'react'
import FrequencyDisplay from './FrequencyDisplay'
import { downloadPrescription, printPrescription } from '@/lib/pdf'

interface Medication {
  name: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
}

interface Prescription {
  id: string
  appointmentId: string
  doctorId: string
  patientId: string
  itemsJson: any
  advice?: string
  attachmentUrl?: string
  createdAt?: string
  appointment: {
    startsAt: string
    doctor?: {
      user: {
        name: string
      }
      specialty: string
    }
    patient?: {
      user: {
        name: string
      }
    }
  }
}

interface PrescriptionHistoryProps {
  prescriptions: Prescription[]
  userRole?: 'DOCTOR' | 'PATIENT' | 'ADMIN'
}

export default function PrescriptionHistory({ prescriptions, userRole = 'PATIENT' }: PrescriptionHistoryProps) {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMedications = (prescription: Prescription): Medication[] => {
    try {
      console.log('📋 Parsing prescription:', prescription.id)
      console.log('📦 Raw itemsJson type:', typeof prescription.itemsJson)
      console.log('📦 Raw itemsJson:', JSON.stringify(prescription.itemsJson, null, 2))
      
      // Handle string JSON
      if (typeof prescription.itemsJson === 'string') {
        const parsed = JSON.parse(prescription.itemsJson)
        console.log('✅ Parsed from string:', parsed)
        // Check if it's an array directly or nested under medications
        if (Array.isArray(parsed)) {
          console.log('✅ Found array directly, length:', parsed.length)
          return parsed
        }
        if (parsed.medications && Array.isArray(parsed.medications)) {
          console.log('✅ Found medications array, length:', parsed.medications.length)
          return parsed.medications
        }
        console.warn('⚠️ Unexpected structure after parsing string')
        return []
      }
      
      // Handle object
      if (prescription.itemsJson) {
        console.log('📦 itemsJson is object/array')
        // Check if it's an array directly or nested under medications
        if (Array.isArray(prescription.itemsJson)) {
          console.log('✅ itemsJson is array, length:', prescription.itemsJson.length)
          return prescription.itemsJson
        }
        if (prescription.itemsJson.medications && Array.isArray(prescription.itemsJson.medications)) {
          console.log('✅ Found nested medications, length:', prescription.itemsJson.medications.length)
          return prescription.itemsJson.medications
        }
        console.warn('⚠️ Unexpected itemsJson structure:', prescription.itemsJson)
      }
      
      console.warn('⚠️ No medications found in prescription')
      return []
    } catch (error) {
      console.error('❌ Error parsing medications:', error)
      console.error('❌ itemsJson value:', prescription.itemsJson)
      return []
    }
  }

  const getAdvice = (prescription: Prescription): string => {
    try {
      if (typeof prescription.itemsJson === 'string') {
        const parsed = JSON.parse(prescription.itemsJson)
        return parsed.advice || prescription.advice || ''
      }
      return prescription.itemsJson?.advice || prescription.advice || ''
    } catch {
      return prescription.advice || ''
    }
  }

  const sortedPrescriptions = [...prescriptions].sort((a, b) => 
    new Date(b.appointment.startsAt).getTime() - new Date(a.appointment.startsAt).getTime()
  )

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handlePrintPrescription = (prescription: Prescription) => {
    const medications = getMedications(prescription)
    const advice = getAdvice(prescription)
    
    const prescriptionData = {
      prescriptionId: prescription.id,
      date: formatDate(prescription.appointment.startsAt),
      patientName: prescription.appointment.patient?.user.name || 'Unknown Patient',
      patientId: prescription.patientId,
      doctorName: prescription.appointment.doctor?.user.name || 'Unknown Doctor',
      doctorSpecialty: prescription.appointment.doctor?.specialty || 'General',
      medications: medications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions
      })),
      advice: advice,
      clinicName: 'Healthcare Clinic',
      clinicAddress: '123 Medical Street, Dhaka, Bangladesh',
      clinicPhone: '+880-1234-567890',
      clinicEmail: 'info@clinic.local'
    }
    
    printPrescription(prescriptionData)
  }

  const handleDownloadPrescription = (prescription: Prescription) => {
    const medications = getMedications(prescription)
    const advice = getAdvice(prescription)
    
    const prescriptionData = {
      prescriptionId: prescription.id,
      date: formatDate(prescription.appointment.startsAt),
      patientName: prescription.appointment.patient?.user.name || 'Unknown Patient',
      patientId: prescription.patientId,
      doctorName: prescription.appointment.doctor?.user.name || 'Unknown Doctor',
      doctorSpecialty: prescription.appointment.doctor?.specialty || 'General',
      medications: medications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions
      })),
      advice: advice,
      clinicName: 'Healthcare Clinic',
      clinicAddress: '123 Medical Street, Dhaka, Bangladesh',
      clinicPhone: '+880-1234-567890',
      clinicEmail: 'info@clinic.local'
    }
    
    downloadPrescription(prescriptionData)
  }

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>
          No Prescription History
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Prescription history will appear here once created
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline View */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-accent/50 to-transparent" />

        {sortedPrescriptions.map((prescription, index) => {
          const medications = getMedications(prescription)
          const advice = getAdvice(prescription)
          const isExpanded = expandedId === prescription.id
          const isLatest = index === 0

          return (
            <div key={prescription.id} className="relative pl-20 pb-8">
              {/* Timeline Dot */}
              <div 
                className={`absolute left-6 top-6 w-5 h-5 rounded-full border-4 transition-all ${
                  isLatest 
                    ? 'bg-accent border-accent shadow-lg shadow-accent/50 animate-pulse' 
                    : 'bg-card border-border'
                }`}
                style={{
                  borderColor: isLatest ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: isLatest ? 'var(--accent)' : 'var(--card)'
                }}
              />

              {/* Prescription Card */}
              <div 
                className={`rounded-lg border shadow-sm transition-all duration-200 ${
                  isLatest ? 'ring-2 ring-accent ring-opacity-50' : ''
                }`}
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: isLatest ? 'var(--accent)' : 'var(--border)'
                }}
              >
                {/* Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-background-secondary transition-colors"
                  onClick={() => toggleExpand(prescription.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isLatest && (
                        <div className="inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2"
                          style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--accent-foreground)'
                          }}
                        >
                          Latest Prescription
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold" style={{color: 'var(--foreground)'}}>
                          {formatDate(prescription.appointment.startsAt)}
                        </h3>
                        <span className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
                          {formatTime(prescription.appointment.startsAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm" style={{color: 'var(--foreground-secondary)'}}>
                        {userRole !== 'DOCTOR' && prescription.appointment.doctor && (
                          <>
                            <div className="flex items-center gap-1">
                              <span>👨‍⚕️</span>
                              <span>{prescription.appointment.doctor.user.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>🏥</span>
                              <span>{prescription.appointment.doctor.specialty}</span>
                            </div>
                          </>
                        )}
                        {userRole === 'DOCTOR' && prescription.appointment.patient && (
                          <div className="flex items-center gap-1">
                            <span>👤</span>
                            <span>{prescription.appointment.patient.user.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>💊</span>
                          <span>{medications.length} {medications.length === 1 ? 'medication' : 'medications'}</span>
                        </div>
                      </div>
                    </div>
                    <button className="ml-4 p-2 rounded-lg hover:bg-background-secondary transition-colors">
                      <svg 
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{color: 'var(--foreground)'}}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t" style={{borderColor: 'var(--border)'}}>
                    <div className="p-4 space-y-4">
                      {/* Medications */}
                      {medications.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{color: 'var(--foreground)'}}>
                            <span>💊</span>
                            <span>Medications</span>
                          </h4>
                          <div className="space-y-3">
                            {medications.map((medication, medIndex) => (
                              <div 
                                key={medIndex} 
                                className="p-3 rounded-lg border"
                                style={{
                                  backgroundColor: 'var(--background)',
                                  borderColor: 'var(--border)'
                                }}
                              >
                                <div className="font-medium mb-2" style={{color: 'var(--foreground)'}}>
                                  {medication.name}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  {medication.dosage && (
                                    <div style={{color: 'var(--foreground-secondary)'}}>
                                      <span className="font-medium">Dosage:</span> {medication.dosage}
                                    </div>
                                  )}
                                  {medication.frequency && (
                                    <div>
                                      <FrequencyDisplay frequency={medication.frequency} />
                                    </div>
                                  )}
                                  {medication.duration && (
                                    <div style={{color: 'var(--foreground-secondary)'}}>
                                      <span className="font-medium">Duration:</span> {medication.duration}
                                    </div>
                                  )}
                                  {medication.instructions && (
                                    <div className="md:col-span-2" style={{color: 'var(--foreground-secondary)'}}>
                                      <span className="font-medium">Instructions:</span> {medication.instructions}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Doctor's Advice */}
                      {advice && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2" style={{color: 'var(--foreground)'}}>
                            <span>💡</span>
                            <span>Doctor's Advice</span>
                          </h4>
                          <div 
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: 'var(--background-secondary)',
                              color: 'var(--foreground-secondary)'
                            }}
                          >
                            {advice}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handlePrintPrescription(prescription)}
                          className="px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                          style={{
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                          title="Print Prescription"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print
                        </button>
                        <button
                          onClick={() => handleDownloadPrescription(prescription)}
                          className="px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                          style={{
                            borderColor: 'var(--border)',
                            color: 'var(--foreground)'
                          }}
                          title="Download PDF"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => setSelectedPrescription(prescription)}
                          className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm hover:opacity-90"
                          style={{
                            backgroundColor: 'var(--accent)',
                            color: 'white'
                          }}
                          title="View Full Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-lg text-center" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', border: '1px solid'}}>
          <div className="text-3xl font-bold mb-1" style={{color: 'var(--accent)'}}>
            {prescriptions.length}
          </div>
          <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
            Total Prescriptions
          </div>
        </div>
        <div className="p-4 rounded-lg text-center" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', border: '1px solid'}}>
          <div className="text-3xl font-bold mb-1" style={{color: 'var(--accent)'}}>
            {prescriptions.reduce((sum, p) => sum + getMedications(p).length, 0)}
          </div>
          <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
            Total Medications
          </div>
        </div>
        <div className="p-4 rounded-lg text-center" style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)', border: '1px solid'}}>
          <div className="text-3xl font-bold mb-1" style={{color: 'var(--accent)'}}>
            {new Set(
              prescriptions
                .filter(p => p.appointment?.doctor?.user?.name)
                .map(p => p.appointment.doctor!.user.name)
            ).size}
          </div>
          <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>
            Different Doctors
          </div>
        </div>
      </div>
    </div>
  )
}