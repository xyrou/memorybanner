import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { r2, getPublicUrl } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('slug', params.slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const contentType = req.headers.get('content-type') || 'image/jpeg'
  const body = await req.arrayBuffer()
  const key = `${params.slug}/cover/cover.jpg`

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: Buffer.from(body),
    ContentType: contentType,
  }))

  const url = getPublicUrl(key)
  return NextResponse.json({ url })
}
