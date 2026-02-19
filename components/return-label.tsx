'use client'

import React from 'react'
import { Package, Truck, User, MapPin, Hash, ShieldCheck, AlertCircle } from 'lucide-react'

interface ReturnLabelProps {
    order: {
        order_number: string
        order_items?: { product_name: string; quantity: number }[]
    }
    requestId: string
    trackingNumber?: string
    customerProfiles: {
        full_name: string
        email: string
    }
}

export function ReturnLabel({ order, requestId, trackingNumber, customerProfiles }: ReturnLabelProps) {
    const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="w-[800px] p-10 bg-white text-slate-900 border-[12px] border-slate-900 min-h-[1000px] relative font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-serif font-black tracking-tighter text-slate-900 mb-1">AURERXA</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Fine Jewelry & Heritage</p>
                </div>
                <div className="text-right">
                    <div className="bg-slate-900 text-white px-4 py-2 font-bold uppercase tracking-widest text-xs mb-2">
                        RETURN AUTHORIZATION
                    </div>
                    <p className="text-xs font-bold text-slate-400">Date: {today}</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-2 gap-10">
                {/* FROM: Customer */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">FROM (Customer)</span>
                    </div>
                    <div className="pl-6 border-l-2 border-slate-200">
                        <p className="text-xl font-bold mb-1">{customerProfiles.full_name}</p>
                        <p className="text-sm text-slate-600">{customerProfiles.email}</p>
                    </div>
                </div>

                {/* TO: Warehouse */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">TO (AURERXA WAREHOUSE)</span>
                    </div>
                    <div className="pl-6 border-l-2 border-slate-400">
                        <p className="text-lg font-bold mb-1">AURERXA LOGISTICS CENTER</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Plot No. 45, Industrial Area Phase II,<br />
                            Surat, Gujarat - 395006<br />
                            India
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">Ph: +91 98765 43210</p>
                    </div>
                </div>
            </div>

            {/* Order Info Bar */}
            <div className="my-10 grid grid-cols-3 gap-4 border-y border-slate-100 py-6">
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="text-sm font-bold flex items-center gap-2 text-slate-900">
                        <Hash className="w-3.5 h-3.5" />
                        {order.order_number}
                    </p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Request ID</p>
                    <p className="text-sm font-bold text-slate-900">#{requestId.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Return Waybill</p>
                    <p className="text-sm font-black text-slate-900">{trackingNumber || 'PENDING'}</p>
                </div>
            </div>

            {/* BARCODE PLACEHOLDER (Using CSS for high contrast) */}
            <div className="bg-slate-50 p-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 mb-10">
                <div className="w-full h-24 bg-slate-900 mb-2 flex flex-col justify-center items-center">
                    <div className="flex gap-1">
                        {[...Array(40)].map((_, i) => (
                            <div key={i} className="bg-white" style={{ width: Math.random() > 0.5 ? '2px' : '4px', height: '60px' }}></div>
                        ))}
                    </div>
                </div>
                <p className="text-xs font-mono font-bold tracking-[0.5em] text-slate-900">{order.order_number}</p>
            </div>

            {/* Instructions */}
            <div className="bg-slate-900 text-white p-8">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-[#D4AF37]" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">Return Instructions</h3>
                </div>
                <ul className="space-y-3 text-xs opacity-90 leading-relaxed font-medium">
                    <li className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">1</span>
                        <span>Ensure the item is in its **original AURERXA velvet box** with all certificates and tags attached.</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">2</span>
                        <span>Place this label inside the outer packing box and one copy on the outside of the parcel.</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">3</span>
                        <span className="text-[#D4AF37]">Do NOT mention "Gold" or "Jewelry" on the outer box for security reasons.</span>
                    </li>
                    <li className="flex gap-3 border-t border-white/10 pt-3">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>Every return is weighed and X-rayed. Fraudulent claims are subject to legal action.</span>
                    </li>
                </ul>
            </div>

            {/* Footer */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <p>© AURERXA HERITAGE LOGISTICS</p>
                <div className="flex gap-4">
                    <span>Auth Verified</span>
                    <span>No-Tamper Required</span>
                </div>
            </div>
        </div>
    )
}
