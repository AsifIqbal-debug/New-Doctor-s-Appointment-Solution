import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Medication {
  name: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
}

interface PrescriptionData {
  prescriptionId: string
  date: string
  patientName: string
  patientAge?: string | number
  patientGender?: string
  patientId: string
  patientPhone?: string
  doctorName: string
  doctorSpecialty: string
  doctorQualification?: string
  doctorRegistration?: string
  medications: Medication[]
  diagnosis?: string
  advice?: string
  followUpDate?: string
  clinicName?: string
  clinicAddress?: string
  clinicPhone?: string
  clinicEmail?: string
}

function parseFrequency(frequency: string): string {
  // Keep M+A+N format as-is (e.g., "1+1+1", "1+0+1", "2+2+2")
  // Just return the frequency directly in the 1+1+1 format
  if (frequency && frequency.match(/^\d+\+\d+\+\d+$/)) {
    return frequency // Return as-is: "1+1+1"
  }
  
  // Return original if not in M+A+N format
  return frequency || 'As directed'
}

export function generatePrescriptionPDF(data: PrescriptionData) {
  const doc = new jsPDF()
  
  // Clinic Info
  const clinicName = data.clinicName || 'Healthcare Clinic'
  const clinicAddress = data.clinicAddress || '123 Medical Street, Dhaka'
  const clinicPhone = data.clinicPhone || '+880-1234-567890'
  const clinicEmail = data.clinicEmail || 'info@clinic.local'
  
  // Colors
  const primaryColor: [number, number, number] = [20, 184, 166] // Teal
  const darkGray: [number, number, number] = [75, 75, 75]
  const lightGray: [number, number, number] = [240, 240, 240]
  
  // Header with clinic info
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 45, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(clinicName, 105, 15, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(clinicAddress, 105, 23, { align: 'center' })
  doc.text(`Phone: ${clinicPhone} | Email: ${clinicEmail}`, 105, 29, { align: 'center' })
  
  // Prescription title with Rx symbol
  doc.setFontSize(32)
  doc.setFont('times', 'italic')
  doc.text('℞', 105, 40, { align: 'center' })
  
  // Doctor info section
  doc.setTextColor(...darkGray)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`Dr. ${data.doctorName}`, 20, 55)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(data.doctorSpecialty, 20, 61)
  if (data.doctorQualification) {
    doc.text(data.doctorQualification, 20, 66)
  }
  if (data.doctorRegistration) {
    doc.text(`Reg. No: ${data.doctorRegistration}`, 20, data.doctorQualification ? 71 : 66)
  }
  
  // Prescription details (right side)
  doc.setFont('helvetica', 'bold')
  doc.text('Date:', 150, 55)
  doc.text('Prescription ID:', 150, 61)
  
  doc.setFont('helvetica', 'normal')
  doc.text(data.date, 173, 55)
  doc.text(data.prescriptionId.substring(0, 10) + '...', 173, 61)
  
  // Horizontal line
  const lineY = data.doctorRegistration ? 78 : (data.doctorQualification ? 73 : 68)
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(1)
  doc.line(20, lineY, 190, lineY)
  
  // Patient information section
  let currentY = lineY + 10
  
  doc.setFillColor(...lightGray)
  doc.rect(20, currentY, 170, 7, 'F')
  
  doc.setTextColor(...darkGray)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient Information', 25, currentY + 5)
  
  currentY += 12
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Patient details in two columns
  doc.setFont('helvetica', 'bold')
  doc.text('Name:', 25, currentY)
  doc.text('Patient ID:', 25, currentY + 7)
  
  doc.setFont('helvetica', 'normal')
  doc.text(data.patientName, 50, currentY)
  doc.text(data.patientId.substring(0, 15) + '...', 50, currentY + 7)
  
  if (data.patientAge || data.patientGender || data.patientPhone) {
    doc.setFont('helvetica', 'bold')
    if (data.patientAge) doc.text('Age:', 110, currentY)
    if (data.patientGender) doc.text('Gender:', 110, currentY + 7)
    
    doc.setFont('helvetica', 'normal')
    if (data.patientAge) doc.text(String(data.patientAge), 125, currentY)
    if (data.patientGender) doc.text(data.patientGender, 130, currentY + 7)
    
    if (data.patientPhone) {
      doc.setFont('helvetica', 'bold')
      doc.text('Phone:', 25, currentY + 14)
      doc.setFont('helvetica', 'normal')
      doc.text(data.patientPhone, 50, currentY + 14)
      currentY += 7
    }
  }
  
  currentY += 15
  
  // Diagnosis section (if provided)
  if (data.diagnosis) {
    doc.setFillColor(...lightGray)
    doc.rect(20, currentY, 170, 7, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.text('Diagnosis', 25, currentY + 5)
    
    currentY += 12
    doc.setFont('helvetica', 'normal')
    const diagnosisLines = doc.splitTextToSize(data.diagnosis, 165)
    doc.text(diagnosisLines, 25, currentY)
    currentY += (diagnosisLines.length * 5) + 8
  }
  
  // Medications section
  doc.setFillColor(...lightGray)
  doc.rect(20, currentY, 170, 7, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.text('Medications', 25, currentY + 5)
  
  currentY += 12
  
  // Medications table
  const medicationRows = data.medications.map((med, index) => {
    const freqText = med.frequency ? parseFrequency(med.frequency) : 'As directed'
    const doseText = med.dosage || 'As directed'
    const durationText = med.duration || '-'
    const instructionsText = med.instructions || '-'
    
    return [
      String(index + 1),
      med.name,
      doseText,
      freqText,
      durationText,
      instructionsText
    ]
  })
  
  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Medicine', 'Dosage', 'Frequency\n(M+A+N)', 'Duration', 'Instructions']],
    body: medicationRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35, halign: 'center' }, // Center align frequency for clarity
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 40 }
    },
    margin: { left: 20, right: 20 }
  })
  
  currentY = (doc as any).lastAutoTable.finalY + 5
  
  // Add frequency format legend
  doc.setTextColor(...darkGray)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.text('Note: Frequency format is M+A+N (Morning + Afternoon + Night). Example: 1+0+1 means 1 in morning, 0 at afternoon, 1 at night', 25, currentY)
  currentY += 10
  
  // Advice section
  if (data.advice && currentY < 250) {
    doc.setFillColor(...lightGray)
    doc.rect(20, currentY, 170, 7, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Medical Advice', 25, currentY + 5)
    
    currentY += 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const adviceLines = doc.splitTextToSize(data.advice, 165)
    doc.text(adviceLines, 25, currentY)
    currentY += (adviceLines.length * 4) + 8
  }
  
  // Follow-up date
  if (data.followUpDate && currentY < 260) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(`Follow-up Date: `, 25, currentY)
    doc.setFont('helvetica', 'normal')
    doc.text(data.followUpDate, 60, currentY)
    currentY += 10
  }
  
  // Doctor signature section
  if (currentY < 265) {
    doc.setDrawColor(...darkGray)
    doc.setLineWidth(0.5)
    doc.line(130, currentY + 15, 180, currentY + 15)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(`Dr. ${data.doctorName}`, 155, currentY + 20, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(data.doctorSpecialty, 155, currentY + 25, { align: 'center' })
  }
  
  // Footer
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.5)
  doc.line(20, 280, 190, 280)
  
  doc.setTextColor(...darkGray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('This is a digitally generated prescription. Please keep it safe for future reference.', 105, 285, { align: 'center' })
  doc.text('For any queries, please contact the clinic at the above mentioned contact details.', 105, 290, { align: 'center' })
  
  return doc
}

export function downloadPrescription(data: PrescriptionData, filename?: string) {
  const doc = generatePrescriptionPDF(data)
  const fileName = filename || `Prescription_${data.patientName.replace(/\s+/g, '_')}_${data.date.replace(/\//g, '-')}.pdf`
  doc.save(fileName)
}

export function printPrescription(data: PrescriptionData) {
  const doc = generatePrescriptionPDF(data)
  doc.autoPrint()
  window.open(doc.output('bloburl'), '_blank')
}
