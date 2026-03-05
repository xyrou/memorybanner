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

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('slug', slug)
    .single()

  if (orderError || !order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const limits = PLAN_LIMITS[order.plan as keyof typeof PLAN_LIMITS]
  if (limits.photos !== Infinity && order.photo_count >= limits.photos) {
    return NextResponse.json({ error: 'Photo limit reached' }, { status: 403 })
  }

  const contentType = req.headers.get('content-type') || 'image/jpeg'
  const filename = decodeURIComponent(req.headers.get('x-filename') || 'photo.jpg')
  const fileSize = parseInt(req.headers.get('x-filesize') || '0')
  const body = await req.arrayBuffer()

  const key = getMediaKey(slug, 'photo', filename)

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
      type: 'photo',
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
      photo_count: order.photo_count + 1,
      storage_used: order.storage_used + fileSize,
    })
    .eq('id', order.id)

  return NextResponse.json(mediaRecord, { status: 201 })
}
