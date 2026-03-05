'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Camera, Video, Heart, Send, X, Play, ArrowLeft } from 'lucide-react'

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

const MOCK_GUESTBOOK = [
  { id: '1', name: 'Emma & James', message: 'What a beautiful wedding! Wishing you both a lifetime of happiness together. 💕', date: '2025-06-15' },
  { id: '2', name: 'Sophia M.', message: 'The ceremony was absolutely magical. Thank you for letting us be part of your special day!', date: '2025-06-15' },
  { id: '3', name: 'Oliver K.', message: 'You two are perfect for each other. Congratulations from all of us!', date: '2025-06-14' },
]

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'guestbook'>('photos')
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Demo banner */}
      <div className="bg-gray-900 text-white text-center text-xs py-2.5 px-4 flex items-center justify-center gap-3">
        <span className="opacity-70">This is a demo gallery — see what your guests will experience</span>
        <Link
          href="/auth/signup"
          className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-100 transition-colors"
        >
          Create yours →
        </Link>
      </div>

      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100 flex items-center justify-center">
          <Heart size={64} className="text-rose-300 opacity-40" fill="currentColor" />
        </div>
        <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 drop-shadow-lg">Sarah & Michael</h1>
          <p className="text-sm sm:text-base opacity-90">June 15, 2025 · Tuscany, Italy</p>
        </div>
      </div>

      {/* Upload buttons */}
      <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium bg-rose-500 text-white hover:opacity-90 transition-opacity">
          <Camera size={16} />
          Add Photo
          <span className="text-xs opacity-70">(9/100)</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium bg-white text-rose-900 border border-gray-200 hover:opacity-80 transition-opacity">
          <Video size={16} />
          Add Video
          <span className="text-xs opacity-70">(0/5)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex border-b border-gray-200">
          {(['photos', 'videos', 'guestbook'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-current text-rose-900'
                  : 'text-gray-400 hover:text-gray-600'
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
        {activeTab === 'photos' && (
          <div className="grid grid-cols-3 gap-1">
            {MOCK_PHOTOS.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo.id)}
                className={`aspect-square ${photo.color} rounded hover:opacity-80 transition-opacity flex items-center justify-center`}
              >
                <Heart size={20} className="text-white/40" fill="currentColor" />
              </button>
            ))}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="text-center py-16 text-gray-400">
            <Video size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No videos yet — be the first to share!</p>
          </div>
        )}

        {activeTab === 'guestbook' && (
          <div className="space-y-6">
            {/* Message form */}
            <div className="bg-white rounded-xl p-4 space-y-3 border border-gray-100">
              <h3 className="text-sm font-semibold text-rose-900">Leave a Message</h3>
              <input
                type="text"
                placeholder="Your Name"
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <textarea
                placeholder="Your message…"
                disabled
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 resize-none cursor-not-allowed"
              />
              <button
                disabled
                className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
              >
                <Send size={14} /> Send
              </button>
            </div>

            {/* Entries */}
            <div className="space-y-3">
              {MOCK_GUESTBOOK.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-sm text-rose-900">{entry.name}</p>
                  <p className="text-gray-500 text-sm mt-1">{entry.message}</p>
                  <p className="text-gray-300 text-xs mt-2">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-gray-400">
        Gallery available for 365 days · memorybanner.com
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}>
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
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between max-w-2xl mx-auto">
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
  )
}
