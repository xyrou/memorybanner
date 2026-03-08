import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const slug = req.nextUrl.searchParams.get('slug')
  const service = createServiceClient()
  let orderId: string | null = null

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
    orderId = order.id
    query = query.eq('order_id', order.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!orderId) return NextResponse.json(data ?? [])

  const { data: invitation, error: invitationError } = await service
    .from('invitation_pages')
    .select('draft_export_id,published_export_id')
    .eq('order_id', orderId)
    .maybeSingle()

  if (invitationError) return NextResponse.json({ error: invitationError.message }, { status: 500 })

  const rows = (data ?? []).map((item) => ({
    ...item,
    is_draft: invitation?.draft_export_id === item.id,
    is_published: invitation?.published_export_id === item.id,
  }))

  return NextResponse.json(rows)
}
