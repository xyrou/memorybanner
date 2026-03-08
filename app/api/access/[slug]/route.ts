import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isValidPin, verifyPin } from '@/lib/pin'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()
  const body = await req.json()
  const pin = typeof body?.pin === 'string' ? body.pin.trim() : ''

  const { data: order } = await supabase
    .from('orders')
    .select('id,pin_required,access_pin_hash')
    .eq('slug', slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!order.pin_required) return NextResponse.json({ ok: true, pin_required: false })

  if (!isValidPin(pin) || !verifyPin(pin, order.access_pin_hash)) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
  }

  return NextResponse.json({ ok: true, pin_required: true })
}
