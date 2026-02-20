'use client'

import React from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import { useSearch } from '@/context/search-context'

export function Footer() {
  const { openSearch } = useSearch()
  return (
    <footer className="hidden md:block py-24 px-6 lg:px-12 bg-background text-foreground relative overflow-hidden">
      {/* Black Edition Background Effect - Subtle Noise */}


      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand Info */}
          <div className="space-y-10">
            <Link href="/" className="inline-block group" aria-label="AURERXA Home">
              <NextImage
                src="https://imagizer.imageshack.com/img922/5651/qYeLiy.png"
                alt="AURERXA Logo"
                width={150}
                height={64}
                className="h-16 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              />
            </Link>
            <p className="text-xs text-muted-foreground font-light leading-loose tracking-widest uppercase">
              A 50-year legacy forged in respect.<br />Handcrafted masterpieces.
            </p>
          </div>

          {/* Shop Categories */}
          <div className="space-y-10">
            <h2 className="text-[10px] font-premium-sans text-primary/80 uppercase tracking-[0.2em]">Shop by Category</h2>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
              {['Earrings', 'Rings', 'Pendants', 'Bangles', 'Necklaces', 'Mangalsutra', 'Bracelets', 'Gold Coins', 'Kids Collection'].map((item) => (
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
                { name: 'Personalized Visit', href: '/services/personalized-visit' },
                { name: 'Gold Harvest Scheme', href: '/services/gold-harvest' },
                { name: 'Jewellery Care', href: '/services/jewelry-care' },
                { name: 'Bulk Orders', href: '/bulk-order' },
                { name: 'Find a Boutique', href: '/stores' },
                { name: 'Virtual Try-On', href: '/services/virtual-try-on' }
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
                <img
                  src="https://img.icons8.com/?size=100&id=7880&format=png&color=BF9B65"
                  alt="Location"
                  className="w-5 h-5 mt-1 opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <a
                  href="https://www.google.com/maps/place/Nijam+Gold+works/data=!4m2!3m1!1s0x0:0xe8958ae639e82931?sa=X&ved=1t:2428&ictx=111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors leading-[1.8] tracking-widest"
                  aria-label="Our location on Google Maps: Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605"
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
                <a href="tel:+919391032677" className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors tracking-widest" aria-label="Call us at +91 93910 32677">+91 93910 32677</a>
              </div>
              <div className="flex items-center gap-4 group">
                <img
                  src="https://img.icons8.com/?size=100&id=12580&format=png&color=BF9B65"
                  alt="Email"
                  className="w-5 h-5 opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <a href="mailto:care@aurerxa.com" className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors tracking-widest" aria-label="Email us at care@aurerxa.com">care@aurerxa.com</a>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer tactile-press" onClick={openSearch}>
                <img
                  src="https://img.icons8.com/?size=100&id=132&format=png&color=BF9B65"
                  alt="Search"
                  className="w-5 h-5 opacity-40 group-hover:opacity-80 transition-opacity"
                />
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors tracking-widest uppercase luxe-underline">Search Our Heritage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Row */}
        <div className="mb-20 pt-12 flex flex-wrap justify-center md:justify-start gap-8 items-center">
          <span className="text-[10px] font-premium-sans text-primary/60 uppercase tracking-[0.2em] w-full md:w-auto mb-4 md:mb-0 text-center md:text-left">Follow the Legacy</span>
          <div className="flex gap-10 items-center">
            {[
              { id: '59780', label: 'Facebook', href: 'https://facebook.com/aurerxa' },
              { id: '32309', label: 'Instagram', href: 'https://instagram.com/aurerxa' },
              { id: '37326', label: 'YouTube', href: 'https://youtube.com/@aurerxa' },
              { id: '8808', label: 'LinkedIn', href: 'https://linkedin.com/company/aurerxa' }
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center transition-all duration-500"
                aria-label={social.label}
              >
                <img
                  src={`https://img.icons8.com/?size=100&id=${social.id}&format=png&color=BF9B65`}
                  alt={social.label}
                  className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity tracking-widest text-primary/60 uppercase pointer-events-none">
                  {social.label}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 text-[10px] uppercase tracking-widest">
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
