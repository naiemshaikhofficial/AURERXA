'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Maximize2, ArrowRight, Shield, Truck, RotateCcw } from 'lucide-react'
import { CertificationGroup } from '@/components/certification-seals'

interface ProductHighlightsProps {
    product: any
    setIsVTOOpen: (open: boolean) => void
    CachedVideo: React.ComponentType<{ src: string, isShort: boolean }>
    MATERIAL_CONFIG: any
    formatPurity: (purity: string, material: string) => any
}

export function ProductHighlights({
    product,
    setIsVTOOpen,
    CachedVideo,
    MATERIAL_CONFIG,
    formatPurity
}: ProductHighlightsProps) {
    return (
        <div className="prose prose-invert prose-sm max-w-none text-white/50 font-light leading-relaxed tracking-wide">
            <p>{product.description}</p>

            {/* Interactive VTO */}
            <div className="mt-10">
                <button
                    onClick={() => setIsVTOOpen(true)}
                    className="w-full relative group flex items-center justify-between bg-white/5 border border-white/5 p-6 overflow-hidden transition-all hover:bg-neutral-900"
                >
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center text-amber-200/80 group-hover:scale-110 transition-transform duration-500">
                            <Maximize2 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-amber-200/60 font-bold uppercase tracking-[0.3em] mb-2">Interactive Mirror</p>
                            <p className="text-lg font-serif italic text-white/90 group-hover:text-amber-100 transition-colors">Virtual Try-On Experience</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                </button>
            </div>

            {/* Video Section */}
            {product.video_url && (
                <div className="mt-10 space-y-4">
                    <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-[0.3em]">Visual Experience</p>
                    {(() => {
                        const url = product.video_url;
                        const isShort = url.includes('/shorts/');
                        const youtubeRegExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(\/shorts\/)|(&v=))([^#&?]*).*/;
                        const ytMatch = url.match(youtubeRegExp);
                        const youtubeId = (ytMatch && ytMatch[9].length === 11) ? ytMatch[9] : null;

                        return (
                            <div className={`relative w-full ${isShort ? 'aspect-[9/16] max-w-[340px] mx-auto' : 'aspect-video'} bg-neutral-900 border border-white/5 overflow-hidden group`}>
                                {youtubeId ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&controls=0&showinfo=0`}
                                        title={product.name}
                                        className="absolute inset-0 w-full h-full pointer-events-none scale-105"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <CachedVideo src={url} isShort={isShort} />
                                )}
                                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                    <span className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-medium drop-shadow-md">AURERXA Cinema</span>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Brand Credentials */}
            <div className="space-y-6 pt-10 border-t border-white/5">
                <p className="text-[10px] text-amber-200/40 font-bold uppercase tracking-[0.4em]">Heritage Certification</p>
                <CertificationGroup materials={[
                    product.material_type?.includes('gold') ? 'gold' : '',
                    product.material_type?.includes('diamond') ? 'diamond' : '',
                    product.material_type?.includes('silver') ? 'silver' : ''
                ].filter(Boolean)} />
            </div>

            {/* Service Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 py-10 border-t border-b border-white/5 bg-white/[0.02]">
                <ServicePillar Icon={Shield} label="Secure Transaction" />
                <ServicePillar Icon={Truck} label="Global Logistics" />
                <ServicePillar Icon={RotateCcw} label="Legacy Support" />
            </div>

            {/* Heritage Text */}
            <div className="space-y-6 py-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px w-8 bg-amber-500/40" />
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/40">Heritage & Craftsmanship</span>
                </div>
                <p className="text-sm font-serif italic text-white/70 leading-relaxed font-light">
                    Each Aurerxa creation is a testament to the timeless artistry of Indian jewelry making. This {product.name.toLowerCase()} is handcrafted by master artisans, blending ancestral techniques with contemporary luxury.
                </p>
                <div className="flex flex-wrap gap-8 pt-4">
                    <HighlightItem label="Technique" value="Handmade Artisan" />
                    <HighlightItem label="Material Integrity" value={`${product.purity} ${product.categories?.name || (product.material_type ? MATERIAL_CONFIG[product.material_type]?.label : formatPurity(product.purity, product.material_type).label)}`} />
                </div>
            </div>
        </div>
    )
}

function ServicePillar({ Icon, label }: { Icon: any, label: string }) {
    return (
        <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center text-center gap-3 group">
            <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-amber-200/20 transition-colors">
                <Icon className="w-5 h-5 text-white/20 group-hover:text-amber-200/60 transition-colors duration-500" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">{label}</span>
        </motion.div>
    )
}

function HighlightItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] text-white/20 uppercase tracking-widest font-medium">{label}</p>
            <p className="text-[10px] text-amber-200/60 uppercase tracking-widest">{value}</p>
        </div>
    )
}
