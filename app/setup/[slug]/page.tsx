'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Order, Template } from '@/types'
import { t } from '@/lib/i18n'
import { Check, ChevronRight, ChevronLeft, Upload, Heart } from 'lucide-react'

const TEMPLATES: {
  value: Template
  label: string
  palette: string[]          // Swatch colors (CSS hex)
  preview: React.ReactNode
}[] = [
  {
    value: 'romantic',
    label: 'Romantic',
    palette: ['#fda4af', '#fb7185', '#fff1f2'],
    preview: (
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200">
        {/* Blurred blobs */}
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-rose-300/60 blur-xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-pink-200/70 blur-lg" />
        {/* Mini photo grid */}
        <div className="absolute top-3 left-3 flex gap-1">
          <div className="w-7 h-5 rounded bg-rose-300/70" />
          <div className="w-7 h-5 rounded bg-pink-300/60" />
          <div className="w-7 h-5 rounded bg-rose-200/80" />
        </div>
        {/* Heart accent */}
        <div className="absolute top-2 right-3 text-rose-400 text-xs">♥</div>
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-rose-200/80">
          <span className="text-xs font-semibold text-rose-800 tracking-wide">Romantic</span>
        </div>
      </div>
    ),
  },
  {
    value: 'noir',
    label: 'Noir',
    palette: ['#18181b', '#3f3f46', '#fafafa'],
    preview: (
      <div className="relative h-28 overflow-hidden bg-zinc-950">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        {/* Mini photo grid */}
        <div className="absolute top-3 left-3 flex gap-1">
          <div className="w-7 h-5 rounded-sm bg-zinc-700" />
          <div className="w-7 h-5 rounded-sm bg-zinc-600" />
          <div className="w-7 h-5 rounded-sm bg-zinc-800" />
        </div>
        {/* Accent dot */}
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-zinc-100" />
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-zinc-950">
          <span className="text-xs font-semibold text-zinc-100 tracking-widest uppercase">Noir</span>
        </div>
      </div>
    ),
  },
  {
    value: 'golden',
    label: 'Golden',
    palette: ['#d97706', '#fbbf24', '#fffbeb'],
    preview: (
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
        {/* Gold shimmer blobs */}
        <div className="absolute -top-4 -right-4 w-18 h-18 rounded-full bg-amber-300/50 blur-xl" />
        <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full bg-yellow-200/60 blur-lg" />
        {/* Diamond accent */}
        <div className="absolute top-3 right-4 w-3 h-3 rotate-45 bg-amber-400/80" />
        {/* Mini photo grid */}
        <div className="absolute top-3 left-3 flex gap-1">
          <div className="w-7 h-5 rounded bg-amber-200/70" />
          <div className="w-7 h-5 rounded bg-yellow-200/70" />
          <div className="w-7 h-5 rounded bg-amber-300/60" />
        </div>
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-amber-100/90">
          <span className="text-xs font-semibold text-amber-900 tracking-wide">Golden</span>
        </div>
      </div>
    ),
  },
  {
    value: 'garden',
    label: 'Garden',
    palette: ['#059669', '#6ee7b7', '#f5f5f4'],
    preview: (
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-emerald-50 via-stone-50 to-emerald-100">
        <div className="absolute -top-4 right-2 w-16 h-16 rounded-full bg-emerald-200/60 blur-lg" />
        <div className="absolute bottom-0 -left-2 w-12 h-12 rounded-full bg-emerald-300/40 blur-lg" />
        <div className="absolute top-3 right-3 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-300/80 mt-0.5" />
        </div>
        <div className="absolute top-3 left-3 flex gap-1">
          <div className="w-7 h-5 rounded-xl bg-emerald-200/70" />
          <div className="w-7 h-5 rounded-xl bg-stone-200/70" />
          <div className="w-7 h-5 rounded-xl bg-emerald-100/80" />
        </div>
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-emerald-100/80">
          <span className="text-xs font-semibold text-emerald-900 tracking-wide">Garden</span>
        </div>
      </div>
    ),
  },
  {
    value: 'burgundy',
    label: 'Burgundy',
    palette: ['#4c0519', '#9f1239', '#fda4af'],
    preview: (
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-rose-950 via-rose-900 to-rose-800">
        {/* Velvet sheen blobs */}
        <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-rose-700/40 blur-xl" />
        <div className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-rose-600/30 blur-lg" />
        {/* Rose accent */}
        <div className="absolute top-3 right-3 text-rose-400/80 text-sm">✦</div>
        {/* Mini photo grid */}
        <div className="absolute top-3 left-3 flex gap-1">
          <div className="w-7 h-5 rounded bg-rose-700/70" />
          <div className="w-7 h-5 rounded bg-rose-800/60" />
          <div className="w-7 h-5 rounded bg-rose-600/50" />
        </div>
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-rose-950">
          <span className="text-xs font-semibold text-rose-200 tracking-wide">Burgundy</span>
        </div>
      </div>
    ),
  },
  {
    value: 'sage',
    label: 'Sage',
    palette: ['#0f766e', '#99f6e4', '#f8fafc'],
    preview: (
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100">
        {/* Misty blobs */}
        <div className="absolute -top-6 right-0 w-20 h-20 rounded-full bg-teal-200/50 blur-xl" />
        <div className="absolute bottom-0 left-4 w-14 h-14 rounded-full bg-teal-100/60 blur-lg" />
        {/* Delicate lines */}
        <div className="absolute top-4 right-4 w-6 h-px bg-teal-400/60" />
        <div className="absolute top-6 right-4 w-4 h-px bg-teal-300/50" />
        {/* Mini photo grid */}
        <div className="absolute top-3 left-3 flex gap-1">
          <div className="w-7 h-5 rounded-2xl bg-teal-200/60" />
          <div className="w-7 h-5 rounded-2xl bg-slate-200/70" />
          <div className="w-7 h-5 rounded-2xl bg-teal-100/70" />
        </div>
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-slate-100/90">
          <span className="text-xs font-semibold text-teal-800 tracking-wide">Sage</span>
        </div>
      </div>
    ),
  },
]

