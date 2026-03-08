import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const adminSecret = req.headers.get('x-admin-secret')
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const body = await req.json()
  const target = body?.target === 'guestbook' ? 'guestbook' : body?.target === 'media' ? 'media' : null
  const id = typeof body?.id === 'string' ? body.id : ''
  const isApproved = typeof body?.is_approved === 'boolean' ? body.is_approved : null

  if (!target || !id || isApproved === null) {
    return NextResponse.json({ error: 'target, id and is_approved are required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from(target)
    .update({
      is_approved: isApproved,
      approved_at: isApproved ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('order_id', order.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
