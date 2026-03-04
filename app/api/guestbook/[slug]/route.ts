import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('slug', params.slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await supabase
    .from('guestbook')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createServiceClient()
  const { guest_name, message } = await req.json()

  if (!guest_name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'guest_name and message required' }, { status: 400 })
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('slug', params.slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('guestbook')
    .insert({ order_id: order.id, guest_name: guest_name.trim(), message: message.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
