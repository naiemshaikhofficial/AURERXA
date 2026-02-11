'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { VirtualTryOnModal, GoldHarvestModal, JewelryCareModal, BoutiqueVisitModal } from './service-modals'
import { Camera, Coins, Sparkles, Store } from 'lucide-react'

const services = [
    {
        id: 'try-on',
        title: 'Virtual Try-On',
        description: 'Experience our jewelry virtually from the comfort of your home.',
        icon: Camera,
        action: 'Try Now',
        modal: 'try-on'
    },
    {
        id: 'gold-harvest',
        title: 'Gold Harvest',
        description: 'Join our exclusive gold saving scheme for your future milestones.',
        icon: Coins,
        action: 'Learn More',
        modal: 'gold-harvest'
    },
    {
        id: 'jewelry-care',
        title: 'Jewelry Care',
        description: 'Complimentary professional cleaning and inspection services.',
        icon: Sparkles,
        action: 'Book Care',
        modal: 'jewelry-care'
    },
    {
        id: 'visit',
        title: 'Personalized Visit',
        description: 'Schedule a private consultation at our boutique with a jewelry expert.',
        icon: Store,
        action: 'Book Appointment',
        modal: 'visit'
    }
]

export function ServicesSection() {
    const [activeModal, setActiveModal] = useState<string | null>(null)

    return (
        <section className="py-24 bg-[#0a0a0a] border-t border-white/5">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-[#D4AF37] mb-4">Exceptional Services</h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Beyond exquisite jewelry, we offer a range of premium services designed to enhance your experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-[#111111] border border-white/5 p-8 text-center hover:border-[#D4AF37]/30 transition-all duration-300"
                        >
                            <div className="mb-6 flex justify-center">
                                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors duration-300">
                                    <service.icon className="w-6 h-6 text-[#D4AF37] group-hover:text-black transition-colors duration-300" />
                                </div>
                            </div>
                            <h3 className="text-xl font-serif text-white mb-3">{service.title}</h3>
                            <p className="text-white/60 mb-8 text-sm leading-relaxed min-h-[40px]">
                                {service.description}
                            </p>
                            <button
                                onClick={() => setActiveModal(service.modal)}
                                className="text-xs uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/30 pb-1 hover:border-[#D4AF37] transition-all"
                            >
                                {service.action}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <VirtualTryOnModal open={activeModal === 'try-on'} onOpenChange={(v) => !v && setActiveModal(null)} />
            <GoldHarvestModal open={activeModal === 'gold-harvest'} onOpenChange={(v) => !v && setActiveModal(null)} />
            <JewelryCareModal open={activeModal === 'jewelry-care'} onOpenChange={(v) => !v && setActiveModal(null)} />
            <BoutiqueVisitModal open={activeModal === 'visit'} onOpenChange={(v) => !v && setActiveModal(null)} />
        </section>
    )
}
