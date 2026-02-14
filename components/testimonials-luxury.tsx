'use client'

import { Users, Award, Hammer, Heart } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'
import { ParallaxScroll } from './parallax-scroll'

export function OurStory() {
  return (
    <section className="section-padding bg-gradient-luxury relative overflow-hidden">
      {/* Background decoration */}
      <ParallaxScroll offset={80} direction="down" className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </ParallaxScroll>

      <div className="container-luxury relative z-10">
        <ScrollReveal animation="fade" delay={0.05}>
          <div className="text-center mb-16">
            <p className="font-premium-sans text-primary text-sm mb-4">
              Our Journey
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-gradient-gold mb-6">
              Crafted by Local Artisans
            </h2>
            <p className="font-body-refined text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              We are a dedicated team of skilled craftsmen, preserving traditional jewelry-making techniques 
              while creating exquisite pieces for India's premium retailers. Every design reflects our 
              commitment to quality and authenticity.
            </p>
          </div>
        </ScrollReveal>

        {/* Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <ScrollReveal animation="slide-right" delay={0.1}>
            <ParallaxScroll offset={20} scaleOffset={0.02}>
              <div className="glass-luxury p-8 lg:p-10 hover-lift transition-luxury shadow-luxury-lg h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-gold-subtle flex items-center justify-center mb-6">
                  <Hammer className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif-display text-2xl text-foreground mb-4">
                  Traditional Craftsmanship
                </h3>
                <p className="font-body-refined text-muted-foreground leading-relaxed">
                  Our workshop combines time-honored techniques passed down through generations with 
                  modern precision. Each piece is handcrafted with meticulous attention to detail, 
                  ensuring the highest quality standards for our retail partners.
                </p>
              </div>
            </ParallaxScroll>
          </ScrollReveal>

          <ScrollReveal animation="slide-left" delay={0.15}>
            <ParallaxScroll offset={20} scaleOffset={0.02}>
              <div className="glass-luxury p-8 lg:p-10 hover-lift transition-luxury shadow-luxury-lg h-full">
                <div className="w-16 h-16 rounded-full bg-gradient-gold-subtle flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif-display text-2xl text-foreground mb-4">
                  Trusted by Retailers
                </h3>
                <p className="font-body-refined text-muted-foreground leading-relaxed">
                  We proudly supply premium jewelry stores across India. Our reputation is built on 
                  consistent quality, timely delivery, and designs that resonate with discerning customers. 
                  We're the craftsmen behind many beloved jewelry collections.
                </p>
              </div>
            </ParallaxScroll>
          </ScrollReveal>
        </div>

        {/* Values */}
        <ScrollReveal animation="fade" delay={0.2}>
          <div className="glass-luxury p-10 lg:p-12 shadow-luxury-lg">
            <h3 className="font-serif-display text-2xl lg:text-3xl text-center text-gradient-gold mb-10">
              Our Values
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-gold-subtle flex items-center justify-center">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-serif text-xl text-foreground mb-3">Quality First</h4>
                <p className="font-body-refined text-muted-foreground text-sm leading-relaxed">
                  Every piece meets strict quality standards. We use only certified materials and 
                  traditional techniques to ensure lasting beauty.
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-gold-subtle flex items-center justify-center">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-serif text-xl text-foreground mb-3">Passion & Pride</h4>
                <p className="font-body-refined text-muted-foreground text-sm leading-relaxed">
                  We take immense pride in our craft. Each design is created with dedication, 
                  skill, and a deep respect for the art of jewelry making.
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-gold-subtle flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-serif text-xl text-foreground mb-3">Partnership</h4>
                <p className="font-body-refined text-muted-foreground text-sm leading-relaxed">
                  We build lasting relationships with our retail partners, working closely to 
                  bring their vision to life with our expertise.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Quote */}
        <ScrollReveal animation="scale" delay={0.3}>
          <div className="mt-16 text-center">
            <div className="inline-block glass-luxury px-12 py-8 shadow-luxury-lg">
              <p className="font-serif-luxury text-xl text-foreground/80 mb-6">
                "Every piece we create carries the soul of our craft and the promise of quality"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
                <p className="font-premium-sans text-xs text-primary">
                  AURERXA Artisans
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
