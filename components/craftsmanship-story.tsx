'use client'

import { Sparkles, Award, Shield, Heart } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'
import { ParallaxScroll } from './parallax-scroll'

const craftSteps = [
  {
    icon: Sparkles,
    title: 'Design Conception',
    description: 'Every piece begins with inspiration drawn from heritage, nature, and timeless elegance. Our master designers sketch each detail with precision.',
    stat: '100+ Hours',
    label: 'Design Process'
  },
  {
    icon: Award,
    title: 'Artisan Crafting',
    description: 'Skilled artisans with decades of experience handcraft each piece using traditional techniques passed down through generations.',
    stat: '25+ Years',
    label: 'Master Craftsmen'
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Every piece undergoes rigorous quality checks. We certify purity, authenticity, and perfection before it reaches you.',
    stat: '15 Point',
    label: 'Quality Check'
  },
  {
    icon: Heart,
    title: 'Lifetime Promise',
    description: 'Your jewelry is backed by our lifetime guarantee. We stand behind every piece with complimentary maintenance and care.',
    stat: 'Lifetime',
    label: 'Guarantee'
  }
]

export function CraftsmanshipStory() {
  return (
    <section className="section-padding relative overflow-hidden bg-background">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container-luxury relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade" delay={0.05}>
          <div className="max-w-3xl mx-auto text-center mb-20">
            <p className="font-premium-sans text-primary text-sm mb-4">
              The Art of Excellence
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-gradient-gold mb-6">
              Crafted to Perfection
            </h2>
            <p className="font-body-refined text-muted-foreground text-lg leading-relaxed">
              Each AURERXA creation is a testament to centuries-old craftsmanship, 
              where tradition meets innovation to create timeless masterpieces.
            </p>
          </div>
        </ScrollReveal>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {craftSteps.map((step, index) => (
            <ScrollReveal 
              key={index} 
              animation="slide-up" 
              delay={0.1 + index * 0.06}
            >
              <ParallaxScroll offset={30} scaleOffset={0.03}>
                <div className="relative group">
                  {/* Card */}
                  <div className="glass-premium p-8 hover-lift transition-luxury shadow-luxury h-full">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-gradient-gold-subtle flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="font-serif text-2xl text-foreground mb-4">
                      {step.title}
                    </h3>
                    <p className="font-body-refined text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Stat */}
                    <div className="pt-6 border-t border-gold-subtle">
                      <p className="font-serif-display text-3xl text-primary mb-1">
                        {step.stat}
                      </p>
                      <p className="font-premium-sans text-xs text-muted-foreground">
                        {step.label}
                      </p>
                    </div>
                  </div>

                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                    <span className="font-serif-display text-primary text-lg">
                      {index + 1}
                    </span>
                  </div>
                </div>
              </ParallaxScroll>
            </ScrollReveal>
          ))}
        </div>

        {/* Feature highlight */}
        <ScrollReveal animation="scale" delay={0.3}>
          <div className="glass-luxury p-12 lg:p-16 text-center max-w-4xl mx-auto shadow-luxury-lg">
            <div className="inline-block p-4 rounded-full bg-gradient-gold-subtle mb-6">
              <Award className="w-12 h-12 text-primary" />
            </div>
            <h3 className="font-serif-display text-3xl lg:text-4xl text-gradient-gold mb-6">
              Certified Excellence
            </h3>
            <p className="font-body-refined text-muted-foreground text-lg leading-relaxed mb-8">
              Every piece comes with BIS Hallmark certification, ensuring 100% purity and authenticity. 
              Our commitment to excellence is reflected in every detail, from the first sketch to the final polish.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {['BIS Hallmarked', 'IGI Certified', 'Lifetime Guarantee', 'Complimentary Insurance'].map((badge, i) => (
                <span 
                  key={i} 
                  className="font-premium-sans text-xs px-6 py-3 border border-gold-subtle rounded-full hover-scale transition-luxury"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
