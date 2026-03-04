export type Plan = 'free' | 'premium' | 'premium_plus'
export type MediaType = 'photo' | 'video'
export type Template = 'romantic' | 'modern' | 'rustic' | 'minimal'
export type Language = 'en' | 'fr' | 'de' | 'it' | 'es'

export const LANGUAGES: { value: Language; flag: string; label: string }[] = [
  { value: 'en', flag: '🇺🇸', label: 'English' },
  { value: 'fr', flag: '🇫🇷', label: 'Français' },
  { value: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { value: 'it', flag: '🇮🇹', label: 'Italiano' },
  { value: 'es', flag: '🇪🇸', label: 'Español' },
]

export interface Order {
  id: string
  slug: string
  couple_names: string
  event_date: string
  email: string | null
  plan: Plan
  storage_used: number
  photo_count: number
  video_count: number
  auto_upgrade_to_premium: boolean
  auto_upgrade_to_plus: boolean
  stripe_customer_id: string | null
  stripe_payment_method_id: string | null
  is_setup: boolean
  template: Template
  cover_photo_url: string | null
  location: string | null
  language: Language
  expires_at: string
  created_at: string
}

export interface Media {
  id: string
  order_id: string
  type: MediaType
  url: string
  thumbnail_url: string | null
  file_size: number
  original_name: string | null
  uploaded_by: string
  created_at: string
}

export interface GuestbookEntry {
  id: string
  order_id: string
  guest_name: string
  message: string
  created_at: string
}

export const PLAN_LIMITS = {
  free: {
    photos: 20,
    videos: 0,
    days: 30,
    price: 0,
    label: 'Free',
  },
  premium: {
    photos: Infinity,
    videos: 5,
    days: 365,
    price: 13,
    label: 'Premium',
  },
  premium_plus: {
    photos: Infinity,
    videos: 100,
    days: 1095, // 3 years
    price: 99,
    label: 'Premium Plus',
  },
} as const

export const STORAGE_THRESHOLD = 0.9 // 90% triggers auto-upgrade warning/charge
