import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((key) => escapeCsvCell(row[key])).join(','))
  }
  return lines.join('\n')
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const adminSecret = req.headers.get('x-admin-secret')
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const type = req.nextUrl.searchParams.get('type') ?? 'rsvp'
  if (!['rsvp', 'guestbook', 'media'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type. Use rsvp, guestbook, or media.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (type === 'rsvp') {
    const { data, error } = await supabase
      .from('rsvps')
      .select('guest_name,email,attending,plus_one,meal_preference,note,created_at')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const csv = toCsv((data ?? []) as Record<string, unknown>[])
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slug}-rsvps.csv"`,
      },
    })
  }

  if (type === 'guestbook') {
    const { data, error } = await supabase
      .from('guestbook')
      .select('guest_name,message,is_approved,created_at')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const csv = toCsv((data ?? []) as Record<string, unknown>[])
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slug}-guestbook.csv"`,
      },
    })
  }

  const { data, error } = await supabase
    .from('media')
    .select('type,album_name,url,uploaded_by,is_approved,file_size,created_at')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const csv = toCsv((data ?? []) as Record<string, unknown>[])
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}-media.csv"`,
    },
  })
}
