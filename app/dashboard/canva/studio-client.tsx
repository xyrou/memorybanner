'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Download, RefreshCw } from 'lucide-react'

type CanvaDesign = {
  id: string
  title?: string
  thumbnail?: { url?: string }
  urls?: { edit_url?: string; view_url?: string }
}

type ImportedAsset = {
  id: string
  design_id: string
  design_title: string | null
  asset_url: string
  export_format: string
  created_at: string
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractDesigns(payload: unknown): { items: CanvaDesign[]; continuation?: string } {
  if (!payload || typeof payload !== 'object') return { items: [] }
  const p = payload as Record<string, unknown>
  const rawItems = Array.isArray(p.items) ? p.items : Array.isArray((p.designs as Record<string, unknown> | undefined)?.items) ? ((p.designs as Record<string, unknown>).items as unknown[]) : []
  const items = rawItems.filter(Boolean).map((item) => item as CanvaDesign)
  const continuation = typeof p.continuation === 'string'
    ? p.continuation
    : typeof (p.designs as Record<string, unknown> | undefined)?.continuation === 'string'
      ? ((p.designs as Record<string, unknown>).continuation as string)
      : undefined
  return { items, continuation }
}

function extractExportJobId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>
  const job = p.job && typeof p.job === 'object' ? (p.job as Record<string, unknown>) : null
  const exp = p.export && typeof p.export === 'object' ? (p.export as Record<string, unknown>) : null
  if (job && typeof job.id === 'string') return job.id
  if (exp && typeof exp.id === 'string') return exp.id
  if (typeof p.id === 'string') return p.id
  return null
}

function extractExportStatus(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'unknown'
  const p = payload as Record<string, unknown>
  const job = p.job && typeof p.job === 'object' ? (p.job as Record<string, unknown>) : null
  const exp = p.export && typeof p.export === 'object' ? (p.export as Record<string, unknown>) : null
  if (job && typeof job.status === 'string') return job.status
  if (exp && typeof exp.status === 'string') return exp.status
  if (typeof p.status === 'string') return p.status
  return 'unknown'
}

function extractExportUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>
  const exp = p.export && typeof p.export === 'object' ? (p.export as Record<string, unknown>) : null
  const job = p.job && typeof p.job === 'object' ? (p.job as Record<string, unknown>) : null
  const candidates: unknown[] = [
    ...(Array.isArray(p.urls) ? p.urls : []),
    ...(Array.isArray(exp?.urls) ? (exp?.urls as unknown[]) : []),
    ...(Array.isArray(job?.urls) ? (job?.urls as unknown[]) : []),
  ]
  for (const candidate of candidates) {
    if (typeof candidate === 'string') return candidate
    if (candidate && typeof candidate === 'object' && typeof (candidate as Record<string, unknown>).url === 'string') {
      return (candidate as Record<string, string>).url
    }
  }
  return null
}

