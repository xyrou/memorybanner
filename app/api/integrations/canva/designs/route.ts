import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { canvaApiRequest } from '@/lib/canva-api'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const query = req.nextUrl.searchParams.get('query')
  const continuation = req.nextUrl.searchParams.get('continuation')
  const ownership = req.nextUrl.searchParams.get('ownership') || 'any'
  const sortBy = req.nextUrl.searchParams.get('sort_by') || 'modified_descending'

  const params = new URLSearchParams()
  if (query) params.set('query', query)
  if (continuation) params.set('continuation', continuation)
  if (ownership) params.set('ownership', ownership)
  if (sortBy) params.set('sort_by', sortBy)

  try {
    const res = await canvaApiRequest(user.email, `/designs?${params.toString()}`, {
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
