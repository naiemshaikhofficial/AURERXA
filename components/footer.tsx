'use client'

import React from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import { useSearch } from '@/context/search-context'
import { MapPin, Phone, Mail, Search, Smartphone, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'
import { isCapacitor } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export function Footer({ contactConfig }: { contactConfig?: any }) {
  const { openSearch } = useSearch()
  const pathname = usePathname()
  const [isNative, setIsNative] = React.useState(false)

  React.useEffect(() => {
    setIsNative(isCapacitor())
  }, [])

  if (isNative) return null;

  return (
    <footer className="py-24 px-6 lg:px-12 bg-obsidian text-foreground relative overflow-hidden border-t border-white/5">
      {/* Black Edition Background Effect - Subtle Noise */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />


      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand Info */}
          <div className="space-y-10">
            <Link href="/" className="inline-block group" aria-label="AURERXA Home">
              <NextImage
                src="/logo-new-v2.png"
                alt="AURERXA Logo"
                width={120}
                height={48}
                className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              />
            </Link>
            <p className="text-[10px] text-foreground/40 font-light leading-relaxed tracking-[0.4em] uppercase">
              A 50-year legacy forged in respect.<br />Handcrafted masterpieces.
            </p>
          </div>

          {/* Shop Categories */}
          <div className="space-y-10">
            <h2 className="text-[10px] font-premium-sans text-primary/80 uppercase tracking-[0.2em]">Shop by Category</h2>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
              {['Earrings', 'Rings', 'Pendants', 'Bangles', 'Necklaces', 'Mangalsutra', 'Bracelets', 'Kids Collection'].map((item) => (
                <li key={item}>
                  <Link href={item === 'Kids Collection' ? '/collections?gender=Kids' : `/collections?type=${item}`} className="text-[11px] text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase luxe-underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-10">
            <h2 className="text-[10px] font-premium-sans text-primary/80 uppercase tracking-[0.2em]">Services</h2>
            <ul className="space-y-4">
              {[
                { name: 'Bulk Orders', href: '/bulk-order' },
                { name: 'Custom Jewelry', href: '/custom-jewelry' },
                { name: 'Ring Size Calculator', href: '/ring-size-calculator' },

              ].map((service) => (
                <li key={service.name}>
                  <Link href={service.href} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors tracking-widest uppercase luxe-underline">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-10">
            <h2 className="text-[10px] font-premium-sans text-primary/80 uppercase tracking-[0.2em]">Concierge</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group cursor-pointer">
                <MapPin
                  className="w-5 h-5 mt-1 text-primary opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <a
                  href="https://maps.app.goo.gl/PdTNoNuey3ecsxkt6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors leading-[1.8] tracking-widest whitespace-pre-line"
                  aria-label={`Our location on Google Maps: ${contactConfig?.address || 'Aurerxa Luxury Boutique'}`}
                >
                  {contactConfig?.address || 'Captain Lakshmi Chowk, Rangargalli,\nSangamner, Maharashtra 422605'}
                </a>
              </div>
              <div className="flex items-center gap-4 group">
                <Phone
                  className="w-5 h-5 text-primary opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <a href={`tel:${contactConfig?.phone || '+919391032677'}`} className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors tracking-widest uppercase" aria-label={`Call us at ${contactConfig?.phone || '+91 93910 32677'}`}>{contactConfig?.phone || '+91 93910 32677'}</a>
              </div>
              <div className="flex items-center gap-4 group">
                <Mail
                  className="w-5 h-5 text-primary opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <a href={`mailto:${contactConfig?.email || 'support@aurerxa.com'}`} className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors tracking-widest uppercase" aria-label={`Email us at ${contactConfig?.email || 'support@aurerxa.com'}`}>{contactConfig?.email || 'support@aurerxa.com'}</a>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer tactile-press" onClick={openSearch}>
                <Search
                  className="w-5 h-5 text-primary opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors tracking-widest uppercase luxe-underline">Search Our Heritage</span>
              </div>
              <div className="pt-4 space-y-2">
                <a
                  href="https://pub-fbfc4e7dd5594ba39086b366ce0d47ab.r2.dev/aurerxa.apk"
                  download
                  className="inline-flex items-center gap-4 px-6 py-3 bg-primary/5 border border-primary/10 rounded-2xl hover:bg-primary/10 transition-all duration-500 group group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Smartphone
                      className="w-5 h-5 text-primary opacity-90"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-primary/60 font-medium">Download for</span>
                    <span className="text-[12px] uppercase tracking-widest text-primary font-black">Android (APK)</span>
                  </div>
                </a>

                <div className="space-y-2 pt-1">
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-medium opacity-60">Soon Available On</p>
                    <div className="w-5 h-px bg-primary/20" />
                  </div>
                  <NextImage
                    src="/App-Store-and-Google-Play-badges-removebg-preview.png"
                    alt="App Store and Google Play"
                    width={180}
                    height={60}
                    className="h-10 w-auto object-contain opacity-40 hover:opacity-70 transition-opacity duration-700 grayscale hover:grayscale-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Row */}
        <div className="mb-20 pt-12 flex flex-wrap justify-center md:justify-start gap-8 items-center">
          <span className="text-[10px] font-premium-sans text-primary/60 uppercase tracking-[0.2em] w-full md:w-auto mb-4 md:mb-0 text-center md:text-left">Follow the Legacy</span>
          <div className="flex gap-10 items-center">
            {[
              { icon: Facebook, label: 'Facebook', href: 'https://facebook.com/aurerxa' },
              { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/aurerxa' },
              { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/@aurerxa' },
              { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/company/aurerxa' }
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center transition-all duration-500"
                aria-label={social.label}
              >
                <social.icon
                  className="w-5 h-5 text-primary opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity tracking-widest text-primary/60 uppercase pointer-events-none">
                  {social.label}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground/60 text-[10px] uppercase tracking-widest border-t border-border/10">
          <span>© {new Date().getFullYear()} AURERXA. All Rights Reserved.</span>
          <div className="flex gap-12">
            <Link href="/about-us" className="hover:text-foreground transition-colors font-medium text-primary">About Us</Link>
            <Link href="/shipping" className="hover:text-foreground transition-colors">Shipping</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/returns" className="hover:text-foreground transition-colors">Returns</Link>
            <Link href="/refund-policy" className="hover:text-foreground transition-colors text-primary font-bold">Refund Policy</Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer >
  )
}