export function CanvaStudioClient() {
  const [query, setQuery] = useState('')
  const [slug, setSlug] = useState('')
  const [designs, setDesigns] = useState<CanvaDesign[]>([])
  const [continuation, setContinuation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [message, setMessage] = useState('')
  const [importingDesignId, setImportingDesignId] = useState('')
  const [imports, setImports] = useState<ImportedAsset[]>([])

  const canLoadMore = useMemo(() => Boolean(continuation), [continuation])
  const canvaDisconnected = useMemo(
    () => message.toLowerCase().includes('not connected'),
    [message]
  )

  const loadImports = async () => {
    const res = await fetch('/api/integrations/canva/imports')
    if (!res.ok) return
    const data = await res.json()
    setImports(Array.isArray(data) ? data : [])
  }

  const loadDesigns = async (append = false) => {
    if (!append) {
      setLoading(true)
      setMessage('')
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('query', query.trim())
      if (append && continuation) params.set('continuation', continuation)
      const res = await fetch(`/api/integrations/canva/designs?${params.toString()}`)
      const payload = await res.json()

      if (!res.ok) {
        setMessage(payload?.error || 'Could not load Canva designs.')
        return
      }

      const parsed = extractDesigns(payload)
      setDesigns((prev) => append ? [...prev, ...parsed.items] : parsed.items)
      setContinuation(parsed.continuation ?? null)
      if (!parsed.items.length && !append) setMessage('No designs found.')
    } catch {
      setMessage('Could not load Canva designs.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const importDesign = async (design: CanvaDesign) => {
    setImportingDesignId(design.id)
    setMessage('')
    try {
      const exportRes = await fetch('/api/integrations/canva/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: design.id, format: 'png' }),
      })
      const exportPayload = await exportRes.json()
      if (!exportRes.ok) {
        setMessage(exportPayload?.error || 'Could not create export job.')
        return
      }

      const exportJobId = extractExportJobId(exportPayload)
      if (!exportJobId) {
        setMessage('Export job ID missing in response.')
        return
      }

      let exportUrl: string | null = null
      let status = 'unknown'

      for (let attempt = 0; attempt < 20; attempt++) {
        await sleep(1500)
        const statusRes = await fetch(`/api/integrations/canva/exports/${encodeURIComponent(exportJobId)}`)
        const statusPayload = await statusRes.json()
        if (!statusRes.ok) {
          setMessage(statusPayload?.error || 'Could not read export job status.')
          return
        }

        status = extractExportStatus(statusPayload).toLowerCase()
        if (status === 'success' || status === 'completed') {
          exportUrl = extractExportUrl(statusPayload)
          break
        }
        if (status === 'failed') {
          setMessage('Export job failed in Canva.')
          return
        }
      }

      if (!exportUrl) {
        setMessage('Export did not finish in time. Try again.')
        return
      }

      const importRes = await fetch('/api/integrations/canva/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design_id: design.id,
          design_title: design.title || null,
          export_format: 'png',
          export_job_id: exportJobId,
          export_url: exportUrl,
          slug: slug.trim() || null,
        }),
      })
      const importPayload = await importRes.json()
      if (!importRes.ok) {
        setMessage(importPayload?.error || 'Could not import exported file.')
        return
      }

      setMessage('Imported successfully. Asset saved to your storage.')
      setImports((prev) => [importPayload as ImportedAsset, ...prev])
    } catch {
      setMessage('Canva import failed.')
    } finally {
      setImportingDesignId('')
    }
  }

  useEffect(() => {
    loadDesigns(false)
    loadImports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Canva Studio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a Canva design, export it, and import it into MemoryBanner.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Canva designs"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Optional gallery slug for cover update"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadDesigns(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            <RefreshCw size={14} />
            {loading ? 'Loading...' : 'Refresh list'}
          </button>
        </div>
        {message && <p className="text-sm text-gray-600">{message}</p>}
        {canvaDisconnected && (
          <Link
            href="/api/integrations/canva/connect?return_to=/dashboard/canva"
            prefetch={false}
            className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Connect Canva
          </Link>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Canva Designs</h2>
        {designs.length === 0 ? (
          <p className="text-sm text-gray-500">No designs loaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {designs.map((design) => (
              <div key={design.id} className="border border-gray-200 rounded-xl p-3 space-y-2">
                {design.thumbnail?.url ? (
                  <img src={design.thumbnail.url} alt="" className="w-full h-36 object-cover rounded-lg bg-gray-100" />
                ) : (
                  <div className="w-full h-36 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    No preview
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900 truncate">{design.title || design.id}</p>
                <div className="flex gap-2">
                  <a
                    href={design.urls?.edit_url || `https://www.canva.com/design/${design.id}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 hover:border-gray-400"
                  >
                    <ExternalLink size={12} />
                    Edit
                  </a>
                  <button
                    onClick={() => importDesign(design)}
                    disabled={importingDesignId === design.id}
                    className="inline-flex items-center gap-1 bg-black text-white rounded-lg px-2.5 py-1.5 text-xs disabled:opacity-60"
                  >
                    <Download size={12} />
                    {importingDesignId === design.id ? 'Importing...' : 'Import PNG'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {canLoadMore && (
          <div className="mt-4">
            <button
              onClick={() => loadDesigns(true)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:border-gray-400 disabled:opacity-60"
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Recently Imported</h2>
        {imports.length === 0 ? (
          <p className="text-sm text-gray-500">No imported designs yet.</p>
        ) : (
          <div className="space-y-2">
            {imports.map((item) => (
              <a
                key={item.id}
                href={item.asset_url}
                target="_blank"
                rel="noreferrer"
                className="block border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-400"
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.design_title || item.design_id}
                </p>
                <p className="text-xs text-gray-500">
                  {item.export_format.toUpperCase()} - {new Date(item.created_at).toLocaleString('en-US')}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
