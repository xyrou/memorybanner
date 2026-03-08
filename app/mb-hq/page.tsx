'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Order } from '@/types'
import { Download, Plus, ExternalLink, FileSpreadsheet, ShieldCheck } from 'lucide-react'
import { useAdminSecret } from './layout'

type ExportType = 'rsvp' | 'guestbook' | 'media'

export default function AdminPage() {
  const adminSecret = useAdminSecret()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders', {
      headers: { 'x-admin-secret': adminSecret },
    })
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [adminSecret])

  const downloadQR = async (slug: string, format: 'png' | 'svg') => {
    const res = await fetch(`/api/qr/${slug}?format=${format}`, {
      headers: { 'x-admin-secret': adminSecret },
    })
    if (!res.ok) {
      alert('QR download failed.')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-qr.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCsv = async (slug: string, type: ExportType) => {
    const res = await fetch(`/api/export/${slug}?type=${type}`, {
      headers: { 'x-admin-secret': adminSecret },
    })
    if (!res.ok) {
      alert('CSV export failed.')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-${type}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const planColors: Record<string, string> = {
    starter: 'bg-gray-100 text-gray-700',
    silver: 'bg-slate-100 text-slate-700',
    gold: 'bg-amber-100 text-amber-700',
    premium: 'bg-blue-100 text-blue-700',
    free: 'bg-gray-100 text-gray-700',
    premium_plus: 'bg-blue-100 text-blue-700',
  }

  const planLabels: Record<string, string> = {
    starter: 'Starter',
    silver: 'Silver',
    gold: 'Gold',
    premium: 'Premium',
    free: 'Starter',
    premium_plus: 'Premium',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MemoryBanner Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Order management, moderation, and exports</p>
          </div>
          <Link
            href="/mb-hq/new"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            New Order
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No orders yet.{' '}
            <Link href="/mb-hq/new" className="text-black underline">
              Create your first order
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Code</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Couple</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Plan</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">QR</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Export</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Links</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-800">{order.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.couple_names}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.event_date).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${planColors[order.plan] ?? 'bg-gray-100 text-gray-700'}`}>
                        {planLabels[order.plan] ?? order.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.is_setup ? (
                        <span className="text-xs text-green-700 font-medium">Ready</span>
                      ) : (
                        <span className="text-xs text-amber-700 font-medium">Waiting setup</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadQR(order.slug, 'png')}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-black border border-gray-200 px-2 py-1 rounded hover:border-gray-400 transition-colors"
                          title="Download PNG"
                        >
                          <Download size={12} />
                          PNG
                        </button>
                        <button
                          onClick={() => downloadQR(order.slug, 'svg')}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-black border border-gray-200 px-2 py-1 rounded hover:border-gray-400 transition-colors"
                          title="Download SVG"
                        >
                          <Download size={12} />
                          SVG
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => downloadCsv(order.slug, 'rsvp')}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-black border border-gray-200 px-2 py-1 rounded hover:border-gray-400 transition-colors"
                        >
                          <FileSpreadsheet size={12} />
                          RSVP
                        </button>
                        <button
                          onClick={() => downloadCsv(order.slug, 'guestbook')}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-black border border-gray-200 px-2 py-1 rounded hover:border-gray-400 transition-colors"
                        >
                          <FileSpreadsheet size={12} />
                          Guestbook
                        </button>
                        <button
                          onClick={() => downloadCsv(order.slug, 'media')}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-black border border-gray-200 px-2 py-1 rounded hover:border-gray-400 transition-colors"
                        >
                          <FileSpreadsheet size={12} />
                          Media
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <a
                          href={`/setup/${order.slug}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          Setup
                        </a>
                        <a
                          href={`/${order.slug}`}
                          target="_blank"
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          Gallery
                        </a>
                        <Link
                          href={`/mb-hq/moderation/${order.slug}`}
                          className="text-xs text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <ShieldCheck size={12} />
                          Moderate
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
