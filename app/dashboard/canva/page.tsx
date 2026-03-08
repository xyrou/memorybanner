import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import { CanvaStudioClient } from './studio-client'

export default async function CanvaStudioPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-3 max-w-5xl mx-auto">
        <Link href="/dashboard" className="font-bold text-lg tracking-tight text-gray-900">
          MemoryBanner
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
          Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <CanvaStudioClient />
      </div>
    </div>
  )
}
