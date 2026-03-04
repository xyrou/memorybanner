'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Order, PLAN_LIMITS } from '@/types'
import { Download, Plus, ExternalLink, Clock } from 'lucide-react'

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders', {
      headers: { 'x-admin-secret': ADMIN_SECRET },
    })
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  const downloadQR = async (slug: string, format: 'png' | 'svg') => {
    const res = await fetch(`/api/qr/${slug}?format=${format}`, {
      headers: { 'x-admin-secret': ADMIN_SECRET },
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-qr.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    premium: 'bg-blue-100 text-blue-700',
    premium_plus: 'bg-purple-100 text-purple-700',
  }

  const planLabels: Record<string, string> = {
    free: 'Free',
    premium: 'Premium',
    premium_plus: 'Premium Plus',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MemoryBanner Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Sipariş yönetimi ve QR kod üretimi</p>
          </div>
          <Link
            href="/admin/new"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            Yeni Sipariş
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            Henüz sipariş yok.{' '}
            <Link href="/admin/new" className="text-black underline">
              İlk siparişi oluştur
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Kod</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Çift</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tarih</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Plan</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Durum</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">QR İndir</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Link</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const expires = new Date(order.expires_at)
                  const daysLeft = Math.ceil((expires.getTime() - Date.now()) / 86400000)
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-gray-800">
                          {order.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.couple_names}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.event_date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${planColors[order.plan]}`}
                        >
                          {planLabels[order.plan]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.is_setup ? (
                          <span className="text-xs text-green-600 font-medium">✓ Kuruldu</span>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">⏳ Bekliyor</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadQR(order.slug, 'png')}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-black border border-gray-200 px-2 py-1 rounded hover:border-gray-400 transition-colors"
                            title="PNG indir (Illustrator için)"
                          >
                            <Download size={12} />
                            PNG
                          </button>
                          <button
                            onClick={() => downloadQR(order.slug, 'svg')}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-black border border-gray-200 px-2 py-1 rounded hover:border-gray-400 transition-colors"
                            title="SVG indir (vektör)"
                          >
                            <Download size={12} />
                            SVG
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
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
                            className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={12} />
                            Galeri
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
