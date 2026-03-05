import { NextRequest, NextResponse } from 'next/server'
import { generateQRPng, generateQRSvg } from '@/lib/qr'
import { createServiceClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const adminSecret = req.headers.get('x-admin-secret')
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const format = req.nextUrl.searchParams.get('format') || 'png'

  const supabase = createServiceClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (format === 'svg') {
    const svg = await generateQRSvg(slug)
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${slug}-qr.svg"`,
      },
    })
  }

  const buffer = await generateQRPng(slug)
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${slug}-qr.png"`,
    },
  })
}
