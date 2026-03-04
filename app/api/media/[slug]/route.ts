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
    .from('media')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
