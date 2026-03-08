import { createServiceClient } from '@/lib/supabase'
import { refreshCanvaAccessToken } from '@/lib/canva-oauth'

const CANVA_API_BASE = 'https://api.canva.com/rest/v1'

type CanvaConnectionRow = {
  id: string
  provider: 'canva'
  user_email: string
  access_token: string
  refresh_token: string | null
  token_type: string
  scope: string | null
  expires_at: string
}

async function getCanvaConnection(userEmail: string): Promise<CanvaConnectionRow | null> {
  const service = createServiceClient()
  const { data } = await service
    .from('oauth_connections')
    .select('id,provider,user_email,access_token,refresh_token,token_type,scope,expires_at')
    .eq('provider', 'canva')
    .eq('user_email', userEmail)
    .maybeSingle()
  return (data as CanvaConnectionRow | null) ?? null
}

async function refreshConnectionToken(row: CanvaConnectionRow): Promise<CanvaConnectionRow> {
  if (!row.refresh_token) {
    throw new Error('Canva refresh token is missing. Please reconnect Canva.')
  }

  const refreshed = await refreshCanvaAccessToken(row.refresh_token, row.scope ?? undefined)
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
  const service = createServiceClient()

  const { data, error } = await service
    .from('oauth_connections')
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? row.refresh_token,
      token_type: refreshed.token_type ?? row.token_type ?? 'Bearer',
      scope: refreshed.scope ?? row.scope,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id)
    .select('id,provider,user_email,access_token,refresh_token,token_type,scope,expires_at')
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Could not persist refreshed Canva token.')
  }

  return data as CanvaConnectionRow
}

async function getUsableConnection(userEmail: string, forceRefresh = false): Promise<CanvaConnectionRow> {
  const row = await getCanvaConnection(userEmail)
  if (!row) throw new Error('Canva is not connected.')
  const expiresAtMs = new Date(row.expires_at).getTime()
  const shouldRefresh = forceRefresh || expiresAtMs <= Date.now() + 60_000
  if (!shouldRefresh) return row
  return refreshConnectionToken(row)
}

export async function canvaApiRequest(userEmail: string, path: string, init?: RequestInit): Promise<Response> {
  const row = await getUsableConnection(userEmail)
  const call = async (token: string) => fetch(`${CANVA_API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': init?.body ? 'application/json' : (init?.headers as Record<string, string> | undefined)?.['Content-Type'] ?? 'application/json',
    },
  })

  let res = await call(row.access_token)
  if (res.status === 401) {
    const refreshed = await getUsableConnection(userEmail, true)
    res = await call(refreshed.access_token)
  }

  return res
}
