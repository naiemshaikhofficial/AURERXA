import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="AURERXA"
                className="h-14 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-white/40 font-light leading-relaxed mb-6">
              Timeless luxury crafted to perfection. Since 1989.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 border border-neutral-800 flex items-center justify-center text-white/40 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-neutral-800 flex items-center justify-center text-white/40 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-neutral-800 flex items-center justify-center text-white/40 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] mb-6 text-amber-400">
              Collections
            </h4>
            <ul className="space-y-3 text-sm text-white/40 font-light">
              <li>
                <a href="/collections?category=rings" className="hover:text-amber-400 transition-colors duration-300">
                  Rings
                </a>
              </li>
              <li>
                <a href="/collections?category=necklaces" className="hover:text-amber-400 transition-colors duration-300">
                  Necklaces
                </a>
              </li>
              <li>
                <a href="/collections?category=bracelets" className="hover:text-amber-400 transition-colors duration-300">
                  Bracelets
                </a>
              </li>
              <li>
                <a href="/collections?category=wedding" className="hover:text-amber-400 transition-colors duration-300">
                  Wedding
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] mb-6 text-amber-400">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-white/40 font-light">
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-amber-400/60" />
                hello@aurerxa.com
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-amber-400/60" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={14} className="text-amber-400/60" />
                New York, USA
              </li>
            </ul>
          </div>

          {/* Newsletter Teaser */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] mb-6 text-amber-400">
              Visit Us
            </h4>
            <p className="text-sm text-white/40 font-light leading-relaxed mb-4">
              Experience our collections in person at our flagship boutique.
            </p>
            <p className="text-sm text-white/60">
              Fifth Avenue, New York<br />
              Mon - Sat: 10AM - 8PM
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/30 font-light">
          <p>© 2026 AURERXA. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-amber-400 transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-amber-400 transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="hover:text-amber-400 transition-colors duration-300">
              Shipping Info
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
