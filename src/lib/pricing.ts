import { prisma } from './db'

export interface FeeCalculationResult {
  fee: number
  rule: string
}

export async function computeFee(
  doctorId: string, 
  patientId: string
): Promise<FeeCalculationResult> {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { 
      priceRuleSet: { 
        select: { rulesJson: true } 
      } 
    }
  })

  const defaultRules = {
    window_days: 30,
    first_visit_fee: 1500,
    within_window_fee: 1000,
    outside_window_fee: 1500,
  }

  const rules = doctor?.priceRuleSet?.rulesJson as any || defaultRules

  // Find the last completed visit for this patient with this doctor
  const lastVisit = await prisma.visit.findFirst({
    where: { 
      appointment: { 
        patientId, 
        doctorId, 
        status: 'COMPLETED' 
      } 
    },
    orderBy: { visitDate: 'desc' },
    select: { visitDate: true }
  })

  if (!lastVisit) {
    return { fee: rules.first_visit_fee, rule: 'first_visit' }
  }

  const daysSinceLastVisit = (Date.now() - new Date(lastVisit.visitDate).getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSinceLastVisit <= (rules.window_days || 30)) {
    return { fee: rules.within_window_fee, rule: 'within_window' }
  }

  return { fee: rules.outside_window_fee, rule: 'outside_window' }
}