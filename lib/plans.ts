import { Plan, PLAN_LIMITS } from '@/types'

export function getNextPlan(current: Plan): Plan | null {
  if (current === 'free') return 'premium'
  if (current === 'premium') return 'premium_plus'
  return null
}

export function getStorageUsagePercent(order: {
  photo_count: number
  video_count: number
  plan: Plan
}): number {
  const limits = PLAN_LIMITS[order.plan]
  const photoPercent = limits.photos === Infinity ? 0 : order.photo_count / limits.photos
  const videoPercent = limits.videos === 0
    ? (order.video_count > 0 ? 1 : 0)
    : order.video_count / limits.videos
  return Math.max(photoPercent, videoPercent) * 100
}

export function isAtUpgradeThreshold(usagePercent: number): boolean {
  return usagePercent >= 90
}

export function getExpiresAt(plan: Plan): Date {
  const days = PLAN_LIMITS[plan].days
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}
