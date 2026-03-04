'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Order, Media, GuestbookEntry, PLAN_LIMITS } from '@/types'
import { t } from '@/lib/i18n'
import { Camera, Video, Heart, Send, Download, ChevronDown, X, Play } from 'lucide-react'

const TEMPLATE_STYLES: Record<string, { bg: string; text: string; accent: string; card: string }> = {
  romantic: { bg: 'bg-rose-50',   text: 'text-rose-900',  accent: 'bg-rose-500',  card: 'bg-white' },
  modern:   { bg: 'bg-slate-900', text: 'text-white',     accent: 'bg-white',     card: 'bg-slate-800' },
  rustic:   { bg: 'bg-amber-50',  text: 'text-amber-900', accent: 'bg-amber-600', card: 'bg-white' },
  minimal:  { bg: 'bg-white',     text: 'text-gray-900',  accent: 'bg-gray-900',  card: 'bg-gray-50' },
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

  const lang = order?.language ?? 'en'
  const style = TEMPLATE_STYLES[order?.template ?? 'romantic']
  const photos = media.filter((m) => m.type === 'photo')
  const videos = media.filter((m) => m.type === 'video')
  const limits = PLAN_LIMITS[order?.plan ?? 'free']
  const photoFull = limits.photos !== Infinity && photos.length >= limits.photos
  const videoFull = limits.videos === 0 || (limits.videos !== Infinity && videos.length >= limits.videos)
  const usagePercent = Math.max(
    limits.photos === Infinity ? 0 : photos.length / limits.photos,
    limits.videos === 0 ? 0 : limits.videos === Infinity ? 0 : videos.length / limits.videos
  ) * 100

  const handleUpload = async (file: File, type: 'photo' | 'video') => {
    if (!order) return
    setUploading(true)
    try {
      const res = await fetch(`/api/upload/${type}/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'x-filename': encodeURIComponent(file.name), 'x-filesize': String(file.size) },
        body: file,
      })
      const data = await res.json()
      if (data.url) {
        setMedia((prev) => [...prev, data])
      }
    } finally {
      setUploading(false)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) return null

  return (
    <div className={`min-h-screen ${style.bg}`}>
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {order.cover_photo_url ? (
          <img src={order.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full ${style.bg} flex items-center justify-center`}>
            <Heart size={48} className="opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg">{order.couple_names}</h1>
          {order.location && (
            <p className="text-sm sm:text-base opacity-90">
              {new Date(order.event_date).toLocaleDateString(lang === 'en' ? 'en-US' : lang, {
                year: 'numeric', month: 'long', day: 'numeric',
              })} · {order.location}
            </p>
          )}
        </div>
      </div>

      {/* Upgrade banner */}
      {usagePercent >= 80 && order.plan !== 'premium_plus' && (
        <div className="bg-amber-500 text-white text-center text-sm py-2 px-4">
          {t(lang, 'upgrade_banner')} · {t(lang, 'upgrade_cta')}
        </div>
      )}

      {/* Upload buttons */}
      <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
        <button
          onClick={() => !photoFull && photoInputRef.current?.click()}
          disabled={uploading || photoFull}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${
            photoFull
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : `${style.accent} ${order.template === 'modern' ? 'text-slate-900' : 'text-white'} hover:opacity-90`
          }`}
        >
          <Camera size={16} />
          {uploading ? '...' : t(lang, 'add_photo')}
          {!photoFull && limits.photos !== Infinity && (
            <span className="text-xs opacity-70">({photos.length}/{limits.photos})</span>
          )}
        </button>
        <button
          onClick={() => !videoFull && videoInputRef.current?.click()}
          disabled={uploading || videoFull}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${
            videoFull
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : `${style.card} ${style.text} border border-gray-200 hover:opacity-80`
          }`}
        >
          <Video size={16} />
          {t(lang, 'add_video')}
          {!videoFull && limits.videos !== Infinity && limits.videos > 0 && (
            <span className="text-xs opacity-70">({videos.length}/{limits.videos})</span>
          )}
        </button>
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'photo')} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'video')} />
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4">
        <div className={`flex border-b ${order.template === 'modern' ? 'border-slate-700' : 'border-gray-200'}`}>
          {(['photos', 'videos', 'guestbook'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? `border-b-2 border-current ${style.text}`
                  : 'text-gray-400 hover:text-gray-600'
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
        {/* Photos grid */}
        {activeTab === 'photos' && (
          photos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Camera size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t(lang, 'add_photo')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {photos.map((photo) => (
                <button key={photo.id} onClick={() => setLightbox(photo)} className="aspect-square overflow-hidden rounded">
                  <img src={photo.thumbnail_url ?? photo.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </button>
              ))}
            </div>
          )
        )}

        {/* Videos grid */}
        {activeTab === 'videos' && (
          videos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Video size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t(lang, 'add_video')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {videos.map((video) => (
                <button key={video.id} onClick={() => setLightbox(video)}
                  className="aspect-video bg-black rounded-xl overflow-hidden relative">
                  {video.thumbnail_url
                    ? <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover opacity-70" />
                    : <div className="w-full h-full bg-slate-800" />
                  }
                  <Play size={32} className="absolute inset-0 m-auto text-white drop-shadow" />
                </button>
              ))}
            </div>
          )
        )}

        {/* Guestbook */}
        {activeTab === 'guestbook' && (
          <div className="space-y-6">
            <form onSubmit={handleGuestbookSubmit} className={`${style.card} rounded-xl p-4 space-y-3 border border-gray-100`}>
              <h3 className={`text-sm font-semibold ${style.text}`}>{t(lang, 'leave_message')}</h3>
              <input
                type="text"
                placeholder={t(lang, 'your_name')}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <textarea
                placeholder={t(lang, 'your_message')}
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
              />
              <button
                type="submit"
                disabled={sendingMsg}
                className={`flex items-center gap-2 ${style.accent} ${order.template === 'modern' ? 'text-slate-900' : 'text-white'} px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
              >
                <Send size={14} /> {t(lang, 'send')}
              </button>
            </form>

            <div className="space-y-3">
              {guestbook.map((entry) => (
                <div key={entry.id} className={`${style.card} rounded-xl p-4 border border-gray-100`}>
                  <p className={`font-semibold text-sm ${style.text}`}>{entry.guest_name}</p>
                  <p className="text-gray-500 text-sm mt-1">{entry.message}</p>
                  <p className="text-gray-300 text-xs mt-2">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-gray-400">
        {t(lang, 'expires_in')} {daysLeft} {t(lang, 'days')} · memorybanner.com
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          {lightbox.type === 'photo' ? (
            <img src={lightbox.url} alt="" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
          ) : (
            <video src={lightbox.url} controls autoPlay className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </div>
  )
}
