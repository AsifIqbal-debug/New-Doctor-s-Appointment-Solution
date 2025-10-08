import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface InvoiceData {
  invoiceNumber: string
  date: string
  patientName: string
  patientId: string
  doctorName: string
  doctorSpecialty: string
  appointmentDate: string
  appointmentTime: string
  consultationFee: number
  discount?: number
  tax?: number
  totalAmount: number
  paymentMethod?: string
  transactionId?: string
  clinicName?: string
  clinicAddress?: string
  clinicPhone?: string
  clinicEmail?: string
}

export function generateInvoicePDF(data: InvoiceData) {
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
  
  // Header with clinic name
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(clinicName, 105, 15, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(clinicAddress, 105, 22, { align: 'center' })
  doc.text(`Phone: ${clinicPhone} | Email: ${clinicEmail}`, 105, 28, { align: 'center' })
  
  // Invoice title
  doc.setTextColor(...darkGray)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 105, 50, { align: 'center' })
  
  // Invoice details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Left column - Invoice info
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Number:', 20, 65)
  doc.text('Invoice Date:', 20, 72)
  doc.text('Payment Method:', 20, 79)
  if (data.transactionId) {
    doc.text('Transaction ID:', 20, 86)
  }
  
  doc.setFont('helvetica', 'normal')
  doc.text(data.invoiceNumber, 60, 65)
  doc.text(data.date, 60, 72)
  doc.text(data.paymentMethod || 'Cash', 60, 79)
  if (data.transactionId) {
    doc.text(data.transactionId, 60, 86)
  }
  
  // Right column - Patient info
  doc.setFont('helvetica', 'bold')
  doc.text('Patient Name:', 110, 65)
  doc.text('Patient ID:', 110, 72)
  doc.text('Appointment Date:', 110, 79)
  doc.text('Appointment Time:', 110, 86)
  
  doc.setFont('helvetica', 'normal')
  doc.text(data.patientName, 150, 65)
  doc.text(data.patientId.substring(0, 12) + '...', 150, 72)
  doc.text(data.appointmentDate, 150, 79)
  doc.text(data.appointmentTime, 150, 86)
  
  // Doctor info section
  const startY = data.transactionId ? 100 : 95
  doc.setFillColor(...lightGray)
  doc.rect(20, startY, 170, 20, 'F')
  
  doc.setTextColor(...darkGray)
  doc.setFont('helvetica', 'bold')
  doc.text('Doctor Information', 25, startY + 7)
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Dr. ${data.doctorName}`, 25, startY + 14)
  doc.text(`Specialty: ${data.doctorSpecialty}`, 120, startY + 14)
  
  // Services table
  const tableStartY = startY + 30
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Amount (BDT)']],
    body: [
      ['Consultation Fee', data.consultationFee.toFixed(2)],
      ...(data.discount ? [['Discount', `-${data.discount.toFixed(2)}`]] : []),
      ...(data.tax ? [['Tax', data.tax.toFixed(2)]] : []),
    ],
    foot: [['Total Amount', data.totalAmount.toFixed(2)]],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center'
    },
    footStyles: {
      fillColor: darkGray,
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'right'
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: 'right', cellWidth: 50 }
    },
    margin: { left: 20, right: 20 }
  })
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 60
  
  // Payment received stamp
  doc.setFillColor(34, 197, 94) // Green
  doc.setDrawColor(34, 197, 94)
  doc.setLineWidth(2)
  doc.roundedRect(70, finalY + 15, 70, 20, 3, 3, 'FD')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT RECEIVED', 105, finalY + 27, { align: 'center' })
  
  // Terms and conditions
  doc.setTextColor(...darkGray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Thank you for your payment!', 105, finalY + 45, { align: 'center' })
  doc.text('This is a computer-generated invoice and does not require a signature.', 105, finalY + 50, { align: 'center' })
  
  // Horizontal line at bottom
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.5)
  doc.line(20, 280, 190, 280)
  
  doc.setFontSize(8)
  doc.text('For any queries, please contact us at the above mentioned phone or email.', 105, 285, { align: 'center' })
  
  return doc
}

export function downloadInvoice(data: InvoiceData, filename?: string) {
  const doc = generateInvoicePDF(data)
  const fileName = filename || `Invoice_${data.invoiceNumber}_${data.patientName.replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}

export function printInvoice(data: InvoiceData) {
  const doc = generateInvoicePDF(data)
  doc.autoPrint()
  window.open(doc.output('bloburl'), '_blank')
}
