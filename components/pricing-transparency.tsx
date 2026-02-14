'use client'

import { TrendingUp, Clock, Award, Gem, Scale, Shield } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'
import { ParallaxScroll } from './parallax-scroll'

const pricingFactors = [
  {
    icon: TrendingUp,
    title: 'Daily Market Rates',
    description: 'Gold and precious metal prices fluctuate daily. Our pricing reflects real-time market rates, ensuring fair and transparent pricing based on current commodity values.',
    highlight: 'Updated Daily'
  },
  {
    icon: Clock,
    title: 'Handcrafted Process',
    description: 'Each piece is meticulously handcrafted by skilled artisans. Complex designs can take weeks or even months to complete, with every detail perfected by hand.',
    highlight: 'Weeks to Months'
  },
  {
    icon: Award,
    title: 'Master Craftsmanship',
    description: 'Our artisans bring decades of experience and traditional techniques. This level of expertise and attention to detail cannot be mass-produced or rushed.',
    highlight: 'Expert Artisans'
  },
  {
    icon: Gem,
    title: 'Premium Materials',
    description: 'We use only BIS Hallmarked gold and certified gemstones. Every material is authenticated and meets the highest quality standards for lasting beauty.',
    highlight: '100% Certified'
  },
  {
    icon: Scale,
    title: 'Fair Pricing',
    description: 'No hidden costs or markups. Our pricing is transparent, reflecting actual material costs, craftsmanship time, and fair wages for our skilled artisans.',
    highlight: 'Transparent'
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Multiple quality checks, certifications, and guarantees. Each piece undergoes rigorous inspection to ensure it meets our exacting standards.',
    highlight: 'Guaranteed Quality'
  }
]

export function PricingTransparency() {
  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Background decoration */}
      <ParallaxScroll offset={80} direction="down" className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </ParallaxScroll>

      <div className="container-luxury relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade" delay={0.05}>
          <div className="text-center mb-16">
            <p className="font-premium-sans text-primary text-sm mb-4">
              Transparent Pricing
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-gradient-gold mb-6">
              Why Our Pricing Reflects True Value
            </h2>
            <p className="font-body-refined text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              Unlike mass-produced jewelry, every AURERXA piece is a unique creation. Our pricing reflects 
              the true cost of authentic craftsmanship, premium materials, and the time invested in perfection.
            </p>
          </div>
        </ScrollReveal>

        {/* Pricing Factors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {pricingFactors.map((factor, index) => (
            <ScrollReveal 
              key={index} 
              animation="slide-up" 
              delay={0.1 + index * 0.06}
            >
              <ParallaxScroll offset={20} scaleOffset={0.02}>
                <div className="glass-premium p-8 hover-lift transition-luxury shadow-luxury h-full group">
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-gold-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
                      <factor.icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="font-premium-sans text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">
                      {factor.highlight}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-serif text-xl text-foreground mb-4 group-hover:text-primary transition-colors">
                    {factor.title}
                  </h3>
                  <p className="font-body-refined text-muted-foreground leading-relaxed text-sm">
                    {factor.description}
                  </p>
                </div>
              </ParallaxScroll>
            </ScrollReveal>
          ))}
        </div>

        {/* Comparison Section */}
        <ScrollReveal animation="scale" delay={0.4}>
          <div className="glass-luxury p-10 lg:p-12 shadow-luxury-lg">
            <h3 className="font-serif-display text-2xl lg:text-3xl text-center text-gradient-gold mb-8">
              What Makes Us Different
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Mass Production */}
              <div className="text-center p-6 bg-muted/20 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h4 className="font-serif text-lg text-muted-foreground mb-3">Mass Production</h4>
                <ul className="space-y-2 text-sm text-muted-foreground/80">
                  <li>• Machine-made in bulk</li>
                  <li>• Fixed pricing, lower quality</li>
                  <li>• Quick turnaround</li>
                  <li>• Limited customization</li>
                  <li>• Standard designs</li>
                </ul>
              </div>

              {/* AURERXA */}
              <div className="text-center p-6 bg-gradient-gold-subtle rounded-lg border border-gold-subtle">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h4 className="font-serif text-lg text-primary mb-3">AURERXA Craftsmanship</h4>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li>• Handcrafted by master artisans</li>
                  <li>• Market-based, transparent pricing</li>
                  <li>• Weeks to months of dedication</li>
                  <li>• Fully customizable designs</li>
                  <li>• Unique, one-of-a-kind pieces</li>
                </ul>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-10 pt-8 border-t border-gold-subtle text-center">
              <p className="font-serif-luxury text-lg text-foreground/80 mb-4">
                "We don't compete on price. We compete on quality, authenticity, and the timeless value of true craftsmanship."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
                <p className="font-premium-sans text-xs text-primary">
                  AURERXA Promise
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Live Pricing Note */}
        <ScrollReveal animation="fade" delay={0.5}>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 glass-luxury shadow-luxury">
              <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
              <div className="text-left">
                <p className="font-serif text-sm text-foreground">
                  Live Market Pricing
                </p>
                <p className="font-premium-sans text-xs text-muted-foreground">
                  Updated daily based on gold rates
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
