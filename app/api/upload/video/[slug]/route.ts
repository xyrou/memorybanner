import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { r2, getPublicUrl, getMediaKey } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { PLAN_LIMITS } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const limits = PLAN_LIMITS[order.plan as keyof typeof PLAN_LIMITS]
  if (limits.videos === 0) {
    return NextResponse.json({ error: 'Videos not available on free plan' }, { status: 403 })
  }
  if (limits.videos !== Infinity && order.video_count >= limits.videos) {
    return NextResponse.json({ error: 'Video limit reached' }, { status: 403 })
  }

  const contentType = req.headers.get('content-type') || 'video/mp4'
  const filename = decodeURIComponent(req.headers.get('x-filename') || 'video.mp4')
  const fileSize = parseInt(req.headers.get('x-filesize') || '0')
  const body = await req.arrayBuffer()

  const key = getMediaKey(slug, 'video', filename)

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: Buffer.from(body),
    ContentType: contentType,
  }))

  const url = getPublicUrl(key)

  const { data: mediaRecord } = await supabase
    .from('media')
    .insert({
      order_id: order.id,
      type: 'video',
      url,
      r2_key: key,
      file_size: fileSize,
      original_name: filename,
      uploaded_by: 'guest',
    })
    .select()
    .single()

  await supabase
    .from('orders')
    .update({
      video_count: order.video_count + 1,
      storage_used: order.storage_used + fileSize,
    })
    .eq('id', order.id)

  return NextResponse.json(mediaRecord, { status: 201 })
}
