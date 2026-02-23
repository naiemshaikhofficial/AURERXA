import React from 'react'
import { getSiteSetting } from '@/app/actions'
import { HeadphonesIcon, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MaintenancePage() {
    const maintenanceConfig = await getSiteSetting('maintenance_config', {
        is_enabled: false,
        message: "AURERXA is upgrading to serve you better. We will be back shortly with a more premium experience."
    })

    const contactConfig = await getSiteSetting('contact_config', {
        phone: "+91 9391032677",
        whatsapp: "+91 9391032677"
    })

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Logo or Brand Mark */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#D4AF37]/5">
                        <span className="text-2xl font-serif text-[#D4AF37]">A</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
                        Refining Excellence
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-lg mx-auto">
                        {maintenanceConfig.message}
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <Link
                        href={`https://wa.me/${contactConfig.whatsapp.replace(/\D/g, '')}`}
                        className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full text-sm font-bold hover:scale-105 transition-transform"
                    >
                        <MessageCircle className="w-4 h-4" /> WhatsApp Support
                    </Link>
                    <Link
                        href={`tel:${contactConfig.phone}`}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                        <HeadphonesIcon className="w-4 h-4" /> Call Us
                    </Link>
                </div>

                <div className="pt-12">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                        <p className="text-[#D4AF37] text-xs font-medium uppercase tracking-widest">
                            Official AURERXA Boutique
                        </p>
                    </div>
                </div>
            </div>

            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] bg-[#D4AF37]/5 rounded-full blur-[100px]" />
            </div>
        </div>
    )
}
