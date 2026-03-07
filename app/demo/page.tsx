'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Camera, Video, Heart, Send, X, User } from 'lucide-react'

type ThemeKey = 'romantic' | 'noir' | 'golden' | 'garden' | 'burgundy' | 'sage'

type ThemeStyle = {
  bg: string; text: string; subtext: string; divider: string
  accent: string; accentHover: string; accentText: string
  card: string; cardBorder: string; radius: string
  inputBase: string; inputFocus: string; heroOverlay: string
  chipActive: string; chipInactive: string; tabInactive: string
  heroBg: string
}

const THEMES: Record<ThemeKey, ThemeStyle> = {
  romantic: {
    bg: 'bg-rose-50', text: 'text-rose-950', subtext: 'text-rose-400', divider: 'border-rose-200',
    accent: 'bg-rose-500', accentHover: 'hover:bg-rose-600', accentText: 'text-white',
    card: 'bg-white', cardBorder: 'border-rose-100', radius: 'rounded-2xl',
    inputBase: 'border-rose-200 bg-white text-rose-950 placeholder-rose-300',
    inputFocus: 'focus:ring-rose-200 focus:border-rose-400',
    heroOverlay: 'bg-gradient-to-b from-rose-950/10 via-black/30 to-rose-950/75',
    chipActive: 'bg-rose-500 text-white', chipInactive: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
    tabInactive: 'text-rose-300 hover:text-rose-600',
    heroBg: 'bg-gradient-to-br from-rose-200 via-pink-100 to-rose-300',
  },
  noir: {
    bg: 'bg-zinc-950', text: 'text-zinc-100', subtext: 'text-zinc-500', divider: 'border-zinc-800',
    accent: 'bg-zinc-100', accentHover: 'hover:bg-white', accentText: 'text-zinc-950',
    card: 'bg-zinc-900', cardBorder: 'border-zinc-800', radius: 'rounded-sm',
    inputBase: 'border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-600',
    inputFocus: 'focus:ring-zinc-600 focus:border-zinc-500',
    heroOverlay: 'bg-gradient-to-b from-transparent via-zinc-950/40 to-zinc-950/90',
    chipActive: 'bg-zinc-100 text-zinc-950', chipInactive: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
    tabInactive: 'text-zinc-600 hover:text-zinc-300',
    heroBg: 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-black',
  },
  golden: {
    bg: 'bg-amber-50', text: 'text-amber-950', subtext: 'text-amber-500', divider: 'border-amber-200',
    accent: 'bg-amber-600', accentHover: 'hover:bg-amber-700', accentText: 'text-white',
    card: 'bg-white', cardBorder: 'border-amber-100', radius: 'rounded-lg',
    inputBase: 'border-amber-200 bg-white text-amber-950 placeholder-amber-300',
    inputFocus: 'focus:ring-amber-200 focus:border-amber-400',
    heroOverlay: 'bg-gradient-to-b from-amber-900/10 via-black/25 to-amber-950/80',
    chipActive: 'bg-amber-600 text-white', chipInactive: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    tabInactive: 'text-amber-400 hover:text-amber-700',
    heroBg: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200',
  },
  garden: {
    bg: 'bg-stone-50', text: 'text-stone-800', subtext: 'text-stone-400', divider: 'border-stone-200',
    accent: 'bg-emerald-600', accentHover: 'hover:bg-emerald-700', accentText: 'text-white',
    card: 'bg-white', cardBorder: 'border-stone-200', radius: 'rounded-3xl',
    inputBase: 'border-stone-200 bg-white text-stone-800 placeholder-stone-300',
    inputFocus: 'focus:ring-emerald-200 focus:border-emerald-400',
    heroOverlay: 'bg-gradient-to-b from-emerald-950/10 via-black/25 to-stone-950/70',
    chipActive: 'bg-emerald-600 text-white', chipInactive: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    tabInactive: 'text-stone-400 hover:text-stone-600',
    heroBg: 'bg-gradient-to-br from-emerald-100 via-stone-50 to-emerald-200',
  },
  burgundy: {
    bg: 'bg-rose-950', text: 'text-rose-50', subtext: 'text-rose-400', divider: 'border-rose-800',
    accent: 'bg-rose-400', accentHover: 'hover:bg-rose-300', accentText: 'text-rose-950',
    card: 'bg-rose-900', cardBorder: 'border-rose-800', radius: 'rounded-xl',
    inputBase: 'border-rose-700 bg-rose-900 text-rose-100 placeholder-rose-600',
    inputFocus: 'focus:ring-rose-700 focus:border-rose-500',
    heroOverlay: 'bg-gradient-to-b from-transparent via-rose-950/40 to-rose-950/90',
    chipActive: 'bg-rose-400 text-rose-950', chipInactive: 'bg-rose-800 text-rose-300 hover:bg-rose-700',
    tabInactive: 'text-rose-600 hover:text-rose-300',
    heroBg: 'bg-gradient-to-br from-rose-900 via-rose-950 to-black',
  },
  sage: {
    bg: 'bg-slate-50', text: 'text-slate-700', subtext: 'text-slate-400', divider: 'border-slate-200',
    accent: 'bg-teal-700', accentHover: 'hover:bg-teal-800', accentText: 'text-white',
    card: 'bg-white', cardBorder: 'border-slate-200', radius: 'rounded-2xl',
    inputBase: 'border-slate-200 bg-white text-slate-700 placeholder-slate-300',
    inputFocus: 'focus:ring-teal-200 focus:border-teal-400',
    heroOverlay: 'bg-gradient-to-b from-teal-950/10 via-black/20 to-slate-900/75',
    chipActive: 'bg-teal-700 text-white', chipInactive: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
    tabInactive: 'text-slate-400 hover:text-slate-600',
    heroBg: 'bg-gradient-to-br from-teal-50 via-slate-100 to-teal-100',
  },
}

