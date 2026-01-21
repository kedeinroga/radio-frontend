/**
 * AdCampaign Entity
 * 
 * Representa una campaña publicitaria que agrupa múltiples anuncios.
 */
export interface AdCampaign {
  // Identificación
  id: string
  advertiserId: string
  
  // Información básica
  name: string
  description?: string
  
  // Budget
  totalBudgetCents: number
  dailyBudgetCents?: number
  spentCents: number
  
  // Fechas
  startDate: Date
  endDate: Date
  
  // Estado
  status: 'draft' | 'active' | 'paused' | 'completed'
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Factory para crear una nueva entidad AdCampaign
 */
export function createAdCampaign(
  data: Partial<AdCampaign> & Pick<AdCampaign, 'id' | 'name' | 'totalBudgetCents' | 'advertiserId'>
): AdCampaign {
  const now = new Date()
  
  return {
    id: data.id,
    advertiserId: data.advertiserId,
    name: data.name,
    description: data.description,
    totalBudgetCents: data.totalBudgetCents,
    dailyBudgetCents: data.dailyBudgetCents,
    spentCents: data.spentCents ?? 0,
    startDate: data.startDate || now,
    endDate: data.endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 días
    status: data.status || 'draft',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  }
}

/**
 * Verifica si la campaña está activa
 */
export function isAdCampaignActive(campaign: AdCampaign): boolean {
  const now = new Date()
  
  return (
    campaign.status === 'active' &&
    campaign.startDate <= now &&
    campaign.endDate >= now &&
    campaign.spentCents < campaign.totalBudgetCents
  )
}

/**
 * Calcula el budget restante de la campaña
 */
export function getAdCampaignRemainingBudget(campaign: AdCampaign): number {
  return Math.max(0, campaign.totalBudgetCents - campaign.spentCents)
}

/**
 * Calcula el porcentaje del budget utilizado
 */
export function getAdCampaignBudgetUsagePercentage(campaign: AdCampaign): number {
  if (campaign.totalBudgetCents === 0) return 0
  return (campaign.spentCents / campaign.totalBudgetCents) * 100
}

/**
 * Verifica si la campaña ha alcanzado su budget diario
 */
export function hasAdCampaignReachedDailyBudget(
  campaign: AdCampaign,
  todaySpent: number
): boolean {
  if (!campaign.dailyBudgetCents) return false
  return todaySpent >= campaign.dailyBudgetCents
}
