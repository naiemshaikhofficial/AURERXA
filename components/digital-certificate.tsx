'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ShieldCheck, Award, Star, Gem } from 'lucide-react'

interface CertificateProps {
    orderNumber: string
    productName: string
    purity: string
    weight?: string
    purchaseDate: string
    customerId: string
}

export function DigitalCertificate({ orderNumber, productName, purity, weight, purchaseDate, customerId }: CertificateProps) {
    const verificationUrl = `https://aurerxa.com/verify/${orderNumber}-${customerId.slice(0, 8)}`

    return (
        <div className="bg-white text-slate-900 p-8 md:p-12 border-[12px] border-double border-[#BF9B65] relative overflow-hidden max-w-[800px] mx-auto shadow-2xl printable-certificate">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#BF9B65]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#BF9B65]/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

            {/* Gold Seal Pattern */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <Gem className="w-[400px] h-[400px]" />
            </div>

            <div className="relative z-10 border border-[#BF9B65]/20 p-6 md:p-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center gap-2 mb-4">
                        <Star className="w-4 h-4 text-[#BF9B65]" />
                        <Star className="w-5 h-5 text-[#BF9B65]" />
                        <Star className="w-4 h-4 text-[#BF9B65]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-[0.1em] text-[#8B6B38] mb-2 uppercase">Certificate of Authenticity</h1>
                    <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[#BF9B65] to-transparent mx-auto mb-4" />
                    <p className="text-[#BF9B65] font-serif italic text-lg">Official AURERXA Jewels Guarantee</p>
                </div>

                {/* Certificate Content */}
                <div className="space-y-8 text-center mb-12">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-bold">This is to certify that the jewelry item</p>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 tracking-wide">{productName}</h2>

                    <div className="grid grid-cols-2 gap-8 max-w-md mx-auto py-6 border-y border-[#BF9B65]/10 mt-6">
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Purity Guaranteed</p>
                            <p className="text-xl font-serif font-bold text-[#8B6B38]">{purity}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Authenticity ID</p>
                            <p className="text-xl font-serif font-bold text-[#8B6B38]">{orderNumber.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto italic">
                        "We hereby certify that this piece has been crafted with the highest standards of luxury and precision. All materials used are ethically sourced and carry the AURERXA promise of eternal purity."
                    </p>
                </div>

                {/* Footer Area */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-[#BF9B65]/20">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
                        <div className="flex items-center gap-2 text-slate-700 font-serif font-bold text-lg mb-1">
                            <ShieldCheck className="w-6 h-6 text-[#BF9B65]" />
                            AURERXA QUALITY ASSURANCE
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Date of Purchase: {new Date(purchaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>

                    <div className="flex flex-col items-center gap-2 order-1 md:order-2">
                        <div className="p-2 border border-[#BF9B65]/30 bg-white">
                            <QRCodeSVG value={verificationUrl} size={100} level="H" />
                        </div>
                        <p className="text-[9px] uppercase tracking-widest text-[#BF9B65] font-bold">Scan to Verify Authenticity</p>
                    </div>
                </div>

                {/* Signature Area */}
                <div className="mt-12 text-center">
                    <div className="inline-block relative">
                        <p className="font-serif italic text-2xl text-slate-800 mb-0 px-8">N. Shaikh</p>
                        <div className="h-[1px] w-full bg-slate-300" />
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-2">Managing Director, AURERXA Jewels</p>
                        {/* Decorative Icon */}
                        <Award className="absolute -left-8 top-0 w-6 h-6 text-[#BF9B65]/40" />
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @media print {
          .printable-certificate {
            box-shadow: none !important;
            border-width: 8px !important;
            padding: 2rem !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
        </div>
    )
}
