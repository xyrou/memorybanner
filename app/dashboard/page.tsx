import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { Order, PLAN_LIMITS } from '@/types'
import Link from 'next/link'
import { Camera, QrCode, Heart, ArrowRight } from 'lucide-react'
import SignOutButton from './sign-out-button'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Find orders linked to this user's email
  const service = createServiceClient()
  const { data: orders } = await service
    .from('orders')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending: false })

  const order: Order | null = orders?.[0] ?? null
  const plan = order ? PLAN_LIMITS[order.plan as keyof typeof PLAN_LIMITS] : null
  const now = new Date().getTime()
  const planBadgeStyles: Record<string, string> = {
    starter: 'bg-gray-100 text-gray-600',
    silver: 'bg-slate-100 text-slate-700',
    gold: 'bg-amber-100 text-amber-700',
    premium: 'bg-blue-100 text-blue-700',
    free: 'bg-gray-100 text-gray-600',
    premium_plus: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="font-bold text-lg tracking-tight text-gray-900">
          MemoryBanner
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {order ? (
          /* Has an order */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Gallery</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your wedding gallery</p>
            </div>

            {/* Gallery card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{order.couple_names}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(order.event_date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                    {order.location && ` · ${order.location}`}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${planBadgeStyles[order.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                  {plan?.label}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Camera size={20} className="mx-auto mb-1 text-gray-400" />
                  <div className="text-2xl font-bold text-gray-900">{order.photo_count}</div>
                  <div className="text-xs text-gray-500">
                    {plan?.photos === Infinity ? '∞' : plan?.photos} photos
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Heart size={20} className="mx-auto mb-1 text-gray-400" />
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.max(0, Math.ceil(
                      (new Date(order.expires_at).getTime() - now) / 86400000
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">days left</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <QrCode size={20} className="mx-auto mb-1 text-gray-400" />
                  <div className="text-sm font-bold text-gray-900 mt-1 font-mono">{order.slug}</div>
                  <div className="text-xs text-gray-500">your code</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                {order.is_setup ? (
                  <Link
                    href={`/${order.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    View Gallery <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link
                    href={`/setup/${order.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Set Up Gallery <ArrowRight size={14} />
                  </Link>
                )}

                {order.plan !== 'premium' && order.plan !== 'premium_plus' && (
                  <button
                    disabled
                    className="flex-1 border border-gray-200 text-gray-400 rounded-xl py-3 text-sm font-medium cursor-not-allowed"
                    title="Coming soon"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>

            {/* Demo link */}
            <p className="text-center text-sm text-gray-400">
              Want to see an example?{' '}
              <Link href="/demo" className="text-gray-700 hover:underline font-medium">
                View demo gallery
              </Link>
            </p>
          </div>
        ) : (
          /* No order yet */
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode size={32} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">No gallery yet</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              You don&apos;t have a gallery linked to this account yet.
              Choose a plan to get started, or view a demo to see what your gallery will look like.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/#pricing"
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                See pricing
              </Link>
              <Link
                href="/demo"
                className="border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-medium hover:border-gray-400 transition-colors"
              >
                View demo gallery
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
