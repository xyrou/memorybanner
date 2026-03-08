import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { revokeCanvaToken } from '@/lib/canva-oauth'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  const normalizedEmail = user.email.trim().toLowerCase()

  const service = createServiceClient()
  const { data: connections } = await service
    .from('oauth_connections')
    .select('id,access_token,refresh_token')
    .eq('provider', 'canva')
    .ilike('user_email', normalizedEmail)
    .order('updated_at', { ascending: false })
    .limit(1)

  const connection = connections?.[0]

  if (connection) {
    const tokenToRevoke = connection.refresh_token || connection.access_token
    if (tokenToRevoke) {
      try {
        await revokeCanvaToken(tokenToRevoke)
      } catch {
        // Ignore revoke failures; we'll still remove local connection.
      }
    }

    await service
      .from('oauth_connections')
      .delete()
      .eq('id', connection.id)
  }

  const redirectUrl = new URL('/dashboard', req.url)
  redirectUrl.searchParams.set('canva', 'disconnected')
  return NextResponse.redirect(redirectUrl)
}