const THEME_META: { key: ThemeKey; label: string; swatch: string }[] = [
  { key: 'romantic', label: 'Romantic', swatch: 'bg-rose-400' },
  { key: 'noir',     label: 'Noir',     swatch: 'bg-zinc-800' },
  { key: 'golden',   label: 'Golden',   swatch: 'bg-amber-500' },
  { key: 'garden',   label: 'Garden',   swatch: 'bg-emerald-500' },
  { key: 'burgundy', label: 'Burgundy', swatch: 'bg-rose-900' },
  { key: 'sage',     label: 'Sage',     swatch: 'bg-teal-600' },
]

const MOCK_PHOTOS = [
  { id: '1', color: 'bg-rose-100' },
  { id: '2', color: 'bg-amber-100' },
  { id: '3', color: 'bg-slate-200' },
  { id: '4', color: 'bg-pink-100' },
  { id: '5', color: 'bg-stone-200' },
  { id: '6', color: 'bg-rose-200' },
  { id: '7', color: 'bg-amber-200' },
  { id: '8', color: 'bg-slate-100' },
  { id: '9', color: 'bg-pink-200' },
]

const MOCK_CONTRIBUTORS = [
  { name: 'Emma R.', count: 4 },
  { name: 'James K.', count: 3 },
  { name: 'Sophia M.', count: 2 },
]

const MOCK_GUESTBOOK = [
  { id: '1', name: 'Emma & James', message: 'What a beautiful wedding! Wishing you both a lifetime of happiness together.', date: '2025-06-15' },
  { id: '2', name: 'Sophia M.', message: 'The ceremony was absolutely magical. Thank you for letting us be part of your special day!', date: '2025-06-15' },
  { id: '3', name: 'Oliver K.', message: 'You two are perfect for each other. Congratulations from all of us!', date: '2025-06-14' },
]

