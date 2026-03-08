'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Media, GuestbookEntry } from '@/types'
import { ArrowLeft, Check, X } from 'lucide-react'
import { useAdminSecret } from '../../layout'

type ModerationTarget = 'media' | 'guestbook'

export default function ModerationPage() {
  const { slug } = useParams<{ slug: string }>()
  const adminSecret = useAdminSecret()

  const [media, setMedia] = useState<Media[]>([])
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingKey, setSavingKey] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [mediaRes, guestbookRes] = await Promise.all([
        fetch(`/api/media/${slug}`, { headers: { 'x-admin-secret': adminSecret } }),
        fetch(`/api/guestbook/${slug}`, { headers: { 'x-admin-secret': adminSecret } }),
      ])

      if (!mediaRes.ok || !guestbookRes.ok) {
        setError('Could not load moderation data.')
        return
      }

      const [mediaData, guestbookData] = await Promise.all([mediaRes.json(), guestbookRes.json()])
      setMedia(Array.isArray(mediaData) ? mediaData : [])
      setGuestbook(Array.isArray(guestbookData) ? guestbookData : [])
    } catch {
      setError('Could not load moderation data.')
    } finally {
      setLoading(false)
    }
  }, [adminSecret, slug])

  useEffect(() => {
    load()
  }, [load])

  const pendingMedia = useMemo(() => media.filter((item) => !item.is_approved), [media])
  const pendingGuestbook = useMemo(() => guestbook.filter((item) => !item.is_approved), [guestbook])

  const setModeration = async (target: ModerationTarget, id: string, isApproved: boolean) => {
    const key = `${target}:${id}`
    setSavingKey(key)
    try {
      const res = await fetch(`/api/moderation/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          target,
          id,
          is_approved: isApproved,
        }),
      })

      if (!res.ok) {
        alert('Moderation update failed.')
        return
      }

      if (target === 'media') {
        setMedia((prev) => prev.map((item) => item.id === id ? { ...item, is_approved: isApproved } : item))
      } else {
        setGuestbook((prev) => prev.map((item) => item.id === id ? { ...item, is_approved: isApproved } : item))
      }
    } finally {
      setSavingKey('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Moderation</p>
            <h1 className="text-2xl font-bold text-gray-900">{slug}</h1>
          </div>
          <Link
            href="/mb-hq"
            className="inline-flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Admin
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Pending media</p>
            <p className="text-2xl font-bold text-gray-900">{pendingMedia.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Pending guestbook</p>
            <p className="text-2xl font-bold text-gray-900">{pendingGuestbook.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Pending Media</h2>
              {pendingMedia.length === 0 ? (
                <p className="text-sm text-gray-500">No pending media.</p>
              ) : (
                <div className="space-y-3">
                  {pendingMedia.map((item) => {
                    const key = `media:${item.id}`
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          {item.type === 'photo' ? (
                            <img src={item.thumbnail_url ?? item.url} alt="" className="w-20 h-20 rounded-md object-cover bg-gray-100" />
                          ) : (
                            <div className="w-20 h-20 rounded-md bg-gray-900 text-white text-xs flex items-center justify-center">VIDEO</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.uploaded_by || 'Guest'}</p>
                            <p className="text-xs text-gray-500">Album: {item.album_name || 'General'}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(item.created_at).toLocaleString('en-US')}</p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => setModeration('media', item.id, true)}
                                disabled={savingKey === key}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white text-xs px-2 py-1 disabled:opacity-50"
                              >
                                <Check size={12} />
                                Approve
                              </button>
                              <button
                                onClick={() => setModeration('media', item.id, false)}
                                disabled={savingKey === key}
                                className="inline-flex items-center gap-1 rounded-md border border-gray-300 text-gray-700 text-xs px-2 py-1 disabled:opacity-50"
                              >
                                <X size={12} />
                                Keep hidden
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Pending Guestbook</h2>
              {pendingGuestbook.length === 0 ? (
                <p className="text-sm text-gray-500">No pending guestbook messages.</p>
              ) : (
                <div className="space-y-3">
                  {pendingGuestbook.map((item) => {
                    const key = `guestbook:${item.id}`
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">{item.guest_name}</p>
                        <p className="text-sm text-gray-700 mt-1 break-words">{item.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(item.created_at).toLocaleString('en-US')}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setModeration('guestbook', item.id, true)}
                            disabled={savingKey === key}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white text-xs px-2 py-1 disabled:opacity-50"
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            onClick={() => setModeration('guestbook', item.id, false)}
                            disabled={savingKey === key}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 text-gray-700 text-xs px-2 py-1 disabled:opacity-50"
                          >
                            <X size={12} />
                            Keep hidden
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
