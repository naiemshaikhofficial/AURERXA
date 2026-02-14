'use client'

import { Instagram, Heart, MessageCircle } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'
import { ParallaxScroll } from './parallax-scroll'

const instagramPosts = [
  {
    id: 1,
    image: '/instagram/1.jpg',
    likes: '234',
    comments: '12',
    caption: 'Handcrafted with precision by our local artisans ✨'
  },
  {
    id: 2,
    image: '/instagram/2.jpg',
    likes: '189',
    comments: '8',
    caption: 'Traditional techniques meet modern designs 💍'
  },
  {
    id: 3,
    image: '/instagram/3.jpg',
    likes: '156',
    comments: '6',
    caption: 'Behind the scenes: Our workshop in action 🔨'
  },
  {
    id: 4,
    image: '/instagram/4.jpg',
    likes: '201',
    comments: '9',
    caption: 'Quality craftsmanship for premium retailers 💎'
  },
  {
    id: 5,
    image: '/instagram/5.jpg',
    likes: '178',
    comments: '7',
    caption: 'Every piece tells a story of dedication ✨'
  },
  {
    id: 6,
    image: '/instagram/6.jpg',
    likes: '245',
    comments: '11',
    caption: 'Proud to supply India\'s finest jewelry stores 👑'
  }
]

export function InstagramFeed() {
  return (
    <section className="section-padding-sm bg-gradient-luxury relative overflow-hidden">
      <div className="container-luxury">
        {/* Header */}
        <ScrollReveal animation="fade" delay={0.05}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Instagram className="w-6 h-6 text-primary" />
              <p className="font-premium-sans text-primary text-sm">
                Follow Our Craft
              </p>
            </div>
            <h2 className="font-serif-display text-3xl md:text-4xl lg:text-5xl text-gradient-gold mb-4">
              @aurerxa
            </h2>
            <p className="font-body-refined text-muted-foreground max-w-xl mx-auto">
              See our artisans at work. Share your AURERXA moments with #AURERXACraft
            </p>
          </div>
        </ScrollReveal>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post, index) => (
            <ScrollReveal 
              key={post.id} 
              animation="scale" 
              delay={0.05 + index * 0.03}
            >
              <ParallaxScroll offset={15} scaleOffset={0.05}>
                <div className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer">
                  {/* Image placeholder - replace with actual images */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-white fill-white" />
                        <span className="font-premium-sans text-white text-sm">
                          {post.likes}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-white" />
                        <span className="font-premium-sans text-white text-sm">
                          {post.comments}
                        </span>
                      </div>
                    </div>
                    <p className="font-body-refined text-white text-xs text-center line-clamp-2">
                      {post.caption}
                    </p>
                  </div>

                  {/* Instagram icon */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Instagram className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </ParallaxScroll>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal animation="fade" delay={0.3}>
          <div className="text-center mt-12">
            <a 
              href="https://instagram.com/aurerxa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 glass-luxury hover-lift hover-glow transition-luxury shadow-luxury group"
            >
              <Instagram className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-premium-sans text-sm text-foreground">
                Follow @aurerxa on Instagram
              </span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
