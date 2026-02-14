'use client'

import React from 'react'
import Image from 'next/image'
import { Package, MapPin, Phone, Mail, Globe, Printer, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InvoiceProps {
    order: any
    type: 'customer' | 'shipping'
}

export function InvoiceTemplate({ order, type }: InvoiceProps) {
    if (!order) return null

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const isShipping = type === 'shipping'

    return (
        <div
            className={cn(
                "bg-white text-slate-900 mx-auto font-sans relative",
                isShipping
                    ? "p-6 w-[600px] h-[400px] border-[12px] border-slate-900 overflow-hidden shadow-2xl"
                    : "p-10 max-w-[800px] border-[1px] border-slate-100 shadow-2xl"
            )}
            id="printable-invoice"
        >
            {/* Corner Accents for Luxury Feel (Only on Invoice) */}
            {!isShipping && (
                <>
                    <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-[#D4AF37] pointer-events-none opacity-20" />
                    <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-[#D4AF37] pointer-events-none opacity-20" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-[#D4AF37] pointer-events-none opacity-20" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-[#D4AF37] pointer-events-none opacity-20" />
                </>
            )}

            {/* Header section */}
            <div className={cn("flex justify-between items-start", isShipping ? "mb-6" : "border-b-4 border-[#D4AF37] pb-10 mb-10")}>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <img
                            src="/logo.png"
                            alt="AURERXA Logo"
                            className={cn("object-contain filter grayscale invert brightness-0", isShipping ? "h-14" : "h-20")}
                        />
                        {!isShipping && (
                            <div className="border-l-2 border-[#D4AF37] pl-4">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">AURERXA</h1>
                                <p className="text-[12px] uppercase tracking-[0.3em] text-[#D4AF37] font-black mt-1.5">Heritage Craftsmanship</p>
                            </div>
                        )}
                    </div>

                    {!isShipping && (
                        <div className="mt-6 text-[11px] text-slate-600 space-y-1 font-medium bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="font-black text-slate-900 text-[12px] mb-1">NIJAM GOLD WORKS</p>
                            <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Captain Lakshmi Chowk, Rangargalli, Sangamner 422605</p>
                            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> +91 7776818394</p>
                            <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> www.aurerxa.com</p>
                        </div>
                    )}
                </div>

                <div className="text-right">
                    <div className="inline-block bg-slate-900 text-white px-4 py-2 rounded-sm mb-4">
                        <h2 className={cn("font-black uppercase tracking-[0.2em]", isShipping ? "text-lg" : "text-xl")}>
                            {isShipping ? 'LOGISTICS UNIT' : 'TAX INVOICE'}
                        </h2>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[12px] text-slate-400 font-mono font-black uppercase">REFERENCE: <span className="text-slate-900 bg-slate-100 px-1">#{order.order_number}</span></p>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-wider">{formatDate(order.created_at)}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {isShipping ? (
                /* Landscape Shipping Layout - Premium Match */
                <div className="grid grid-cols-12 gap-8 items-stretch pt-2">
                    {/* Left side: Ship To */}
                    <div className="col-span-7 bg-white border-[3px] border-slate-900 p-6 rounded-none relative flex flex-col justify-center">
                        <div className="absolute -top-3 left-4 bg-slate-900 text-white text-[10px] font-black px-3 py-0.5 tracking-widest uppercase">Recipient</div>
                        <div className="space-y-2">
                            <p className="text-3xl font-black text-slate-900 leading-none tracking-tight mb-2">
                                {order.shipping_address?.full_name || order.shipping_address?.name}
                            </p>
                            <p className="text-lg font-bold text-slate-700 leading-tight border-l-4 border-[#D4AF37] pl-4 py-1">
                                {order.shipping_address?.street_address || order.shipping_address?.address}
                            </p>
                            <p className="text-xl font-black text-slate-900 uppercase tracking-tighter mt-4">
                                {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                            </p>
                            <div className="pt-4 mt-2">
                                {order.shipping_address?.phone && (
                                    <div className="inline-flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-full font-black text-xl">
                                        <Phone className="w-5 h-5 text-[#D4AF37]" /> {order.shipping_address.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right side: Security & Shipping Info */}
                    <div className="col-span-5 flex flex-col gap-4">
                        <div className="bg-slate-50 border-2 border-slate-200 p-5 h-1/2 flex flex-col justify-center">
                            <h3 className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-[0.2em]">Return Center</h3>
                            <div className="text-[12px] font-bold text-slate-700 leading-tight space-y-1">
                                <p className="text-slate-900 font-black text-sm">AURERXA OFFICIAL</p>
                                <p>CL Chowk • Rangargalli</p>
                                <p>Sangamner • MS 422605</p>
                                <p className="text-[#D4AF37] font-black">M: 7776818394</p>
                            </div>
                        </div>

                        <div className={cn(
                            "flex-grow rounded-none border-b-8 flex flex-col items-center justify-center text-center p-4",
                            order.payment_method === 'cod' ? "bg-slate-900 border-[#D4AF37] text-white" : "bg-[#D4AF37] border-slate-900 text-slate-900"
                        )}>
                            <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-70">Payment Mode</p>
                            <p className="text-3xl font-black uppercase tracking-tight mt-1 leading-none">
                                {order.payment_method === 'cod' ? 'C O D' : 'PREPAID'}
                            </p>
                            {order.payment_method === 'cod' && (
                                <div className="mt-4 py-2 px-6 bg-white/10 border border-white/20 rounded-lg">
                                    <p className="text-2xl font-black text-[#D4AF37]">
                                        {formatCurrency(order.total)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Standard Portrait Invoice Layout - Full Premium */
                <>
                    {/* Billing/Shipping Info */}
                    <div className="grid grid-cols-2 gap-16 mb-16">
                        <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#D4AF37] opacity-60" />
                            <h3 className="text-[12px] uppercase font-black text-slate-400 tracking-[0.3em] mb-4">Shipping Destination</h3>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-slate-900 leading-none">
                                    {order.shipping_address?.full_name || order.shipping_address?.name}
                                </p>
                                <p className="text-base font-bold text-slate-600 leading-relaxed">
                                    {order.shipping_address?.street_address || order.shipping_address?.address}
                                </p>
                                <p className="text-base font-black text-slate-900 uppercase tracking-tight">
                                    {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                                </p>
                                <div className="pt-4">
                                    {order.shipping_address?.phone && (
                                        <p className="font-black text-slate-900 flex items-center gap-2 text-md">
                                            <Phone className="w-4 h-4 text-[#D4AF37]" /> +91 {order.shipping_address.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h3 className="text-[12px] uppercase font-black text-slate-400 tracking-[0.3em] mb-4">Order Intelligence</h3>
                            <div className="space-y-3 text-sm">
                                {order.user?.email && (
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-400 font-bold uppercase text-[10px]">Client</span>
                                        <span className="font-black text-slate-900">{order.user.email}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-slate-200 pb-2">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Method</span>
                                    <span className="font-black text-slate-900 uppercase tracking-tighter">{order.payment_method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Transaction</span>
                                    <span className="font-mono text-slate-900 font-black">#{order.payment_id?.slice(0, 12) || 'AUTH_D_GEN'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table - High End Style */}
                    <div className="mb-16">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-900 text-white text-[11px] uppercase font-black tracking-widest">
                                    <th className="text-left p-5 rounded-tl-lg">Item</th>
                                    <th className="text-left p-5">Description</th>
                                    <th className="text-center p-5">Quantity</th>
                                    <th className="text-right p-5">Unit Price</th>
                                    <th className="text-right p-5 rounded-tr-lg">Extension</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-100 italic">
                                {order.order_items?.map((item: any, idx: number) => (
                                    <tr key={item.id} className="text-sm font-black group hover:bg-slate-50 transition-colors">
                                        <td className="p-5 text-slate-300 font-mono text-xs">{String(idx + 1).padStart(2, '0')}</td>
                                        <td className="p-5">
                                            <p className="font-black text-slate-900 text-base">{item.product_name}</p>
                                            <p className="text-[11px] text-[#D4AF37] font-black uppercase tracking-widest mt-1">Ref ID: {item.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="p-5 text-center font-black text-slate-900">{item.quantity}</td>
                                        <td className="p-5 text-right text-slate-500">{formatCurrency(item.price)}</td>
                                        <td className="p-5 text-right font-black text-slate-900 text-lg">{formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Area - Luxury Split */}
                    <div className="flex justify-between items-end pt-10 border-t-4 border-slate-900 mb-16">
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] max-w-[300px] leading-loose">
                            This document serves as an official confirmation of heritage craftsmanship by Nijam Gold Works. All items are verified for quality standards.
                        </div>
                        <div className="w-80 space-y-4">
                            <div className="flex justify-between text-[12px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-slate-900">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[12px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Logistic Fees</span>
                                <span className="text-slate-900">{order.shipping === 0 ? 'COMPLIMENTARY' : formatCurrency(order.shipping)}</span>
                            </div>
                            {order.coupon_discount > 0 && (
                                <div className="flex justify-between text-[12px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1">
                                    <span>Exclusive Privilege</span>
                                    <span>- {formatCurrency(order.coupon_discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-6 border-t-2 border-[#D4AF37] items-center">
                                <span className="text-[14px] uppercase font-black text-slate-900 tracking-tighter">Grand Total</span>
                                <span className="text-4xl font-black text-slate-900 tracking-tighter decoration-[#D4AF37] underline underline-offset-8">
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Legal - Luxury Block */}
                    <div className="mt-auto grid grid-cols-12 gap-10 items-end">
                        <div className="col-span-8 text-[10px] text-slate-400 leading-relaxed font-black uppercase tracking-wider bg-slate-50 p-6 rounded-lg">
                            <h4 className="text-slate-900 mb-3 tracking-[0.4em] text-[11px]">Official Authentication</h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                <p>• Computer Generated Status</p>
                                <p>• Subject to Sangamner Rules</p>
                                <p>• Heritage Product Policy</p>
                                <p>• Non-Transferable Balance</p>
                            </div>
                        </div>
                        <div className="col-span-4 text-right">
                            <div className="mb-4 h-16 w-full border-b-2 border-dashed border-[#D4AF37] opacity-40 flex items-center justify-center">
                                <Shield className="w-8 h-8 text-[#D4AF37] opacity-20" />
                            </div>
                            <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Authorized</p>
                            <p className="text-[9px] text-[#D4AF37] font-black mt-1 uppercase tracking-tighter">NIJAM GOLD WORKS ORIGIN</p>
                        </div>
                    </div>
                </>
            )}

            {/* In Shipping Mode, add Security Detail */}
            {isShipping && (
                <div className="absolute bottom-6 right-6 flex items-center gap-4">
                    <div className="h-10 w-24 bg-slate-50 border border-slate-200 flex items-center justify-center font-mono text-[10px] font-black text-slate-400">
                        VERIFIED
                    </div>
                    <Shield className="w-12 h-12 text-[#D4AF37] opacity-10" />
                </div>
            )}

            {/* Branding Watermark - Premium Large */}
            {!isShipping && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-12 select-none font-black text-[12rem] text-slate-900 tracking-tight">
                    AURERXA
                </div>
            )}
        </div>
    )
}
