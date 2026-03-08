import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { canvaApiRequest } from '@/lib/canva-api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ exportId: string }> }
) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { exportId } = await params
  try {
    const res = await canvaApiRequest(user.email, `/exports/${encodeURIComponent(exportId)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    const payload = await res.json()
    return NextResponse.json(payload, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Canva request failed' },
      { status: 500 }
    )
  }
}