export default function DemoPage() {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('romantic')
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'guestbook'>('photos')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [activeContributor, setActiveContributor] = useState<string | null>(null)

  const s = THEMES[activeTheme]

  return (
    <div className={`min-h-screen ${s.bg} transition-colors duration-300`}>

      {/* Demo banner */}
      <div className="bg-gray-900 text-white text-center text-xs py-2.5 px-4 flex items-center justify-center gap-3">
        <span className="opacity-70">This is a demo — see what your guests will experience</span>
        <Link
          href="/auth/signup"
          className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-100 transition-colors"
        >
          Create yours →
        </Link>
      </div>

      {/* Theme switcher */}
      <div className={`${s.card} border-b ${s.divider} sticky top-0 z-30 transition-colors duration-300`}>
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
          <span className={`text-xs font-medium whitespace-nowrap ${s.subtext}`}>Theme:</span>
          {THEME_META.map((tm) => (
            <button
              key={tm.key}
              onClick={() => setActiveTheme(tm.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${s.radius} border ${
                activeTheme === tm.key
                  ? `${s.accent} ${s.accentText} border-transparent shadow-sm`
                  : `${s.card} ${s.text} ${s.cardBorder} hover:opacity-80`
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${tm.swatch} flex-shrink-0`} />
              {tm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <div className={`w-full h-full ${s.heroBg} flex items-center justify-center transition-colors duration-300`}>
          <Heart size={64} className="opacity-20" fill="currentColor" />
        </div>
        <div className={`absolute inset-0 ${s.heroOverlay} flex flex-col items-center justify-center text-white text-center px-4`}>
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg tracking-tight">Sarah & Michael</h1>
          <p className="text-sm sm:text-base opacity-90 drop-shadow">June 15, 2025 · Tuscany, Italy</p>
        </div>
      </div>

      {/* Upload buttons */}
      <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
        <button className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${s.radius} ${s.accent} ${s.accentHover} ${s.accentText}`}>
          <Camera size={16} />
          Add Photo
          <span className="text-xs opacity-60">(9/∞)</span>
        </button>
        <button className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border ${s.radius} ${s.card} ${s.text} ${s.cardBorder} hover:opacity-80 transition-opacity`}>
          <Video size={16} />
          Add Video
          <span className="text-xs opacity-60">(0/5)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4">
        <div className={`flex border-b ${s.divider}`}>
          {(['photos', 'videos', 'guestbook'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? `border-b-2 border-current ${s.text}` : s.tabInactive
              }`}
            >
              {tab === 'photos' ? `Photos (${MOCK_PHOTOS.length})`
               : tab === 'videos' ? 'Videos (0)'
               : 'Guestbook'}
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
            <div className="mb-4">
              <p className={`text-xs font-medium uppercase tracking-widest mb-2 ${s.subtext}`}>Contributors</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveContributor(null)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${s.radius} ${
                    activeContributor === null ? s.chipActive : s.chipInactive
                  }`}
                >
                  All · {MOCK_PHOTOS.length}
                </button>
                {MOCK_CONTRIBUTORS.map(({ name, count }) => (
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

            <div className={`grid grid-cols-3 gap-1 overflow-hidden ${s.radius}`}>
              {MOCK_PHOTOS.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setLightbox(photo.id)}
                  className={`aspect-square ${photo.color} hover:opacity-80 transition-opacity flex items-center justify-center`}
                >
                  <Heart size={20} className="text-white/40" fill="currentColor" />
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className={`text-center py-16 ${s.subtext}`}>
            <Video size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No videos yet — be the first to share!</p>
          </div>
        )}

        {activeTab === 'guestbook' && (
          <div className="space-y-6">
            <div className={`${s.card} border ${s.cardBorder} ${s.radius} p-5 space-y-3`}>
              <h3 className={`text-sm font-semibold ${s.text}`}>Leave a Message</h3>
              <input
                type="text"
                placeholder="Your Name"
                disabled
                className={`w-full border ${s.inputBase} rounded-lg px-3 py-2 text-sm opacity-60 cursor-not-allowed`}
              />
              <textarea
                placeholder="Your message…"
                disabled
                rows={3}
                className={`w-full border ${s.inputBase} rounded-lg px-3 py-2 text-sm resize-none opacity-60 cursor-not-allowed`}
              />
              <button
                disabled
                className={`flex items-center gap-2 ${s.accent} ${s.accentText} px-4 py-2 ${s.radius} text-sm font-medium opacity-50 cursor-not-allowed`}
              >
                <Send size={14} /> Send
              </button>
            </div>

            <div className="space-y-3">
              {MOCK_GUESTBOOK.map((entry) => (
                <div key={entry.id} className={`${s.card} border ${s.cardBorder} ${s.radius} p-4`}>
                  <p className={`font-semibold text-sm ${s.text}`}>{entry.name}</p>
                  <p className={`text-sm mt-1 ${s.subtext}`}>{entry.message}</p>
                  <p className={`text-xs mt-2 ${s.subtext} opacity-60`}>
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`text-center pb-24 pt-4 text-xs ${s.subtext}`}>
        Gallery available for 365 days · memorybanner.com
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          <div
            className={`w-72 h-72 rounded-xl ${MOCK_PHOTOS.find(p => p.id === lightbox)?.color} flex items-center justify-center`}
            onClick={(e) => e.stopPropagation()}
          >
            <Heart size={48} className="text-white/30" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Love what you see?</p>
            <p className="text-xs text-gray-400">Create your gallery in minutes</p>
          </div>
          <Link
            href="/auth/signup"
            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  )
}
