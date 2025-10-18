import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding medicines...')
  
  const medicines = [
    // Paracetamol (Napa - Beximco)
    { name: 'Napa', genericName: 'Paracetamol', strength: '500mg', form: 'Tablet', manufacturer: 'Beximco Pharmaceuticals', price: 0.80 },
    { name: 'Napa', genericName: 'Paracetamol', strength: '100mg/5ml', form: 'Syrup', manufacturer: 'Beximco Pharmaceuticals', price: 25.00 },
    { name: 'Napa Extend', genericName: 'Paracetamol', strength: '665mg', form: 'Extended Release Tablet', manufacturer: 'Beximco Pharmaceuticals', price: 3.50 },
    
    // Paracetamol (Ace - Square)
    { name: 'Ace', genericName: 'Paracetamol', strength: '500mg', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 0.75 },
    { name: 'Ace Plus', genericName: 'Paracetamol + Caffeine', strength: '500mg+65mg', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 2.00 },
    
    // Omeprazole (Seclo - Square)
    { name: 'Seclo', genericName: 'Omeprazole', strength: '20mg', form: 'Capsule', manufacturer: 'Square Pharmaceuticals', price: 6.00 },
    { name: 'Seclo', genericName: 'Omeprazole', strength: '40mg', form: 'Capsule', manufacturer: 'Square Pharmaceuticals', price: 10.00 },
    
    // Omeprazole (Losectil - Incepta)
    { name: 'Losectil', genericName: 'Omeprazole', strength: '20mg', form: 'Capsule', manufacturer: 'Incepta Pharmaceuticals', price: 5.50 },
    
    // Ranitidine (Entacid - Renata)
    { name: 'Entacid', genericName: 'Ranitidine', strength: '150mg', form: 'Tablet', manufacturer: 'Renata Limited', price: 3.00 },
    
    // Metformin (Glucomet - Square)
    { name: 'Glucomet', genericName: 'Metformin', strength: '500mg', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 2.50 },
    { name: 'Glucomet', genericName: 'Metformin', strength: '850mg', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 3.50 },
    
    // Amlodipine (Amdocal - Incepta)
    { name: 'Amdocal', genericName: 'Amlodipine', strength: '5mg', form: 'Tablet', manufacturer: 'Incepta Pharmaceuticals', price: 4.00 },
    { name: 'Amdocal', genericName: 'Amlodipine', strength: '10mg', form: 'Tablet', manufacturer: 'Incepta Pharmaceuticals', price: 6.00 },
    
    // Atorvastatin (Atorva - Square)
    { name: 'Atorva', genericName: 'Atorvastatin', strength: '10mg', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 8.00 },
    { name: 'Atorva', genericName: 'Atorvastatin', strength: '20mg', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 12.00 },
    
    // Cetirizine (Alecet - Beximco)
    { name: 'Alecet', genericName: 'Cetirizine', strength: '10mg', form: 'Tablet', manufacturer: 'Beximco Pharmaceuticals', price: 2.00 },
    
    // Azithromycin (Azithrocin - ACI)
    { name: 'Azithrocin', genericName: 'Azithromycin', strength: '500mg', form: 'Tablet', manufacturer: 'ACI Limited', price: 35.00 },
    { name: 'Azithrocin', genericName: 'Azithromycin', strength: '250mg', form: 'Capsule', manufacturer: 'ACI Limited', price: 20.00 },
    
    // Amoxicillin (Amoxicap - Square)
    { name: 'Amoxicap', genericName: 'Amoxicillin', strength: '500mg', form: 'Capsule', manufacturer: 'Square Pharmaceuticals', price: 8.00 },
    { name: 'Amoxicap', genericName: 'Amoxicillin', strength: '250mg', form: 'Capsule', manufacturer: 'Square Pharmaceuticals', price: 5.00 },
    
    // Cefixime (Cefo - Renata)
    { name: 'Cefo', genericName: 'Cefixime', strength: '200mg', form: 'Tablet', manufacturer: 'Renata Limited', price: 25.00 },
    { name: 'Cefo', genericName: 'Cefixime', strength: '400mg', form: 'Capsule', manufacturer: 'Renata Limited', price: 40.00 },
    
    // Montelukast (Montene - Healthcare)
    { name: 'Montene', genericName: 'Montelukast', strength: '10mg', form: 'Tablet', manufacturer: 'Healthcare Pharmaceuticals', price: 12.00 },
    
    // Losartan (Losar - Incepta)
    { name: 'Losar', genericName: 'Losartan', strength: '50mg', form: 'Tablet', manufacturer: 'Incepta Pharmaceuticals', price: 6.00 },
    { name: 'Losar', genericName: 'Losartan', strength: '100mg', form: 'Tablet', manufacturer: 'Incepta Pharmaceuticals', price: 10.00 },
    
    // Pantoprazole (Pentazol - Healthcare)
    { name: 'Pentazol', genericName: 'Pantoprazole', strength: '20mg', form: 'Tablet', manufacturer: 'Healthcare Pharmaceuticals', price: 5.00 },
    { name: 'Pentazol', genericName: 'Pantoprazole', strength: '40mg', form: 'Tablet', manufacturer: 'Healthcare Pharmaceuticals', price: 8.00 },
    
    // Fexofenadine (Fexo - Square)
    { name: 'Fexo', genericName: 'Fexofenadine', strength: '120mg', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 8.00 },
    
    // Ciprofloxacin (Ciprocin - Square)
    { name: 'Ciprocin', genericName: 'Ciprofloxacin', strength: '500mg', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 10.00 },
    
    // Domperidone (Domidon - Square)
    { name: 'Domidon', genericName: 'Domperidone', strength: '10mg', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 2.50 },
    
    // Esomeprazole (Esomep - ACI)
    { name: 'Esomep', genericName: 'Esomeprazole', strength: '20mg', form: 'Tablet', manufacturer: 'ACI Limited', price: 8.00 },
    { name: 'Esomep', genericName: 'Esomeprazole', strength: '40mg', form: 'Tablet', manufacturer: 'ACI Limited', price: 12.00 },
    
    // Vitamin supplements
    { name: 'Sergel', genericName: 'Calcium Carbonate + Vitamin D3', strength: '500mg+200IU', form: 'Tablet', manufacturer: 'Square Pharmaceuticals', price: 5.00 },
    { name: 'Oracal D', genericName: 'Calcium + Vitamin D3', strength: '500mg+200IU', form: 'Tablet', manufacturer: 'ACI Limited', price: 4.50 },
    { name: 'B-50', genericName: 'Vitamin B Complex', strength: 'High Potency', form: 'Capsule', manufacturer: 'Square Pharmaceuticals', price: 3.00 },
  ]

  let created = 0
  let updated = 0

  for (const medicine of medicines) {
    const id = `${medicine.name}-${medicine.strength}-${medicine.form}`.toLowerCase().replace(/\s+/g, '-')
    
    const result = await prisma.medicine.upsert({
      where: { id },
      update: medicine,
      create: { ...medicine, id }
    })
    
    if (result.createdAt === result.updatedAt) {
      created++
    } else {
      updated++
    }
  }

  console.log(`✅ Medicine seeding complete!`)
  console.log(`   Created: ${created} new medicines`)
  console.log(`   Updated: ${updated} existing medicines`)
  console.log(`   Total: ${medicines.length} medicines in database`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding medicines:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
