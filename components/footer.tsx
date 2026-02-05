import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-24 px-6 lg:px-12 bg-neutral-950 text-white relative border-t border-white/10 overflow-hidden">
      {/* Black Edition Background Effect */}
      <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.02] bg-repeat pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          {/* Brand Info */}
          <div className="space-y-10">
            <Link href="/" className="inline-block group">
              <img
                src="/logo.png"
                alt="AURERXA"
                className="h-12 w-auto object-contain brightness-110 group-hover:scale-105 transition-transform duration-700"
              />
            </Link>
            <p className="text-xs text-white/30 font-light leading-loose tracking-widest italic">
              Crafting legends since 1989. Where every piece is a journey into the heart of excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-10">
            <h4 className="text-[10px] font-premium-sans text-amber-500 uppercase">Collections</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/collections" className="text-xs text-white/40 hover:text-white transition-colors tracking-widest">Bridal Legacy</Link>
              </li>
              <li>
                <Link href="/collections" className="text-xs text-white/40 hover:text-white transition-colors tracking-widest">Essential Gold</Link>
              </li>
              <li>
                <Link href="/collections" className="text-xs text-white/40 hover:text-white transition-colors tracking-widest">Heritage Diamonds</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="text-[10px] font-premium-sans text-amber-500 uppercase">Discover</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-xs text-white/40 hover:text-white transition-colors tracking-widest">Our Story</Link>
              </li>
              <li>
                <Link href="/stores" className="text-xs text-white/40 hover:text-white transition-colors tracking-widest">Our Boutique</Link>
              </li>
              <li>
                <Link href="/blog" className="text-xs text-white/40 hover:text-white transition-colors tracking-widest">The Journal</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-10">
            <h4 className="text-[10px] font-premium-sans text-amber-500 uppercase">Visit Us</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group cursor-pointer">
                <MapPin size={14} className="text-amber-500/40 mt-1" />
                <a
                  href="https://www.google.com/maps/place/Nijam+Gold+works/data=!4m2!3m1!1s0x0:0xe8958ae639e82931?sa=X&ved=1t:2428&ictx=111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/40 group-hover:text-white transition-colors leading-[1.8] tracking-widest italic"
                >
                  Captain Lakshmi Chowk, Rangargalli<br />
                  Sangamner, Maharashtra 422605
                </a>
              </div>
              <div className="flex items-center gap-4 group">
                <Phone size={14} className="text-amber-500/40" />
                <a href="tel:+919391032677" className="text-xs text-white/40 group-hover:text-white transition-colors tracking-widest">+91 93910 32677</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          © {new Date().getFullYear()} AURERXA. All Rights Reserved.
          <div className="flex gap-12">
            <Link href="/privacy" className="text-[9px] font-premium-sans text-white/10 hover:text-white transition-colors uppercase">Privacy</Link>
            <Link href="/terms" className="text-[9px] font-premium-sans text-white/10 hover:text-white transition-colors uppercase">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
