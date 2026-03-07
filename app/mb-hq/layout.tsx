'use client'

import { createContext, useContext, useState } from 'react'

const AdminSecretContext = createContext('')
export const useAdminSecret = () => useContext(AdminSecretContext)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState(() => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('admin_secret') ?? ''
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/orders', {
      headers: { 'x-admin-secret': input },
    })
    if (res.ok) {
      sessionStorage.setItem('admin_secret', input)
      setSecret(input)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (typeof window === 'undefined') return null

  if (!secret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Girişi</h1>
          <input
            type="password"
            placeholder="Şifre"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">Yanlış şifre.</p>}
          <button
            type="submit"
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Giriş
          </button>
        </form>
      </div>
    )
  }

  return (
    <AdminSecretContext.Provider value={secret}>
      {children}
    </AdminSecretContext.Provider>
  )
}