export default function SetupPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1) // 1: template, 2: details, 3: cover, 4: done
  const [saving, setSaving] = useState(false)

  const [template, setTemplate] = useState<Template>('romantic')
  const [location, setLocation] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/orders/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { router.push('/404'); return }
        if (data.is_setup) { router.push(`/${slug}`); return }
        setOrder(data)
        setTemplate(data.template || 'romantic')
      })
      .finally(() => setLoading(false))
  }, [slug, router])

  const lang = order?.language ?? 'en'

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleFinish = async () => {
    if (!order) return
    setSaving(true)
    try {
      let coverUrl = null
      if (coverFile) {
        const uploadRes = await fetch(`/api/upload/cover/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': coverFile.type },
          body: coverFile,
        })
        const uploadData = await uploadRes.json()
        coverUrl = uploadData.url
      }

      await fetch(`/api/orders/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          location,
          cover_photo_url: coverUrl,
          is_setup: true,
        }),
      })
      setStep(4)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) return null

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const galleryUrl = `${appUrl}/${slug}`

  // Step 4: Done
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-green-600" size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{t(lang, 'gallery_live')}</h2>
          <p className="text-gray-500 text-sm mb-6">{t(lang, 'gallery_live_sub')}</p>
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono break-all mb-4">
            {galleryUrl}
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(galleryUrl); router.push(`/${slug}`) }}
            className="w-full bg-black text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {t(lang, 'copy_link')} & {t(lang, 'next')} →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-10">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
            {order.couple_names}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{t(lang, 'setup_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t(lang, 'setup_subtitle')}</p>
        </div>

        {/* Step 1: Template */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t(lang, 'step_template')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.value}
                  onClick={() => setTemplate(tmpl.value)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                    template === tmpl.value
                      ? 'border-black scale-[1.02] shadow-lg'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  {tmpl.preview}
                  {template === tmpl.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center z-10">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Color swatches for selected theme */}
            <div className="flex items-center gap-3 px-1">
              <span className="text-xs text-gray-400">Selected:</span>
              <div className="flex gap-1.5">
                {TEMPLATES.find((t) => t.value === template)?.palette.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-600">
                {TEMPLATES.find((t) => t.value === template)?.label}
              </span>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors mt-4"
            >
              {t(lang, 'next')} <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t(lang, 'step_details')}
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(lang, 'couple_names')}
                </label>
                <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-50">
                  {order.couple_names}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(lang, 'wedding_date')}
                </label>
                <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-50">
                  {new Date(order.event_date).toLocaleDateString(lang === 'en' ? 'en-US' : lang, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(lang, 'location')}
                </label>
                <input
                  type="text"
                  placeholder={t(lang, 'location_placeholder')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 border border-gray-200 rounded-xl px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} /> {t(lang, 'back')}
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {t(lang, 'next')} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Cover photo */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t(lang, 'step_cover')}
            </h2>
            <label className="block cursor-pointer">
              <div className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden ${
                coverPreview ? 'border-black' : 'border-gray-300 hover:border-gray-400'
              }`}>
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-56 object-cover" />
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center gap-3 text-gray-400">
                    <Upload size={32} />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">{t(lang, 'upload_cover')}</p>
                      <p className="text-xs mt-1">{t(lang, 'upload_cover_hint')}</p>
                    </div>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 border border-gray-200 rounded-xl px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} /> {t(lang, 'back')}
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Heart size={16} /> {t(lang, 'finish')}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
