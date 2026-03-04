import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateSlug } from '@/lib/slug'
import { getExpiresAt } from '@/lib/plans'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret')
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { couple_names, event_date, email } = body

  if (!couple_names || !event_date) {
    return NextResponse.json({ error: 'couple_names and event_date are required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  let slug = generateSlug()
  // Ensure slug uniqueness
  let attempts = 0
  while (attempts < 10) {
    const { data } = await supabase.from('orders').select('id').eq('slug', slug).single()
    if (!data) break
    slug = generateSlug()
    attempts++
  }

  const expires_at = getExpiresAt('free')

  const { data, error } = await supabase
    .from('orders')
    .insert({ slug, couple_names, event_date, email, expires_at })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
