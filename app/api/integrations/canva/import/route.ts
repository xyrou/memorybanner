import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { r2, getPublicUrl } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'

const MAX_IMPORT_BYTES = 80 * 1024 * 1024 // 80 MB

function canImportFromUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'canva.com' || parsed.hostname.endsWith('.canva.com')
  } catch {
    return false
  }
}

function getFileExtension(format: string, contentType: string): string {
  const normalized = format.toLowerCase()
  if (normalized) return normalized
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('jpeg')) return 'jpg'
  if (contentType.includes('pdf')) return 'pdf'
  if (contentType.includes('gif')) return 'gif'
  if (contentType.includes('mp4')) return 'mp4'
  return 'bin'
}

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const designId = typeof body?.design_id === 'string' ? body.design_id.trim() : ''
  const designTitle = typeof body?.design_title === 'string' ? body.design_title.trim() : null
  const exportFormat = typeof body?.export_format === 'string' ? body.export_format.trim() : 'png'
  const exportUrl = typeof body?.export_url === 'string' ? body.export_url.trim() : ''
  const exportJobId = typeof body?.export_job_id === 'string' ? body.export_job_id.trim() : null
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : null

  if (!designId || !exportUrl) {
    return NextResponse.json({ error: 'design_id and export_url are required' }, { status: 400 })
  }
  if (!canImportFromUrl(exportUrl)) {
    return NextResponse.json({ error: 'Invalid export URL host' }, { status: 400 })
  }

  const exportRes = await fetch(exportUrl)
  if (!exportRes.ok) {
    return NextResponse.json({ error: 'Could not download Canva export' }, { status: 400 })
  }

  const arrayBuffer = await exportRes.arrayBuffer()
  if (arrayBuffer.byteLength > MAX_IMPORT_BYTES) {
    return NextResponse.json({ error: 'Export is too large to import' }, { status: 413 })
  }

  const contentType = exportRes.headers.get('content-type') || 'application/octet-stream'
  const ext = getFileExtension(exportFormat, contentType)
  const emailSegment = sanitizeSegment(user.email)
  const designSegment = sanitizeSegment(designId)
  const key = `canva-imports/${emailSegment}/${Date.now()}-${designSegment}.${ext}`

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: Buffer.from(arrayBuffer),
    ContentType: contentType,
  }))

  const assetUrl = getPublicUrl(key)
  const service = createServiceClient()

  let orderId: string | null = null
  if (slug) {
    const { data: order } = await service
      .from('orders')
      .select('id')
      .eq('slug', slug)
      .eq('email', user.email)
      .maybeSingle()
    orderId = order?.id ?? null

    // If the export is an image, allow direct use as cover photo.
    if (orderId && (contentType.startsWith('image/') || ['png', 'jpg', 'jpeg'].includes(ext))) {
      await service
        .from('orders')
        .update({ cover_photo_url: assetUrl })
        .eq('id', orderId)
    }
  }

  const { data, error } = await service
    .from('canva_design_exports')
    .insert({
      user_email: user.email,
      order_id: orderId,
      design_id: designId,
      design_title: designTitle,
      export_format: exportFormat,
      canva_export_id: exportJobId,
      r2_key: key,
      asset_url: assetUrl,
      byte_size: arrayBuffer.byteLength,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
