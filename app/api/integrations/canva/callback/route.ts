import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { exchangeCodeForToken } from '@/lib/canva-oauth'

const COOKIE_STATE = 'mb_canva_oauth_state'
const COOKIE_VERIFIER = 'mb_canva_oauth_verifier'
const COOKIE_RETURN_TO = 'mb_canva_oauth_return_to'

function clearOAuthCookies(res: NextResponse) {
  const options = { path: '/', expires: new Date(0) }
  res.cookies.set(COOKIE_STATE, '', options)
  res.cookies.set(COOKIE_VERIFIER, '', options)
  res.cookies.set(COOKIE_RETURN_TO, '', options)
}

function toRedirectUrl(req: NextRequest, status: string, returnTo?: string): URL {
  const targetPath = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard'
  const url = new URL(targetPath, req.url)
  url.searchParams.set('canva', status)
  return url
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const oauthError = req.nextUrl.searchParams.get('error')
  const stateCookie = req.cookies.get(COOKIE_STATE)?.value ?? ''
  const verifierCookie = req.cookies.get(COOKIE_VERIFIER)?.value ?? ''
  const returnTo = req.cookies.get(COOKIE_RETURN_TO)?.value ?? '/dashboard'

  if (oauthError) {
    const res = NextResponse.redirect(toRedirectUrl(req, 'denied', returnTo))
    clearOAuthCookies(res)
    return res
  }

  if (!code || !state || !stateCookie || !verifierCookie || state !== stateCookie) {
    const res = NextResponse.redirect(toRedirectUrl(req, 'invalid_state', returnTo))
    clearOAuthCookies(res)
    return res
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    const res = NextResponse.redirect(new URL('/auth/login', req.url))
    clearOAuthCookies(res)
    return res
  }

  try {
    const normalizedEmail = user.email.trim().toLowerCase()
    const token = await exchangeCodeForToken(code, verifierCookie)
    const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString()
    const service = createServiceClient()
    const { error } = await service
      .from('oauth_connections')
      .upsert(
        {
          provider: 'canva',
          user_email: normalizedEmail,
          access_token: token.access_token,
          refresh_token: token.refresh_token ?? null,
          token_type: token.token_type ?? 'Bearer',
          scope: token.scope ?? null,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'provider,user_email' }
      )

    if (error) {
      const res = NextResponse.redirect(toRedirectUrl(req, 'db_error', returnTo))
      clearOAuthCookies(res)
      return res
    }

    const res = NextResponse.redirect(toRedirectUrl(req, 'connected', returnTo))
    clearOAuthCookies(res)
    return res
  } catch {
    const res = NextResponse.redirect(toRedirectUrl(req, 'token_error', returnTo))
    clearOAuthCookies(res)
    return res
  }
}
