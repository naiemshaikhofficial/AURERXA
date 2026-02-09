import Link from 'next/link'

export function Footer() {
  return (
    <footer className="hidden md:block py-24 px-6 lg:px-12 bg-neutral-950 text-white relative border-t border-white/5 overflow-hidden">
      {/* Black Edition Background Effect - Subtle Noise */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          {/* Brand Info */}
          <div className="space-y-10">
            <Link href="/" className="inline-block group">
              <img
                src="/logo.png"
                alt="AURERXA"
                className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              />
            </Link>
            <p className="text-xs text-white/30 font-light leading-loose tracking-widest uppercase">
              A 50-year legacy forged in respect.<br />Handcrafted masterpieces.
            </p>
          </div>

          {/* Shop Categories */}
          <div className="space-y-10">
            <h4 className="text-[10px] font-premium-sans text-primary/80 uppercase tracking-[0.2em]">Shop by Category</h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
              {['Earrings', 'Rings', 'Pendants', 'Bangles', 'Necklaces', 'Mangalsutra', 'Bracelets', 'Gold Coins'].map((item) => (
                <li key={item}>
                  <Link href={`/collections?type=${item}`} className="text-[11px] text-white/40 hover:text-primary transition-colors tracking-widest uppercase">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-10">
            <h4 className="text-[10px] font-premium-sans text-primary/80 uppercase tracking-[0.2em]">Services</h4>
            <ul className="space-y-4">
              {[
                { name: 'Book an Appointment', href: '/appointment' },
                { name: 'Gold Harvest Scheme', href: '/schemes' },
                { name: 'Jewellery Care', href: '/care' },
                { name: 'Find a Boutique', href: '/stores' },
                { name: 'Virtual Try-On', href: '/try-on' }
              ].map((service) => (
                <li key={service.name}>
                  <Link href={service.href} className="text-[11px] text-white/40 hover:text-white transition-colors tracking-widest uppercase">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-10">
            <h4 className="text-[10px] font-premium-sans text-primary/80 uppercase tracking-[0.2em]">Concierge</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group cursor-pointer">
                <img
                  src="https://img.icons8.com/?size=100&id=7880&format=png&color=BF9B65"
                  alt="Location"
                  className="w-5 h-5 mt-1 opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <a
                  href="https://www.google.com/maps/place/Nijam+Gold+works/data=!4m2!3m1!1s0x0:0xe8958ae639e82931?sa=X&ved=1t:2428&ictx=111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-white/40 group-hover:text-white transition-colors leading-[1.8] tracking-widest"
                >
                  Captain Lakshmi Chowk, Rangargalli<br />
                  Sangamner, Maharashtra 422605
                </a>
              </div>
              <div className="flex items-center gap-4 group">
                <img
                  src="https://img.icons8.com/?size=100&id=9729&format=png&color=BF9B65"
                  alt="Phone"
                  className="w-5 h-5 opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <a href="tel:+919391032677" className="text-[11px] text-white/40 group-hover:text-white transition-colors tracking-widest">+91 93910 32677</a>
              </div>
              <div className="flex items-center gap-4 group">
                <img
                  src="https://img.icons8.com/?size=100&id=12580&format=png&color=BF9B65"
                  alt="Email"
                  className="w-5 h-5 opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <a href="mailto:care@aurerxa.com" className="text-[11px] text-white/40 group-hover:text-white transition-colors tracking-widest">care@aurerxa.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 text-[10px] uppercase tracking-widest">
          <span>© {new Date().getFullYear()} AURERXA. All Rights Reserved.</span>
          <div className="flex gap-12">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/returns" className="hover:text-white transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
