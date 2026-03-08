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

  let query = supabase
    .from('guestbook')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })

  if (!isAdmin) query = query.eq('is_approved', true)

  const { data } = await query

  return NextResponse.json(data ?? [])
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { guest_name, message } = await req.json()

  if (!guest_name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'guest_name and message required' }, { status: 400 })
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id,pin_required,access_pin_hash,moderate_guestbook')
    .eq('slug', slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!hasOrderAccess(req, order)) {
    return NextResponse.json({ error: 'PIN required', requires_pin: true }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('guestbook')
    .insert({
      order_id: order.id,
      guest_name: guest_name.trim(),
      message: message.trim(),
      is_approved: !order.moderate_guestbook,
      approved_at: order.moderate_guestbook ? null : new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
