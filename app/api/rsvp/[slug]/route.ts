import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { hasOrderAccess } from '@/lib/guest-access'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()
  const isAdmin = req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET

  const { data: order } = await supabase
    .from('orders')
    .select('id,pin_required,access_pin_hash')
    .eq('slug', slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!isAdmin && !hasOrderAccess(req, order)) {
    return NextResponse.json({ error: 'PIN required', requires_pin: true }, { status: 401 })
  }

  if (isAdmin) {
    const { data } = await supabase
      .from('rsvps')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })

    return NextResponse.json(data ?? [])
  }

  const { data } = await supabase
    .from('rsvps')
    .select('attending')
    .eq('order_id', order.id)

  const list = data ?? []
  const attending = list.filter((entry) => entry.attending).length
  const declined = list.length - attending
  return NextResponse.json({ summary: { total: list.length, attending, declined } })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()
  const body = await req.json()

  const guest_name = typeof body?.guest_name === 'string' ? body.guest_name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : null
  const attending = Boolean(body?.attending)
  const plus_one = Boolean(body?.plus_one)
  const meal_preference = typeof body?.meal_preference === 'string' ? body.meal_preference.trim() : null
  const note = typeof body?.note === 'string' ? body.note.trim() : null

  if (!guest_name) {
    return NextResponse.json({ error: 'guest_name is required' }, { status: 400 })
  }
  if (guest_name.length > 120 || (email && email.length > 255) || (meal_preference && meal_preference.length > 120) || (note && note.length > 500)) {
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id,pin_required,access_pin_hash')
    .eq('slug', slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!hasOrderAccess(req, order)) {
    return NextResponse.json({ error: 'PIN required', requires_pin: true }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('rsvps')
    .insert({
      order_id: order.id,
      guest_name,
      email: email || null,
      attending,
      plus_one,
      meal_preference: meal_preference || null,
      note: note || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
