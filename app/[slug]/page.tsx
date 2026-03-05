'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Order, Media, GuestbookEntry, PLAN_LIMITS } from '@/types'
import { t } from '@/lib/i18n'
import { Camera, Video, Heart, Send, X, Play, User } from 'lucide-react'

type ThemeStyle = {
  // Page
  bg: string
  text: string
  subtext: string
  divider: string
  // Accent / CTA
  accent: string
  accentHover: string
  accentText: string
  // Cards
  card: string
  cardBorder: string
  // Buttons / inputs
  radius: string
  inputBase: string
  inputFocus: string
  // Hero
  heroOverlay: string
  // Contributor chips
  chipActive: string
  chipInactive: string
  // Tab
  tabInactive: string
}

const THEMES: Record<string, ThemeStyle> = {
  romantic: {
    bg: 'bg-rose-50',
    text: 'text-rose-950',
    subtext: 'text-rose-400',
    divider: 'border-rose-200',
    accent: 'bg-rose-500',
    accentHover: 'hover:bg-rose-600',
    accentText: 'text-white',
    card: 'bg-white',
    cardBorder: 'border-rose-100',
    radius: 'rounded-2xl',
    inputBase: 'border-rose-200 bg-white text-rose-950 placeholder-rose-300',
    inputFocus: 'focus:ring-rose-200 focus:border-rose-400',
    heroOverlay: 'bg-gradient-to-b from-rose-950/10 via-black/30 to-rose-950/75',
    chipActive: 'bg-rose-500 text-white',
    chipInactive: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
    tabInactive: 'text-rose-300 hover:text-rose-600',
  },
  noir: {
    bg: 'bg-zinc-950',
    text: 'text-zinc-100',
    subtext: 'text-zinc-500',
    divider: 'border-zinc-800',
    accent: 'bg-zinc-100',
    accentHover: 'hover:bg-white',
    accentText: 'text-zinc-950',
    card: 'bg-zinc-900',
    cardBorder: 'border-zinc-800',
    radius: 'rounded-sm',
    inputBase: 'border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-600',
    inputFocus: 'focus:ring-zinc-600 focus:border-zinc-500',
    heroOverlay: 'bg-gradient-to-b from-transparent via-zinc-950/40 to-zinc-950/90',
    chipActive: 'bg-zinc-100 text-zinc-950',
    chipInactive: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
    tabInactive: 'text-zinc-600 hover:text-zinc-300',
  },
  golden: {
    bg: 'bg-amber-50',
    text: 'text-amber-950',
    subtext: 'text-amber-500',
    divider: 'border-amber-200',
    accent: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700',
    accentText: 'text-white',
    card: 'bg-white',
    cardBorder: 'border-amber-100',
    radius: 'rounded-lg',
    inputBase: 'border-amber-200 bg-white text-amber-950 placeholder-amber-300',
    inputFocus: 'focus:ring-amber-200 focus:border-amber-400',
    heroOverlay: 'bg-gradient-to-b from-amber-900/10 via-black/25 to-amber-950/80',
    chipActive: 'bg-amber-600 text-white',
    chipInactive: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    tabInactive: 'text-amber-400 hover:text-amber-700',
  },
  garden: {
    bg: 'bg-stone-50',
    text: 'text-stone-800',
    subtext: 'text-stone-400',
    divider: 'border-stone-200',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    accentText: 'text-white',
    card: 'bg-white',
    cardBorder: 'border-stone-200',
    radius: 'rounded-3xl',
    inputBase: 'border-stone-200 bg-white text-stone-800 placeholder-stone-300',
    inputFocus: 'focus:ring-emerald-200 focus:border-emerald-400',
    heroOverlay: 'bg-gradient-to-b from-emerald-950/10 via-black/25 to-stone-950/70',
    chipActive: 'bg-emerald-600 text-white',
    chipInactive: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    tabInactive: 'text-stone-400 hover:text-stone-600',
  },
  burgundy: {
    bg: 'bg-rose-950',
    text: 'text-rose-50',
    subtext: 'text-rose-400',
    divider: 'border-rose-800',
    accent: 'bg-rose-400',
    accentHover: 'hover:bg-rose-300',
    accentText: 'text-rose-950',
    card: 'bg-rose-900',
    cardBorder: 'border-rose-800',
    radius: 'rounded-xl',
    inputBase: 'border-rose-700 bg-rose-900 text-rose-100 placeholder-rose-600',
    inputFocus: 'focus:ring-rose-700 focus:border-rose-500',
    heroOverlay: 'bg-gradient-to-b from-transparent via-rose-950/40 to-rose-950/90',
    chipActive: 'bg-rose-400 text-rose-950',
    chipInactive: 'bg-rose-800 text-rose-300 hover:bg-rose-700',
    tabInactive: 'text-rose-600 hover:text-rose-300',
  },
  sage: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    subtext: 'text-slate-400',
    divider: 'border-slate-200',
    accent: 'bg-teal-700',
    accentHover: 'hover:bg-teal-800',
    accentText: 'text-white',
    card: 'bg-white',
    cardBorder: 'border-slate-200',
    radius: 'rounded-2xl',
    inputBase: 'border-slate-200 bg-white text-slate-700 placeholder-slate-300',
    inputFocus: 'focus:ring-teal-200 focus:border-teal-400',
    heroOverlay: 'bg-gradient-to-b from-teal-950/10 via-black/20 to-slate-900/75',
    chipActive: 'bg-teal-700 text-white',
    chipInactive: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
    tabInactive: 'text-slate-400 hover:text-slate-600',
  },
}

