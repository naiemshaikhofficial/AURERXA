'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'
import { ParallaxScroll } from './parallax-scroll'

const faqs = [
  {
    category: 'Pricing & Value',
    questions: [
      {
        q: 'Why is your pricing different from other jewelry websites?',
        a: 'Our pricing reflects true value: daily updated gold rates, weeks/months of handcrafting by master artisans, BIS certified materials, and fair wages. Unlike mass-produced jewelry, each piece is uniquely crafted for you with no shortcuts on quality.'
      },
      {
        q: 'How often do your prices change?',
        a: 'Prices are updated daily based on current gold and precious metal market rates. This ensures you always pay fair market value, not inflated fixed prices. You can check today\'s gold rate on our website.'
      },
      {
        q: 'Why does handmade jewelry cost more?',
        a: 'Each piece takes weeks or months to craft by skilled artisans using traditional techniques. This level of detail, expertise, and time investment cannot be replicated by machines. You\'re paying for authentic craftsmanship, not mass production.'
      }
    ]
  },
  {
    category: 'Orders & Delivery',
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Standard pieces: 5-7 business days with free insured delivery across India. Custom handcrafted orders: 2-4 weeks depending on complexity, as each piece is made specifically for you by our artisans.'
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! You\'ll receive tracking details via email and SMS once your order ships. For custom pieces, we provide regular updates on the crafting progress.'
      }
    ]
  },
  {
    category: 'Quality & Certification',
    questions: [
      {
        q: 'Are your products certified?',
        a: 'Yes, all gold jewelry is BIS Hallmarked for purity. Diamonds come with IGI/GIA certificates. Every piece includes authenticity certificates and detailed documentation.'
      },
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day inspection period for standard items. Custom-made pieces can be modified if not satisfied. Full transparency - we want you to love your jewelry.'
      },
      {
        q: 'Do you offer a warranty?',
        a: 'Every AURERXA piece comes with a lifetime manufacturing warranty. We also offer complimentary maintenance and repair services.'
      }
    ]
  },
  {
    category: 'Customization',
    questions: [
      {
        q: 'Can I customize a design?',
        a: 'Absolutely! Our master craftsmen can bring your vision to life. We work with retailers and individual clients to create bespoke pieces. Consultation and 3D previews available.'
      },
      {
        q: 'How long does custom jewelry take?',
        a: 'Custom pieces typically take 2-4 weeks depending on complexity. Intricate designs may take longer. We provide timeline estimates during consultation and keep you updated throughout.'
      },
      {
        q: 'What if I don\'t like the custom piece?',
        a: 'We work through multiple approval stages. If you\'re not satisfied, we\'ll make modifications until it\'s perfect. Your happiness is our priority.'
      }
    ]
  },
  {
    category: 'Care & Maintenance',
    questions: [
      {
        q: 'How do I care for my jewelry?',
        a: 'Store in provided boxes, avoid chemicals and perfumes, clean with soft cloth. We offer complimentary professional cleaning services - bring it to us anytime.'
      },
      {
        q: 'Do you offer resizing services?',
        a: 'Yes, complimentary resizing available for rings. Visit us or ship to us - we\'ll resize and return within 5-7 days with full insurance.'
      }
    ]
  }
]

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ScrollReveal animation="slide-up" delay={0.05 + index * 0.03}>
      <div className="glass-premium hover-lift transition-luxury shadow-luxury overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-5 flex items-center justify-between text-left group"
        >
          <span className="font-serif text-lg text-foreground pr-4 group-hover:text-primary transition-colors">
            {question}
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-5 pt-2 border-t border-gold-subtle/50">
            <p className="font-body-refined text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  )
}

export function FAQLuxury() {
  return (
    <section className="section-padding bg-gradient-luxury relative overflow-hidden">
      {/* Background decoration */}
      <ParallaxScroll offset={80} direction="down" className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </ParallaxScroll>

      <div className="container-luxury relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade" delay={0.05}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
              <p className="font-premium-sans text-primary text-sm">
                Have Questions?
              </p>
            </div>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-gradient-gold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="font-body-refined text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything you need to know about AURERXA jewelry, orders, and services
            </p>
          </div>
        </ScrollReveal>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-12">
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <ScrollReveal animation="slide-right" delay={0.1 + catIndex * 0.05}>
                <h3 className="font-serif-display text-2xl text-primary mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gradient-gold-subtle flex items-center justify-center text-sm">
                    {catIndex + 1}
                  </span>
                  {category.category}
                </h3>
              </ScrollReveal>

              <div className="space-y-4">
                {category.questions.map((faq, qIndex) => (
                  <FAQItem
                    key={qIndex}
                    question={faq.q}
                    answer={faq.a}
                    index={qIndex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <ScrollReveal animation="scale" delay={0.4}>
          <div className="mt-16 text-center">
            <div className="inline-block glass-luxury px-10 py-8 shadow-luxury-lg">
              <p className="font-serif text-xl text-foreground mb-4">
                Still have questions?
              </p>
              <p className="font-body-refined text-muted-foreground mb-6">
                Our luxury concierge team is here to help
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="/contact" 
                  className="px-6 py-3 bg-primary text-primary-foreground font-premium-sans text-sm hover-lift hover-glow transition-luxury"
                >
                  Contact Us
                </a>
                <a 
                  href="tel:+911234567890" 
                  className="px-6 py-3 border border-gold-subtle font-premium-sans text-sm hover-scale transition-luxury"
                >
                  Call: +91 123 456 7890
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
