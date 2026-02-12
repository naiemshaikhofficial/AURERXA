'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SizeGuideProps {
    category: string
    subCategory?: string
    onClose: () => void
}

const RING_SIZES = [
    { in: '6', mm: '14.6', circumference: '45.9' },
    { in: '8', mm: '15.3', circumference: '48.1' },
    { in: '10', mm: '15.9', circumference: '50.0' },
    { in: '12', mm: '16.5', circumference: '51.9' },
    { in: '14', mm: '17.2', circumference: '54.0' },
    { in: '16', mm: '17.8', circumference: '55.9' },
    { in: '18', mm: '18.5', circumference: '58.1' },
    { in: '20', mm: '19.1', circumference: '60.0' },
    { in: '22', mm: '19.8', circumference: '62.2' },
]

const BANGLE_SIZES = [
    { size: '2-2', inches: '2.12', mm: '54.0' },
    { size: '2-4', inches: '2.25', mm: '57.2' },
    { size: '2-6', inches: '2.37', mm: '60.3' },
    { size: '2-8', inches: '2.50', mm: '63.5' },
    { size: '2-10', inches: '2.62', mm: '66.7' },
]

const NECKLACE_SIZES = [
    { label: 'Choker', inches: '14-16', desc: 'Sits at the base of the neck' },
    { label: 'Princess', inches: '18', desc: 'Falls just below the collarbone' },
    { label: 'Matinee', inches: '20-24', desc: 'Rests at the center of the bust' },
    { label: 'Opera', inches: '28-36', desc: 'Falls below the bust' },
]

export function SizeGuide({ category, subCategory, onClose }: SizeGuideProps) {
    const type = (subCategory || category || '').toLowerCase()

    const isRing = type.includes('ring')
    const isBangle = type.includes('bangle') || type.includes('bracelet')
    const isNecklace = type.includes('necklace') || type.includes('pendant') || type.includes('chain') || type.includes('mangalsutra')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
        >
            <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 p-8 md:p-12 overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-[0.3em]">Imperial Guide</p>
                        <h2 className="text-3xl font-serif italic text-white/90">Indian Size Chart</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar pr-2">
                    {/* Visual Reference Section */}
                    <div className="p-6 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl mb-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1 space-y-4">
                                <h4 className="text-sm font-serif italic text-amber-200/90">How to Measure</h4>
                                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">
                                    {isRing && "Measure the inner diameter of an existing ring or wrap a string around your finger and measure its length in mm."}
                                    {isBangle && "Tuck your thumb and measure the circumference around your knuckles, or the inner diameter of a perfectly fitting bangle."}
                                    {isNecklace && "Compare standard lengths to see where the piece will rest. Chokers sit at the base, while Opera lengths fall below the bust."}
                                </p>
                            </div>

                            {/* CSS Visual Diagrams */}
                            <div className="relative w-32 h-32 flex items-center justify-center bg-neutral-950 border border-white/5 rounded-full overflow-hidden">
                                {isRing && (
                                    <div className="relative w-20 h-20 border-2 border-amber-500/40 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                        <div className="absolute w-full h-[1px] bg-amber-500/30 rotate-45" />
                                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-950 px-2 text-[8px] font-mono text-amber-500/60 uppercase">Dwt</span>
                                    </div>
                                )}
                                {isBangle && (
                                    <div className="relative w-24 h-24 border border-dashed border-amber-500/30 rounded-full flex items-center justify-center">
                                        <div className="w-16 h-16 border-2 border-amber-500/50 rounded-full" />
                                        <Ruler className="absolute bottom-2 right-2 w-4 h-4 text-amber-500/20" />
                                    </div>
                                )}
                                {isNecklace && (
                                    <div className="relative flex flex-col items-center gap-1">
                                        <div className="w-10 h-10 border-2 border-white/10 rounded-full" />
                                        <div className="w-16 h-8 border-b-2 border-amber-500/40 rounded-full opacity-30" />
                                        <div className="w-20 h-12 border-b-2 border-amber-500/50 rounded-full opacity-60" />
                                        <div className="w-24 h-16 border-b-2 border-amber-500/70 rounded-full" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isRing && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">India Size</th>
                                    <th className="py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-center">Diameter (mm)</th>
                                    <th className="py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-right">Circumference (mm)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {RING_SIZES.map((s) => (
                                    <tr key={s.in} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 text-sm font-serif italic text-amber-200/80">{s.in}</td>
                                        <td className="py-4 text-sm text-white/60 text-center font-mono">{s.mm}</td>
                                        <td className="py-4 text-sm text-white/60 text-right font-mono">{s.circumference}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {isBangle && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">India Size</th>
                                    <th className="py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-center">Inches</th>
                                    <th className="py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-right">Inner Diameter (mm)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {BANGLE_SIZES.map((s) => (
                                    <tr key={s.size} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 text-sm font-serif italic text-amber-200/80">{s.size}</td>
                                        <td className="py-4 text-sm text-white/60 text-center font-mono">{s.inches}"</td>
                                        <td className="py-4 text-sm text-white/60 text-right font-mono">{s.mm}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {isNecklace && (
                        <div className="grid gap-4">
                            {NECKLACE_SIZES.map((s) => (
                                <div key={s.label} className="p-6 bg-white/[0.02] border border-white/5 group hover:border-amber-500/20 transition-all">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h4 className="text-lg font-serif italic text-amber-200/80">{s.label}</h4>
                                        <span className="text-xs font-mono text-white/40">{s.inches} inches</span>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/30 leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isRing && !isBangle && !isNecklace && (
                        <div className="py-20 text-center space-y-4">
                            <Ruler className="w-12 h-12 text-white/10 mx-auto" />
                            <p className="text-sm text-white/40 uppercase tracking-widest">Standard Sizing Applies</p>
                            <p className="text-[10px] text-white/20 max-w-xs mx-auto">Please contact our concierge for bespoke measurements and virtual assistance.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] max-w-sm text-center md:text-left leading-relaxed">
                        Measured values are approximate. For the most accurate fit, we recommend visiting an AURERXA boutique.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full md:w-auto px-10 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
