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
  const album = req.nextUrl.searchParams.get('album')

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
    .from('media')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })

  if (!isAdmin) query = query.eq('is_approved', true)
  if (album && album !== 'all') query = query.eq('album_name', album)

  const { data } = await query

  return NextResponse.json(data ?? [])
}
