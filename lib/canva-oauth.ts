import crypto from 'crypto'

const CANVA_AUTHORIZE_URL = 'https://www.canva.com/api/oauth/authorize'
const CANVA_TOKEN_URL = 'https://api.canva.com/rest/v1/oauth/token'
const CANVA_REVOKE_URL = 'https://api.canva.com/rest/v1/oauth/revoke'
const DEFAULT_CANVA_SCOPES = 'profile:read design:meta:read design:content:read design:content:write asset:read asset:write'

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

function toBase64Url(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export function getCanvaConfig() {
  return {
    clientId: getRequiredEnv('CANVA_CLIENT_ID'),
    clientSecret: getRequiredEnv('CANVA_CLIENT_SECRET'),
    redirectUri: getRequiredEnv('CANVA_REDIRECT_URI'),
    scopes: process.env.CANVA_SCOPES || DEFAULT_CANVA_SCOPES,
  }
}

export function generateCodeVerifier(): string {
  return toBase64Url(crypto.randomBytes(64))
}

export function generateCodeChallenge(codeVerifier: string): string {
  return toBase64Url(crypto.createHash('sha256').update(codeVerifier).digest())
}

export function generateOAuthState(): string {
  return toBase64Url(crypto.randomBytes(24))
}

export function buildCanvaAuthorizeUrl(options: { state: string; codeChallenge: string }): string {
  const { clientId, redirectUri, scopes } = getCanvaConfig()
  const params = new URLSearchParams({
    code_challenge_method: 's256',
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: options.codeChallenge,
    state: options.state,
    scope: scopes,
  })
  return `${CANVA_AUTHORIZE_URL}?${params.toString()}`
}

export type CanvaTokenResponse = {
  access_token: string
  refresh_token?: string
  token_type?: string
  scope?: string
  expires_in: number
}

export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<CanvaTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getCanvaConfig()
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  })
  const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(CANVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicToken}`,
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Canva token exchange failed: ${detail}`)
  }

  return res.json() as Promise<CanvaTokenResponse>
}

export async function revokeCanvaToken(token: string): Promise<void> {
  const { clientId, clientSecret } = getCanvaConfig()
  const body = new URLSearchParams({
    token,
  })
  const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(CANVA_REVOKE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicToken}`,
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Canva token revoke failed: ${detail}`)
  }
}
