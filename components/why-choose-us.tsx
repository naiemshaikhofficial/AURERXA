'use client'

import { Hammer, Award, Users, Shield, Sparkles, Heart } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'
import { ParallaxScroll } from './parallax-scroll'

const features = [
  {
    icon: Hammer,
    title: 'Handcrafted Excellence',
    description: 'Every piece is meticulously handcrafted by skilled local artisans using traditional techniques perfected over years.',
    color: 'from-amber-500/20 to-yellow-500/20'
  },
  {
    icon: Award,
    title: 'Certified Quality',
    description: 'BIS Hallmarked gold and certified materials. We maintain the highest standards for our retail partners.',
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Users,
    title: 'Trusted by Retailers',
    description: 'We supply premium jewelry stores across India. Our reputation is built on consistent quality and reliability.',
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Rigorous quality checks at every stage. Each piece undergoes thorough inspection before delivery.',
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    icon: Sparkles,
    title: 'Custom Designs',
    description: 'We work closely with retailers to create custom designs that match their vision and customer preferences.',
    color: 'from-orange-500/20 to-red-500/20'
  },
  {
    icon: Heart,
    title: 'Passionate Craftsmen',
    description: 'Our team takes immense pride in every creation. We pour our heart and skill into each piece.',
    color: 'from-rose-500/20 to-pink-500/20'
  }
]

export function WhyChooseUs() {
  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Background pattern */}
      <ParallaxScroll offset={100} direction="down" className="absolute inset-0">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
               backgroundSize: '40px 40px'
             }} 
        />
      </ParallaxScroll>

      <div className="container-luxury relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade" delay={0.05}>
          <div className="text-center mb-16 lg:mb-20">
            <p className="font-premium-sans text-primary text-sm mb-4">
              Why Work With Us
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-gradient-gold mb-6">
              Craftsmanship You Can Trust
            </h2>
            <p className="font-body-refined text-muted-foreground max-w-2xl mx-auto text-lg">
              Local artisans dedicated to creating exceptional jewelry for India's finest retailers
            </p>
          </div>
        </ScrollReveal>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal 
              key={index} 
              animation="slide-up" 
              delay={0.1 + index * 0.06}
            >
              <ParallaxScroll offset={20} scaleOffset={0.02}>
                <div className="group relative h-full">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Card */}
                  <div className="relative glass-premium p-8 hover-lift transition-luxury shadow-luxury h-full">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-full bg-gradient-gold-subtle flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="font-serif text-xl lg:text-2xl text-foreground mb-4 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="font-body-refined text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Decorative line */}
                    <div className="mt-6 h-1 w-12 bg-gradient-to-r from-primary to-transparent rounded-full group-hover:w-24 transition-all duration-500" />
                  </div>
                </div>
              </ParallaxScroll>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA Section */}
        <ScrollReveal animation="scale" delay={0.4}>
          <div className="mt-20 text-center">
            <div className="inline-block glass-luxury px-12 py-8 shadow-luxury-lg hover-glow transition-luxury">
              <p className="font-serif-luxury text-xl text-foreground/80 mb-6">
                "Quality craftsmanship, delivered with dedication"
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
