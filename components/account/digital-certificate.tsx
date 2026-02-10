'use client'

import React from 'react'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'

interface CertificateProps {
    orderId: string
    productName: string
    purchaseDate: string
    sku: string
    customerName: string
}

export function DigitalCertificate({ orderId, productName, purchaseDate, sku, customerName }: CertificateProps) {
    // Generate a mock serial number based on order ID
    const serialNumber = `AUR-${sku.slice(0, 3).toUpperCase()}-${orderId.slice(0, 8).toUpperCase()}`
    const verificationUrl = `https://aurerxa.com/verify/${serialNumber}`

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-[#FDFCF5] p-8 md:p-12 relative shadow-2xl border-[16px] border-[#1a1a1a]"
        >
            {/* Decorative Border Details */}
            <div className="absolute top-4 left-4 w-24 h-24 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-4 right-4 w-24 h-24 border-t-2 border-r-2 border-[#D4AF37]" />
            <div className="absolute bottom-4 left-4 w-24 h-24 border-b-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute bottom-4 right-4 w-24 h-24 border-b-2 border-r-2 border-[#D4AF37]" />

            <div className="border border-[#D4AF37]/30 h-full p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                    <h1 className="text-[10rem] font-serif rotate-[-45deg] whitespace-nowrap">AURERXA</h1>
                </div>

                {/* Header */}
                <div className="mb-12 relative z-10">
                    <Image src="/logo.png" alt="AURERXA" width={120} height={40} className="mx-auto mb-6 opacity-80" />
                    <h1 className="text-4xl md:text-5xl font-serif tracking-wide text-[#1a1a1a] mb-2 uppercase">Certificate</h1>
                    <h2 className="text-xl md:text-2xl font-serif italic text-[#D4AF37]">of Authenticity</h2>
                </div>

                {/* Content */}
                <div className="space-y-8 relative z-10 w-full max-w-2xl">
                    <p className="text-[#1a1a1a]/70 font-serif text-lg leading-relaxed">
                        This document certifies that the accompanying jewelry piece is an original creation by <strong>AURERXA</strong>.
                        It has been handcrafted with the finest materials and inspected against our rigorous quality standards.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-b border-[#D4AF37]/20">
                        <div className="text-left space-y-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] block">Product</span>
                            <span className="text-xl font-serif text-[#1a1a1a] block">{productName}</span>
                        </div>
                        <div className="text-left space-y-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] block">SKU / Ref</span>
                            <span className="text-xl font-serif text-[#1a1a1a] block">{sku}</span>
                        </div>
                        <div className="text-left space-y-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] block">Owner</span>
                            <span className="text-xl font-serif text-[#1a1a1a] block">{customerName}</span>
                        </div>
                        <div className="text-left space-y-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] block">Date</span>
                            <span className="text-xl font-serif text-[#1a1a1a] block">{new Date(purchaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / QR */}
                <div className="mt-12 flex flex-col md:flex-row items-center justify-between w-full max-w-3xl gap-8 relative z-10">
                    <div className="text-center md:text-left">
                        <div className="font-dancing-script text-3xl text-[#1a1a1a] mb-2 font-handwriting">Naiem Shaikh</div>
                        <div className="h-px w-48 bg-[#1a1a1a]/20 mx-auto md:mx-0 mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/50">Master Artisan Signature</span>
                    </div>

                    <div className="bg-white p-2 shadow-sm border border-[#D4AF37]/20">
                        <QRCodeSVG value={verificationUrl} size={100} fgColor="#1a1a1a" bgColor="#FFFFFF" />
                    </div>

                    <div className="text-center md:text-right">
                        <span className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/50 block mb-1">Serial Number</span>
                        <span className="font-mono text-xs text-[#1a1a1a] block bg-[#D4AF37]/10 px-3 py-1 rounded-sm border border-[#D4AF37]/20">
                            {serialNumber}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
