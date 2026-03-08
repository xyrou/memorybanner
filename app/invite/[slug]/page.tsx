import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'

type InvitePageProps = {
  params: Promise<{ slug: string }>
}

function detectAssetKind(format: string, url: string): 'image' | 'video' | 'pdf' | 'unknown' {
  const normalizedFormat = format.toLowerCase()
  const normalizedUrl = url.toLowerCase()

  if (normalizedFormat === 'pdf' || normalizedUrl.endsWith('.pdf')) return 'pdf'
  if (normalizedFormat === 'mp4' || normalizedUrl.endsWith('.mp4')) return 'video'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(normalizedFormat)) return 'image'
  if (/\.(png|jpg|jpeg|gif|webp)(\?|$)/.test(normalizedUrl)) return 'image'

  return 'unknown'
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { slug } = await params
  const service = createServiceClient()

  const { data: order } = await service
    .from('orders')
    .select('id,slug,couple_names,event_date')
    .eq('slug', slug)
    .maybeSingle()

  if (!order) notFound()

  const { data: invitation } = await service
    .from('invitation_pages')
    .select('published_export_id,published_at')
    .eq('order_id', order.id)
    .maybeSingle()

  if (!invitation?.published_export_id) notFound()

  const { data: publishedAsset } = await service
    .from('canva_design_exports')
    .select('asset_url,export_format,design_title')
    .eq('id', invitation.published_export_id)
    .maybeSingle()

  if (!publishedAsset?.asset_url) notFound()

  const assetKind = detectAssetKind(publishedAsset.export_format, publishedAsset.asset_url)

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Invitation</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{order.couple_names}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(order.event_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Published {invitation.published_at ? new Date(invitation.published_at).toLocaleString('en-US') : '-'}
          </p>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {assetKind === 'image' && (
            <Image
              src={publishedAsset.asset_url}
              alt={publishedAsset.design_title || `${order.couple_names} invitation`}
              width={1600}
              height={2200}
              unoptimized
              priority
              className="w-full h-auto"
            />
          )}

          {assetKind === 'video' && (
            <video controls playsInline className="w-full h-auto bg-black">
              <source src={publishedAsset.asset_url} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          )}

          {assetKind === 'pdf' && (
            <iframe
              title={publishedAsset.design_title || `${order.couple_names} invitation PDF`}
              src={publishedAsset.asset_url}
              className="w-full h-[80vh]"
            />
          )}

          {assetKind === 'unknown' && (
            <div className="p-8 text-center text-sm text-gray-600">
              This invitation format cannot be previewed directly.
            </div>
          )}
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <a
            href={publishedAsset.asset_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Open Original Asset
          </a>
          <Link
            href={`/${order.slug}`}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-500"
          >
            Open Gallery
          </Link>
        </div>
      </div>
    </main>
  )
}
