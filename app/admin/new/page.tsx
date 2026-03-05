'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { LANGUAGES } from '@/types'
import { useAdminSecret } from '../layout'

export default function NewOrderPage() {
  const adminSecret = useAdminSecret()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<{ slug: string; setupUrl: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    couple_names: '',
    event_date: '',
    email: '',
    language: 'en',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify(form),
      })
      const order = await res.json()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      setCreated({
        slug: order.slug,
        setupUrl: `${appUrl}/setup/${order.slug}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = async (format: 'png' | 'svg') => {
    if (!created) return
    const res = await fetch(`/api/qr/${created.slug}?format=${format}`, {
      headers: { 'x-admin-secret': adminSecret },
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${created.slug}-qr.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copySetupUrl = () => {
    if (!created) return
    navigator.clipboard.writeText(created.setupUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (created) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="text-green-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Sipariş Oluşturuldu</h2>
            <p className="text-gray-500 text-sm mt-1">
              Kod:{' '}
              <span className="font-mono font-bold text-gray-800">{created.slug}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                1. QR Kodu İndir (Illustrator&apos;a yerleştir)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadQR('png')}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} />
                  PNG (1200px)
                </button>
                <button
                  onClick={() => downloadQR('svg')}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} />
                  SVG (Vektör)
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                2. Setup Linkini Etsy Mesajına Ekle
              </p>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-600 flex-1 truncate">{created.setupUrl}</p>
                <button
                  onClick={copySetupUrl}
                  className="text-gray-500 hover:text-black transition-colors shrink-0"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Müşteriye bu linki Etsy mesajında gönder
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setCreated(null)}
              className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
            >
              Yeni Sipariş
            </button>
            <Link
              href="/admin"
              className="flex-1 bg-black text-white text-center rounded-lg py-2.5 text-sm hover:bg-gray-800 transition-colors"
            >
              Listeye Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Yeni Sipariş</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Çift İsimleri
            </label>
            <input
              type="text"
              required
              placeholder="Ayşe & Mehmet"
              value={form.couple_names}
              onChange={(e) => setForm({ ...form, couple_names: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Düğün Tarihi
            </label>
            <input
              type="date"
              required
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Müşteri E-posta <span className="text-gray-400">(opsiyonel)</span>
            </label>
            <input
              type="email"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Galeri Dili
            </label>
            <div className="grid grid-cols-5 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setForm({ ...form, language: lang.value })}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    form.language === lang.value
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400 text-gray-600'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.value.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Oluşturuluyor...' : 'Sipariş Oluştur & QR Üret'}
          </button>
        </form>
      </div>
    </div>
  )
}
