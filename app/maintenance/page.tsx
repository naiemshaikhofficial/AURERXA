import React from 'react'
import { Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Minimalist Backdrop */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 space-y-12 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Brand Identity */}
                <div className="space-y-6">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-full border border-[#D4AF37]/20 flex items-center justify-center bg-gradient-to-tr from-[#D4AF37]/10 to-transparent relative group">
                            <span className="text-3xl font-serif text-[#D4AF37] tracking-tighter">AX</span>
                            <div className="absolute inset-0 rounded-full border border-[#D4AF37]/40 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-serif text-white tracking-widest uppercase">
                        Refinement <br /> <span className="italic text-[#D4AF37] normal-case tracking-normal">in Progress</span>
                    </h1>

                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-8" />
                </div>

                {/* Message */}
                <p className="text-white/40 font-light text-sm md:text-base leading-relaxed tracking-widest uppercase px-4 max-w-sm mx-auto">
                    We are currently curating a more bespoke digital experience.
                    Our boutique will reopen shortly.
                </p>

                {/* Support - Minimalist */}
                <div className="pt-8 space-y-4">
                    <p className="text-[#D4AF37]/60 text-[10px] uppercase tracking-[0.4em] font-medium">
                        Direct All Inquiries to
                    </p>
                    <a
                        href="mailto:Contact@Aurerxa.com"
                        className="group flex flex-col items-center gap-3 transition-opacity hover:opacity-100 opacity-80"
                    >
                        <span className="text-white font-serif text-xl tracking-wide group-hover:text-[#D4AF37] transition-colors">
                            contact@aurerxa.com
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.2em]">
                            <Mail size={10} className="text-[#D4AF37]/50" />
                            AURERXA Concierge
                        </div>
                    </a>
                </div>

                {/* Fine Print */}
                <div className="pt-20 opacity-30">
                    <p className="text-[9px] text-white uppercase tracking-[0.5em] font-extralight">
                        © 2026 AURERXA HERITAGE
                    </p>
                </div>
            </div>

            {/* Premium Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] select-none mix-blend-overlay">
                <svg className="h-full w-full">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>
        </div>
    )
}
