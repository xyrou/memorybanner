import { QrCode, Camera, Heart, Users, Globe, Shield } from 'lucide-react'
import { lt, LANDING_LANGS, LandingLang } from '@/lib/landing-i18n'
import Link from 'next/link'

export function generateMetadata() {
  return {
    title: 'MemoryBanner — Wedding Photo Gallery via QR Code',
    description:
      'Turn your wedding banner into a live photo gallery. Guests scan the QR code, upload photos, and leave messages.',
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const { lang: rawLang } = await searchParams
  const validLangs: LandingLang[] = ['en', 'de', 'fr', 'it', 'es']
  const lang: LandingLang = validLangs.includes(rawLang as LandingLang)
    ? (rawLang as LandingLang)
    : 'en'
  const c = lt(lang)

  const plans = [
    { name: c.plan_starter, price: c.plan_starter_price, desc: c.plan_starter_desc, features: c.plan_starter_f, highlight: false },
    { name: c.plan_silver, price: c.plan_silver_price, desc: c.plan_silver_desc, features: c.plan_silver_f, highlight: false },
    { name: c.plan_gold, price: c.plan_gold_price, desc: c.plan_gold_desc, features: c.plan_gold_f, highlight: false },
    { name: c.plan_premium_tier, price: c.plan_premium_tier_price, desc: c.plan_premium_tier_desc, features: c.plan_premium_tier_f, highlight: true },
  ]

  const features = [
    { icon: <Camera size={20} />, title: c.f1_title, desc: c.f1_desc },
    { icon: <Heart size={20} />, title: c.f2_title, desc: c.f2_desc },
    { icon: <QrCode size={20} />, title: c.f3_title, desc: c.f3_desc },
    { icon: <Globe size={20} />, title: c.f4_title, desc: c.f4_desc },
    { icon: <Users size={20} />, title: c.f5_title, desc: c.f5_desc },
    { icon: <Shield size={20} />, title: c.f6_title, desc: c.f6_desc },
  ]

  const steps = [
    { step: '01', icon: <QrCode size={24} />, title: c.s1_title, desc: c.s1_desc },
    { step: '02', icon: <Camera size={24} />, title: c.s2_title, desc: c.s2_desc },
    { step: '03', icon: <Heart size={24} />, title: c.s3_title, desc: c.s3_desc },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-2 max-w-5xl mx-auto">
        <span className="font-bold text-lg tracking-tight">MemoryBanner</span>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Language switcher */}
          <div className="hidden sm:flex items-center">
            {LANDING_LANGS.map((l, i) => (
              <span key={l.code} className="flex items-center">
                {i > 0 && <span className="text-gray-200 text-xs">·</span>}
                <Link
                  href={`/?lang=${l.code}`}
                  className={`text-xs px-1.5 py-1 transition-colors font-mono tracking-wide ${
                    lang === l.code
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {l.label}
                </Link>
              </span>
            ))}
          </div>
          <Link
            href="/auth/signup"
            className="text-xs sm:text-sm font-medium bg-black text-white px-3 sm:px-4 py-2 rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            {c.nav_buy}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <QrCode size={12} />
          {c.hero_badge}
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          {c.hero_h1a}<br />
          <span className="text-gray-400">{c.hero_h1b}</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          {c.hero_sub}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto bg-black text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            {c.hero_cta}
          </Link>
          <Link
            href="/demo"
            className="w-full sm:w-auto border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full font-medium hover:border-gray-400 transition-colors"
          >
            {c.hero_alt}
          </Link>
        </div>
      </section>

      {/* Preview mockup */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-center">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
            ))}
          </div>
          <p className="text-sm text-gray-400 flex items-center justify-center gap-1.5">
            <Heart size={12} className="text-rose-400" fill="currentColor" />
            {c.preview_caption}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">{c.how_h2}</h2>
          <p className="text-gray-500 text-center mb-12">{c.how_sub}</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-xs font-bold text-gray-300 mb-4">{item.step}</div>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4 text-gray-700">
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-3">{c.feat_h2}</h2>
        <p className="text-gray-500 text-center mb-12">{c.feat_sub}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 text-gray-700">
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">{c.price_h2}</h2>
          <p className="text-gray-500 text-center mb-12">{c.price_sub}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border ${
                  plan.highlight
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-400">
                  {plan.name}
                </div>
                <div className={`text-3xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </div>
                <p className={`text-xs mb-5 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                  {plan.desc}
                </p>
                <ul className="space-y-2 mb-6">
                  {(plan.features as readonly string[]).map((f) => (
                    <li key={f} className={`text-xs flex items-center gap-2 ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center text-sm font-medium py-2.5 rounded-full transition-colors ${
                    plan.highlight
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'border border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {c.buy_etsy}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-4xl font-bold mb-4">{c.cta_h2}</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">{c.cta_sub}</p>
        <Link
          href="/auth/signup"
          className="inline-block bg-black text-white px-10 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          {c.cta_btn}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className="font-semibold text-gray-900">MemoryBanner</span>
        </div>
        <p>© {new Date().getFullYear()} MemoryBanner. {c.footer_rights}</p>
      </footer>
    </div>
  )
}
