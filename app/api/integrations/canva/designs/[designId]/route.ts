import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { canvaApiRequest } from '@/lib/canva-api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ designId: string }> }
) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { designId } = await params
  const includeFormats = req.nextUrl.searchParams.get('include_formats') === '1'

  try {
    const detailRes = await canvaApiRequest(user.email, `/designs/${encodeURIComponent(designId)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    const detailPayload = await detailRes.json()
    if (!detailRes.ok) return NextResponse.json(detailPayload, { status: detailRes.status })

    if (!includeFormats) {
      return NextResponse.json({ design: detailPayload.design ?? detailPayload })
    }

    const formatsRes = await canvaApiRequest(user.email, `/designs/${encodeURIComponent(designId)}/export-formats`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    const formatsPayload = await formatsRes.json()

    return NextResponse.json({
      design: detailPayload.design ?? detailPayload,
      export_formats: formatsPayload.export_formats ?? formatsPayload.formats ?? [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Canva request failed' },
      { status: 500 }
    )
  }
}
