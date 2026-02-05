import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="relative w-40 h-12 mb-6">
              <Image
                src="/logo.png"
                alt="AURERXA"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Timeless luxury crafted to perfection
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-4">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/collections?category=rings" className="hover:text-accent transition-colors">
                  Rings
                </a>
              </li>
              <li>
                <a href="/collections?category=necklaces" className="hover:text-accent transition-colors">
                  Necklaces
                </a>
              </li>
              <li>
                <a href="/collections?category=bracelets" className="hover:text-accent transition-colors">
                  Bracelets
                </a>
              </li>
              <li>
                <a href="/collections?category=wedding" className="hover:text-accent transition-colors">
                  Wedding
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                hello@aurerxa.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-accent" />
                New York, USA
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-4">
              Follow
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2026 AURERXA. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-accent transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Shipping Info
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
