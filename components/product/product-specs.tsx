'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Ruler, Weight, ShieldCheck, Diamond, Sparkles, Layers } from 'lucide-react'
import { formatWeight, formatDimensions, formatPurity } from '@/lib/material-intelligence'
import { cn } from '@/lib/utils'

interface ProductSpecsProps {
    product: any
    dynamicData: any
}

export function ProductSpecs({ product, dynamicData }: ProductSpecsProps) {
    const purityInfo = formatPurity(product.purity, product.material_type)

    const specs = [
        {
            label: 'Metal Purity',
            value: product.purity || '925 Sterling Silver',
            icon: Sparkles,
            detail: purityInfo.subLabel
        },
        {
            label: 'Metal Type',
            value: product.material_type || 'Silver',
            icon: ShieldCheck,
            detail: 'Authentic Heritage Material'
        },
        {
            label: 'Metal Weight',
            value: formatWeight(dynamicData.weight),
            icon: Weight,
            detail: 'Approximate Weight'
        },
        {
            label: 'Dimensions',
            value: dynamicData.dimensions || 'Standard Size',
            icon: Ruler,
            detail: 'Precision Crafted'
        },
        {
            label: 'Craftsmanship',
            value: product.making_type || 'Handcrafted',
            icon: Layers,
            detail: 'Artisan Excellence'
        }
    ]

    return (
        <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <h3 className="text-[11px] uppercase tracking-[0.5em] text-amber-200/40 font-bold whitespace-nowrap">
                    Technical Specifications
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
                {specs.map((spec, i) => (
                    <motion.div
                        key={spec.label}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-neutral-950/40 group p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-amber-200/60 transition-colors shrink-0">
                            <spec.icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase tracking-widest text-white/30 font-medium">
                                {spec.label}
                            </p>
                            <p className="text-sm font-serif text-white/90">
                                {spec.value}
                            </p>
                            <p className="text-[9px] text-amber-500/40 italic">
                                {spec.detail}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quality Promise */}
            <div className="p-6 bg-amber-900/5 border border-amber-500/10 flex items-center gap-6">
                <div className="hidden sm:flex w-12 h-12 items-center justify-center text-amber-500/40">
                    <ShieldCheck className="w-8 h-8 stroke-1" />
                </div>
                <div className="space-y-1 text-left">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/80 font-bold">Automatic Weight Calibration</p>
                    <p className="text-[10px] text-white/40 leading-relaxed max-w-lg">
                        Our dynamic pricing engine automatically calibrates metal weights and dimensions based on your specific size selections for absolute transparency.
                    </p>
                </div>
            </div>
        </div>
    )
}
