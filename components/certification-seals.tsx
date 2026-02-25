'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Award, CheckCircle2, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SealProps {
    type: 'bis' | 'igi' | 'gia' | 'hallmark' | 'handmade'
    className?: string
}

const SEAL_CONFIG = {
    bis: {
        label: 'BIS Hallmarked',
        sub: 'Purity Guaranteed',
        icon: ShieldCheck,
        color: 'text-amber-400',
        bg: 'bg-amber-400/5',
        border: 'border-amber-400/20'
    },
    igi: {
        label: 'IGI Certified',
        sub: 'Diamond Authenticity',
        icon: Award,
        color: 'text-cyan-400',
        bg: 'bg-cyan-400/5',
        border: 'border-cyan-400/20'
    },
    gia: {
        label: 'GIA Standard',
        sub: 'Global Excellence',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/5',
        border: 'border-emerald-400/20'
    },
    hallmark: {
        label: '99.99 Pure',
        sub: 'Silver Heritage',
        icon: BadgeCheck,
        color: 'text-blue-400',
        bg: 'bg-blue-400/5',
        border: 'border-blue-400/20'
    },
    handmade: {
        label: 'Artisan Made',
        sub: 'Handcrafted Heritage',
        icon: CheckCircle2,
        color: 'text-orange-400',
        bg: 'bg-orange-400/5',
        border: 'border-orange-400/20'
    }
}

export function CertificationSeal({ type, className }: SealProps) {
    const cfg = SEAL_CONFIG[type]
    const Icon = cfg.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
                "flex items-center gap-4 p-4 rounded-xl border backdrop-blur-md transition-all duration-700",
                cfg.bg, cfg.border, className
            )}
        >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", cfg.border)}>
                <Icon className={cn("w-5 h-5", cfg.color)} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{cfg.label}</p>
                <p className="text-[9px] font-medium text-white/30 uppercase tracking-widest">{cfg.sub}</p>
            </div>
        </motion.div>
    )
}

export function CertificationGroup({ materials }: { materials: string[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.includes('gold') && <CertificationSeal type="bis" />}
            {materials.includes('diamond') && <CertificationSeal type="igi" />}
            {materials.includes('silver') && <CertificationSeal type="hallmark" />}
            <CertificationSeal type="handmade" />
        </div>
    )
}
