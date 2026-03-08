import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
  const importId = typeof body?.import_id === 'string' ? body.import_id.trim() : ''

  if (!slug || !importId) {
    return NextResponse.json({ error: 'slug and import_id are required' }, { status: 400 })
  }

  const normalizedEmail = user.email.trim().toLowerCase()
  const service = createServiceClient()

  const { data: order, error: orderError } = await service
    .from('orders')
    .select('id,slug')
    .eq('slug', slug)
    .ilike('email', normalizedEmail)
    .maybeSingle()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })
  if (!order) return NextResponse.json({ error: 'Order not found for this user and slug' }, { status: 404 })

  const { data: importedAsset, error: importError } = await service
    .from('canva_design_exports')
    .select('id,order_id,user_email,asset_url,export_format')
    .eq('id', importId)
    .ilike('user_email', normalizedEmail)
    .maybeSingle()

  if (importError) return NextResponse.json({ error: importError.message }, { status: 500 })
  if (!importedAsset) return NextResponse.json({ error: 'Imported asset not found' }, { status: 404 })

  if (importedAsset.order_id && importedAsset.order_id !== order.id) {
    return NextResponse.json(
      { error: 'Imported asset belongs to a different gallery slug' },
      { status: 400 }
    )
  }

  if (!importedAsset.order_id) {
    const { error: bindError } = await service
      .from('canva_design_exports')
      .update({ order_id: order.id })
      .eq('id', importedAsset.id)

    if (bindError) return NextResponse.json({ error: bindError.message }, { status: 500 })
  }

  const now = new Date().toISOString()
  const { data: invitation, error: invitationError } = await service
    .from('invitation_pages')
    .upsert({
      order_id: order.id,
      user_email: normalizedEmail,
      draft_export_id: importedAsset.id,
      published_export_id: importedAsset.id,
      published_at: now,
      updated_at: now,
    }, { onConflict: 'order_id' })
    .select('*')
    .single()

  if (invitationError) return NextResponse.json({ error: invitationError.message }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  return NextResponse.json({
    invitation,
    slug: order.slug,
    asset_url: importedAsset.asset_url,
    export_format: importedAsset.export_format,
    invite_url: baseUrl ? `${baseUrl}/invite/${order.slug}` : `/invite/${order.slug}`,
  })
}
