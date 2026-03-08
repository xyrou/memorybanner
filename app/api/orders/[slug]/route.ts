import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { hashPin, isValidPin } from '@/lib/pin'

const PUBLIC_TEMPLATE_VALUES = ['romantic', 'noir', 'golden', 'garden', 'burgundy', 'sage'] as const
const PUBLIC_PATCH_FIELDS = [
  'template',
  'location',
  'cover_photo_url',
  'is_setup',
  'pin_required',
  'moderate_media',
  'moderate_guestbook',
] as const
const ADMIN_PATCH_FIELDS = [
  'auto_upgrade_to_premium',
  'auto_upgrade_to_plus',
  'stripe_customer_id',
  'stripe_payment_method_id',
  'plan',
  'expires_at',
] as const

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select('id,slug,couple_names,event_date,plan,photo_count,video_count,is_setup,template,cover_photo_url,location,language,pin_required,moderate_media,moderate_guestbook,expires_at,created_at')
    .eq('slug', slug)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()
  const body = await req.json()
  const isAdmin = req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
  const providedAccessPin = typeof body.access_pin === 'string' ? body.access_pin.trim() : null

  const update: Record<string, unknown> = {}
  for (const key of PUBLIC_PATCH_FIELDS) {
    if (key in body) update[key] = body[key]
  }
  if (isAdmin) {
    for (const key of ADMIN_PATCH_FIELDS) {
      if (key in body) update[key] = body[key]
    }
  } else {
    const hasAdminFields = ADMIN_PATCH_FIELDS.some((key) => key in body)
    if (hasAdminFields) {
      return NextResponse.json({ error: 'Unauthorized field update' }, { status: 403 })
    }
  }

  if (providedAccessPin !== null) {
    if (providedAccessPin.length > 0 && !isValidPin(providedAccessPin)) {
      return NextResponse.json({ error: 'Invalid access_pin. Use 4-8 numeric digits.' }, { status: 400 })
    }
    update.access_pin_hash = providedAccessPin.length > 0 ? hashPin(providedAccessPin) : null
  }

  if ('template' in update && !PUBLIC_TEMPLATE_VALUES.includes(update.template as (typeof PUBLIC_TEMPLATE_VALUES)[number])) {
    return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
  }
  if ('location' in update && update.location !== null && typeof update.location !== 'string') {
    return NextResponse.json({ error: 'Invalid location' }, { status: 400 })
  }
  if ('cover_photo_url' in update && update.cover_photo_url !== null && typeof update.cover_photo_url !== 'string') {
    return NextResponse.json({ error: 'Invalid cover_photo_url' }, { status: 400 })
  }
  if ('is_setup' in update && typeof update.is_setup !== 'boolean') {
    return NextResponse.json({ error: 'Invalid is_setup' }, { status: 400 })
  }
  if ('pin_required' in update && typeof update.pin_required !== 'boolean') {
    return NextResponse.json({ error: 'Invalid pin_required' }, { status: 400 })
  }
  if ('moderate_media' in update && typeof update.moderate_media !== 'boolean') {
    return NextResponse.json({ error: 'Invalid moderate_media' }, { status: 400 })
  }
  if ('moderate_guestbook' in update && typeof update.moderate_guestbook !== 'boolean') {
    return NextResponse.json({ error: 'Invalid moderate_guestbook' }, { status: 400 })
  }

  if (update.pin_required === false) {
    update.access_pin_hash = null
  }

  if (update.pin_required === true && !('access_pin_hash' in update)) {
    const { data: existing } = await supabase
      .from('orders')
      .select('access_pin_hash')
      .eq('slug', slug)
      .single()
    if (!existing?.access_pin_hash) {
      return NextResponse.json({ error: 'access_pin is required when enabling pin protection' }, { status: 400 })
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No allowed fields provided' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('orders')
    .update(update)
    .eq('slug', slug)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
