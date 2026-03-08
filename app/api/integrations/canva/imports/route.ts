import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const slug = req.nextUrl.searchParams.get('slug')
  const service = createServiceClient()

  let query = service
    .from('canva_design_exports')
    .select('*')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })
    .limit(20)

  if (slug) {
    const { data: order } = await service
      .from('orders')
      .select('id')
      .eq('slug', slug)
      .eq('email', user.email)
      .maybeSingle()
    if (!order?.id) return NextResponse.json([])
    query = query.eq('order_id', order.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
