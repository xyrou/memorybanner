import Link from 'next/link'
import { QrCode, Camera, Heart, Users, Globe, Shield } from 'lucide-react'

export const metadata = {
  title: 'MemoryBanner — Wedding Photo Gallery via QR Code',
  description:
    'Turn your wedding banner into a live photo gallery. Guests scan the QR code, upload photos, and leave messages — all in one beautiful place.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-bold text-lg tracking-tight">MemoryBanner</span>
        <a
          href="https://www.etsy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          Buy on Etsy
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <QrCode size={12} />
          QR Code · Live Gallery · Guestbook
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Every wedding photo,<br />
          <span className="text-gray-400">in one place.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Your guests scan the QR code on your banner, upload their photos and videos,
          and leave heartfelt messages — creating a shared memory that lasts forever.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://www.etsy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Order on Etsy
          </a>
          <a
            href="#how-it-works"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full font-medium hover:border-gray-400 transition-colors"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* Preview mockup */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-center">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <p className="text-sm text-gray-400 flex items-center justify-center gap-1.5">
            <Heart size={12} className="text-rose-400" fill="currentColor" />
            42 photos · 8 messages
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">How it works</h2>
          <p className="text-gray-500 text-center mb-12">Three simple steps to your wedding gallery</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <QrCode size={24} />,
                title: 'Order & receive QR',
                desc: 'Purchase on Etsy, get a unique QR code for your wedding banner within minutes.',
              },
              {
                step: '02',
                icon: <Camera size={24} />,
                title: 'Guests scan & share',
                desc: 'Guests scan with their phone — no app needed. They upload photos, videos, and messages.',
              },
              {
                step: '03',
                icon: <Heart size={24} />,
                title: 'Relive the memories',
                desc: 'Browse your growing gallery, read guestbook entries, and download everything.',
              },
            ].map((item) => (
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
        <h2 className="text-3xl font-bold text-center mb-3">Everything you need</h2>
        <p className="text-gray-500 text-center mb-12">Built for couples, designed for guests</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Camera size={20} />, title: 'Photo & Video Gallery', desc: 'Guests upload directly from their phones. No account required.' },
            { icon: <Heart size={20} />, title: 'Digital Guestbook', desc: 'Leave heartfelt messages alongside the photos.' },
            { icon: <QrCode size={20} />, title: 'Print-Ready QR Code', desc: 'High-res PNG and vector SVG for your banner designer.' },
            { icon: <Globe size={20} />, title: '5 Languages', desc: 'English, Turkish, German, French, and Spanish.' },
            { icon: <Users size={20} />, title: 'Beautiful Templates', desc: 'Romantic, Modern, Rustic, and Minimal themes.' },
            { icon: <Shield size={20} />, title: 'Private Gallery', desc: 'Only people with your QR code can access your gallery.' },
          ].map((f) => (
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
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">Simple pricing</h2>
          <p className="text-gray-500 text-center mb-12">Choose the plan that fits your wedding</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: 'Included',
                desc: 'Perfect for small gatherings',
                features: ['10 photos', 'No videos', '90-day access', '1 template'],
                highlight: false,
              },
              {
                name: 'Premium',
                price: '$13',
                desc: 'Most popular choice',
                features: ['100 photos', '5 videos', '1-year access', 'All templates', 'Guestbook'],
                highlight: true,
              },
              {
                name: 'Premium+',
                price: '$99',
                desc: 'For the big celebration',
                features: ['Unlimited photos', 'Unlimited videos', '3-year access', 'All templates', 'Guestbook', 'Priority support'],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border ${
                  plan.highlight
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${plan.highlight ? 'text-gray-400' : 'text-gray-400'}`}>
                  {plan.name}
                </div>
                <div className={`text-3xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </div>
                <p className={`text-xs mb-5 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-xs flex items-center gap-2 ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className={`w-1 h-1 rounded-full ${plan.highlight ? 'bg-gray-400' : 'bg-gray-400'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.etsy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center text-sm font-medium py-2.5 rounded-full transition-colors ${
                    plan.highlight
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'border border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Order on Etsy
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-4xl font-bold mb-4">Ready to capture every moment?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Join couples who chose MemoryBanner to collect their wedding memories.
        </p>
        <a
          href="https://www.etsy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black text-white px-10 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          Get yours on Etsy
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className="font-semibold text-gray-900">MemoryBanner</span>
        </div>
        <p>© {new Date().getFullYear()} MemoryBanner. All rights reserved.</p>
      </footer>
    </div>
  )
}
