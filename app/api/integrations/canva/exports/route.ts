import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { canvaApiRequest } from '@/lib/canva-api'

type ExportFormat = 'png' | 'jpg' | 'pdf' | 'gif' | 'mp4' | 'pptx'

function buildFormat(type: ExportFormat): Record<string, unknown> {
  if (type === 'jpg') {
    return { type: 'jpg', quality: 90 }
  }
  return { type }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const designId = typeof body?.design_id === 'string' ? body.design_id.trim() : ''
  const format = (typeof body?.format === 'string' ? body.format.trim().toLowerCase() : 'png') as ExportFormat
  const allowedFormats: ExportFormat[] = ['png', 'jpg', 'pdf', 'gif', 'mp4', 'pptx']

  if (!designId) return NextResponse.json({ error: 'design_id is required' }, { status: 400 })
  if (!allowedFormats.includes(format)) {
    return NextResponse.json({ error: `Unsupported format: ${format}` }, { status: 400 })
  }

  try {
    const canvaBody = {
      design_id: designId,
      format: buildFormat(format),
    }
    const res = await canvaApiRequest(user.email, '/exports', {
      method: 'POST',
      body: JSON.stringify(canvaBody),
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
