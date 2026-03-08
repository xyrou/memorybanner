import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import {
  buildCanvaAuthorizeUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
} from '@/lib/canva-oauth'

const COOKIE_STATE = 'mb_canva_oauth_state'
const COOKIE_VERIFIER = 'mb_canva_oauth_verifier'
const COOKIE_RETURN_TO = 'mb_canva_oauth_return_to'

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  }
}

function sanitizeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/')) return '/dashboard'
  return value
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  const returnTo = sanitizeReturnTo(req.nextUrl.searchParams.get('return_to'))
  const state = generateOAuthState()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  let authorizeUrl: string
  try {
    authorizeUrl = buildCanvaAuthorizeUrl({ state, codeChallenge })
  } catch {
    const url = new URL('/dashboard', req.url)
    url.searchParams.set('canva', 'config_error')
    return NextResponse.redirect(url)
  }

  const res = NextResponse.redirect(authorizeUrl)
  const cookieOptions = getCookieOptions()
  res.cookies.set(COOKIE_STATE, state, cookieOptions)
  res.cookies.set(COOKIE_VERIFIER, codeVerifier, cookieOptions)
  res.cookies.set(COOKIE_RETURN_TO, returnTo, cookieOptions)
  return res
}