export default function GalleryPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [media, setMedia] = useState<Media[]>([])
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'guestbook'>('photos')
  const [lightbox, setLightbox] = useState<Media | null>(null)
  const [uploading, setUploading] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestMessage, setGuestMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  // Uploader name (localStorage-backed, per slug)
  const [uploaderName, setUploaderName] = useState('')
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const pendingUploadRef = useRef<{ file: File; type: 'photo' | 'video' } | null>(null)

  // Contributor filter
  const [activeContributor, setActiveContributor] = useState<string | null>(null)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/orders/${slug}`).then((r) => r.json()),
      fetch(`/api/media/${slug}`).then((r) => r.json()),
      fetch(`/api/guestbook/${slug}`).then((r) => r.json()),
    ]).then(([orderData, mediaData, gbData]) => {
      if (orderData.error) { router.push('/404'); return }
      if (!orderData.is_setup) { router.push(`/setup/${slug}`); return }
      setOrder(orderData)
      setMedia(Array.isArray(mediaData) ? mediaData : [])
      setGuestbook(Array.isArray(gbData) ? gbData : [])
    }).finally(() => setLoading(false))
  }, [slug, router])

  useEffect(() => {
    if (!slug) return
    const saved = localStorage.getItem(`mb_name_${slug}`)
    if (saved) setUploaderName(saved)
  }, [slug])

  const lang = order?.language ?? 'en'
  const s = THEMES[order?.template ?? 'romantic']
  const photos = media.filter((m) => m.type === 'photo')
  const videos = media.filter((m) => m.type === 'video')
  const limits = PLAN_LIMITS[order?.plan ?? 'free']
  const photoFull = limits.photos !== Infinity && photos.length >= limits.photos
  const videoFull = limits.videos === 0 || (limits.videos !== Infinity && videos.length >= limits.videos)
  const usagePercent = Math.max(
    limits.photos === Infinity ? 0 : photos.length / limits.photos,
    limits.videos === 0 ? 0 : limits.videos === Infinity ? 0 : videos.length / limits.videos
  ) * 100

  const contributors = Object.entries(
    photos.reduce<Record<string, number>>((acc, p) => {
      const name = p.uploaded_by || 'Guest'
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  const visiblePhotos = activeContributor
    ? photos.filter((p) => (p.uploaded_by || 'Guest') === activeContributor)
    : photos

  const doUpload = async (file: File, type: 'photo' | 'video', name: string) => {
    setUploading(true)
    try {
      const res = await fetch(`/api/upload/${type}/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'x-filename': encodeURIComponent(file.name),
          'x-filesize': String(file.size),
          'x-guest-name': encodeURIComponent(name),
        },
        body: file,
      })
      const data = await res.json()
      if (data.url) setMedia((prev) => [...prev, data])
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = (file: File, type: 'photo' | 'video') => {
    if (!order) return
    if (uploaderName) {
      doUpload(file, type, uploaderName)
    } else {
      pendingUploadRef.current = { file, type }
      setShowNamePrompt(true)
    }
  }

  const confirmName = () => {
    const name = nameInput.trim() || 'Guest'
    localStorage.setItem(`mb_name_${slug}`, name)
    setUploaderName(name)
    setShowNamePrompt(false)
    setNameInput('')
    if (pendingUploadRef.current) {
      const { file, type } = pendingUploadRef.current
      pendingUploadRef.current = null
      doUpload(file, type, name)
    }
  }

  const handleGuestbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim() || !guestMessage.trim()) return
    setSendingMsg(true)
    try {
      const res = await fetch(`/api/guestbook/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_name: guestName, message: guestMessage }),
      })
      const entry = await res.json()
      setGuestbook((prev) => [entry, ...prev])
      setGuestName('')
      setGuestMessage('')
    } finally {
      setSendingMsg(false)
    }
  }

  const daysLeft = order
    ? Math.max(0, Math.ceil((new Date(order.expires_at).getTime() - Date.now()) / 86400000))
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) return null

  return (
    <div className={`min-h-screen ${s.bg}`}>

      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {order.cover_photo_url ? (
          <img src={order.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${order.template === 'noir' ? 'bg-zinc-900' : order.template === 'golden' ? 'bg-amber-100' : order.template === 'garden' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            <Heart size={48} className="opacity-20" />
          </div>
        )}
        <div className={`absolute inset-0 ${s.heroOverlay} flex flex-col items-center justify-center text-white text-center px-4`}>
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg tracking-tight">
            {order.couple_names}
          </h1>
          {order.location && (
            <p className="text-sm sm:text-base opacity-90 drop-shadow">
              {new Date(order.event_date).toLocaleDateString(lang === 'en' ? 'en-US' : lang, {
                year: 'numeric', month: 'long', day: 'numeric',
              })} · {order.location}
            </p>
          )}
        </div>
      </div>

      {/* Upgrade banner */}
      {usagePercent >= 80 && order.plan !== 'premium_plus' && (
        <div className="bg-amber-500 text-white text-center text-sm py-2 px-4 font-medium">
          {t(lang, 'upgrade_banner')} · {t(lang, 'upgrade_cta')}
        </div>
      )}

      {/* Upload buttons */}
      <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
        <button
          onClick={() => !photoFull && photoInputRef.current?.click()}
          disabled={uploading || photoFull}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${s.radius} ${
            photoFull
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : `${s.accent} ${s.accentHover} ${s.accentText}`
          }`}
        >
          <Camera size={16} />
          {uploading ? '...' : t(lang, 'add_photo')}
          {!photoFull && limits.photos !== Infinity && (
            <span className="text-xs opacity-60">({photos.length}/{limits.photos})</span>
          )}
        </button>
        <button
          onClick={() => !videoFull && videoInputRef.current?.click()}
          disabled={uploading || videoFull}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border ${s.radius} ${
            videoFull
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
              : `${s.card} ${s.text} ${s.cardBorder} hover:opacity-80`
          }`}
        >
          <Video size={16} />
          {t(lang, 'add_video')}
          {!videoFull && limits.videos !== Infinity && limits.videos > 0 && (
            <span className="text-xs opacity-60">({videos.length}/{limits.videos})</span>
          )}
        </button>
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'photo')} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'video')} />
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4">
        <div className={`flex border-b ${s.divider}`}>
          {(['photos', 'videos', 'guestbook'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? `border-b-2 border-current ${s.text}`
                  : s.tabInactive
              }`}
            >
              {tab === 'photos' ? `${t(lang, 'photos')} (${photos.length})`
               : tab === 'videos' ? `${t(lang, 'videos')} (${videos.length})`
               : t(lang, 'guestbook')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Photos tab */}
        {activeTab === 'photos' && (
          <div>
            {/* Contributors strip */}
            {contributors.length > 0 && (
              <div className="mb-4">
                <p className={`text-xs font-medium uppercase tracking-widest mb-2 ${s.subtext}`}>
                  Contributors
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setActiveContributor(null)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${s.radius} ${
                      activeContributor === null ? s.chipActive : s.chipInactive
                    }`}
                  >
                    All · {photos.length}
                  </button>
                  {contributors.map(([name, count]) => (
                    <button
                      key={name}
                      onClick={() => setActiveContributor(activeContributor === name ? null : name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${s.radius} ${
                        activeContributor === name ? s.chipActive : s.chipInactive
                      }`}
                    >
                      <User size={10} />
                      {name} · {count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {visiblePhotos.length === 0 ? (
              <div className={`text-center py-16 ${s.subtext}`}>
                <Camera size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t(lang, 'add_photo')}</p>
              </div>
            ) : (
              <div className={`grid grid-cols-3 gap-1 overflow-hidden ${s.radius}`}>
                {visiblePhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setLightbox(photo)}
                    className="aspect-square overflow-hidden relative group"
                  >
                    <img
                      src={photo.thumbnail_url ?? photo.url}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {photo.uploaded_by && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {photo.uploaded_by}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos grid */}
        {activeTab === 'videos' && (
          videos.length === 0 ? (
            <div className={`text-center py-16 ${s.subtext}`}>
              <Video size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t(lang, 'add_video')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setLightbox(video)}
                  className={`aspect-video bg-black overflow-hidden relative group ${s.radius}`}
                >
                  {video.thumbnail_url
                    ? <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover opacity-70" />
                    : <div className={`w-full h-full ${order.template === 'noir' ? 'bg-zinc-800' : 'bg-gray-200'}`} />
                  }
                  <Play size={32} className="absolute inset-0 m-auto text-white drop-shadow-lg" />
                  {video.uploaded_by && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-1.5 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {video.uploaded_by}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )
        )}

        {/* Guestbook */}
        {activeTab === 'guestbook' && (
          <div className="space-y-6">
            <form onSubmit={handleGuestbookSubmit} className={`${s.card} border ${s.cardBorder} ${s.radius} p-5 space-y-3`}>
              <h3 className={`text-sm font-semibold ${s.text}`}>{t(lang, 'leave_message')}</h3>
              <input
                type="text"
                placeholder={t(lang, 'your_name')}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className={`w-full border ${s.inputBase} ${s.inputFocus} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2`}
              />
              <textarea
                placeholder={t(lang, 'your_message')}
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                rows={3}
                className={`w-full border ${s.inputBase} ${s.inputFocus} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none`}
              />
              <button
                type="submit"
                disabled={sendingMsg}
                className={`flex items-center gap-2 ${s.accent} ${s.accentHover} ${s.accentText} px-4 py-2 ${s.radius} text-sm font-medium transition-all disabled:opacity-50`}
              >
                <Send size={14} /> {t(lang, 'send')}
              </button>
            </form>

            <div className="space-y-3">
              {guestbook.map((entry) => (
                <div key={entry.id} className={`${s.card} border ${s.cardBorder} ${s.radius} p-4`}>
                  <p className={`font-semibold text-sm ${s.text}`}>{entry.guest_name}</p>
                  <p className={`text-sm mt-1 ${s.subtext}`}>{entry.message}</p>
                  <p className={`text-xs mt-2 ${s.subtext} opacity-60`}>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`text-center py-6 text-xs ${s.subtext}`}>
        {t(lang, 'expires_in')} {daysLeft} {t(lang, 'days')} · memorybanner.com
      </div>

      {/* Name prompt modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`${s.card} rounded-2xl p-6 w-full max-w-sm shadow-2xl border ${s.cardBorder}`}>
            <h2 className={`text-lg font-semibold mb-1 ${s.text}`}>What's your name?</h2>
            <p className={`text-sm mb-4 ${s.subtext}`}>So the couple knows who uploaded this.</p>
            <input
              type="text"
              placeholder="Your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmName()}
              autoFocus
              className={`w-full border ${s.inputBase} ${s.inputFocus} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 mb-4`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowNamePrompt(false); pendingUploadRef.current = null }}
                className={`flex-1 py-2.5 rounded-xl border ${s.cardBorder} text-sm ${s.subtext} hover:opacity-80 transition-opacity`}
              >
                Cancel
              </button>
              <button
                onClick={confirmName}
                className={`flex-1 py-2.5 rounded-xl ${s.accent} ${s.accentHover} ${s.accentText} text-sm font-medium transition-all`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          {lightbox.uploaded_by && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-xs bg-white/10 backdrop-blur px-4 py-2 rounded-full">
              {lightbox.uploaded_by}
            </div>
          )}
          {lightbox.type === 'photo' ? (
            <img
              src={lightbox.url}
              alt=""
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={lightbox.url}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  )
}
