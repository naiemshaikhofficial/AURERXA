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
                "bg-white text-black mx-auto font-sans relative",
                isShipping ? "p-6 w-[600px] h-[400px] border-2 border-dashed border-slate-300 overflow-hidden" : "p-8 max-w-[800px]"
            )}
            id="printable-invoice"
        >
            {/* Header section */}
            <div className={cn("flex justify-between items-start", isShipping ? "mb-4" : "border-b-2 border-slate-100 pb-8 mb-8")}>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className={cn("object-contain", isShipping ? "h-12" : "h-16")}
                        />
                        {!isShipping && (
                            <div className="border-l-2 border-slate-100 pl-3">
                                <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">AURERXA</h1>
                                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mt-1">Heritage Craftsmanship</p>
                            </div>
                        )}
                    </div>

                    {!isShipping && (
                        <div className="mt-4 text-[10px] text-slate-500 space-y-0.5">
                            <p className="font-bold text-slate-900">NIJAM GOLD WORKS</p>
                            <p>Captain Lakshmi Chowk, Rangargalli</p>
                            <p>Sangamner, Maharashtra 422605</p>
                            <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> +91 7776818394</p>
                        </div>
                    )}
                </div>

                <div className="text-right">
                    <h2 className={cn("font-bold uppercase tracking-tight text-slate-900 border-b-2 border-slate-900 inline-block", isShipping ? "text-xl pb-1" : "text-2xl pb-2")}>
                        {isShipping ? 'LOGISTICS LABEL' : 'TAX INVOICE'}
                    </h2>
                    <p className="text-[11px] text-slate-400 font-mono mt-2 font-bold uppercase">ORDER: <span className="text-slate-900">#{order.order_number}</span></p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{formatDate(order.created_at)}</p>
                </div>
            </div>

            {/* Main Content Area */}
            {isShipping ? (
                /* Landscape Shipping Layout */
                <div className="grid grid-cols-12 gap-6 items-start">
                    {/* Left side: Ship To */}
                    <div className="col-span-7 bg-slate-50 border-2 border-slate-900 p-4 rounded-xl h-full min-h-[200px] flex flex-col justify-center">
                        <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-3">DESTINATION</h3>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-slate-900 leading-none mb-2">
                                {order.shipping_address?.full_name || order.shipping_address?.name}
                            </p>
                            <p className="text-base font-bold text-slate-700 leading-tight">
                                {order.shipping_address?.street_address || order.shipping_address?.address}
                            </p>
                            <p className="text-base font-black text-slate-900 uppercase tracking-tighter">
                                {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                            </p>
                            <div className="pt-3 border-t border-slate-200 mt-2">
                                {order.shipping_address?.phone && (
                                    <p className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        <Phone className="w-5 h-5" /> {order.shipping_address.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right side: Security & Shipping Info */}
                    <div className="col-span-5 space-y-4">
                        <div className="bg-white border-2 border-slate-100 p-4 rounded-xl">
                            <h3 className="text-[9px] uppercase font-bold text-slate-400 mb-2 tracking-widest border-b border-slate-100 pb-1">Return To</h3>
                            <div className="text-[11px] font-bold text-slate-600 leading-tight space-y-0.5">
                                <p className="text-slate-900 font-black">AURERXA OFFICIAL</p>
                                <p>C.L. Chowk, Rangargalli</p>
                                <p>Sangamner, MS 422605</p>
                                <p className="text-slate-400">P: 7776818394</p>
                            </div>
                        </div>

                        <div className={cn(
                            "p-4 rounded-xl border-4 text-center",
                            order.payment_method === 'cod' ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-emerald-500 text-emerald-600"
                        )}>
                            <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">MODE</p>
                            <p className="text-2xl font-black uppercase tracking-tight mt-1 leading-none">
                                {order.payment_method === 'cod' ? 'C O D' : 'PREPAID'}
                            </p>
                            {order.payment_method === 'cod' && (
                                <div className="mt-3 py-1.5 px-3 bg-white/10 rounded-lg">
                                    <p className="text-xl font-black text-[#D4AF37]">
                                        {formatCurrency(order.total)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Standard Portrait Invoice Layout */
                <>
                    {/* Billing/Shipping Info */}
                    <div className="grid grid-cols-2 gap-12 mb-10">
                        <div>
                            <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 px-1 border-l-2 border-[#D4AF37]">Ship To</h3>
                            <div className="space-y-1">
                                <p className="text-lg font-black text-slate-900 leading-tight">
                                    {order.shipping_address?.full_name || order.shipping_address?.name}
                                </p>
                                <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                    {order.shipping_address?.street_address || order.shipping_address?.address}
                                </p>
                                <p className="text-sm font-black text-slate-900 uppercase">
                                    {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                                </p>
                                <div className="pt-2 flex flex-col gap-1 text-xs">
                                    {order.shipping_address?.phone && (
                                        <p className="font-black text-slate-900 flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-slate-400" /> +91 {order.shipping_address.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 px-1 border-l-2 border-slate-200">Customer Details</h3>
                            <div className="space-y-1 text-sm">
                                {order.user?.email && <p className="font-bold text-slate-600">{order.user.email}</p>}
                                <p className="font-semibold text-slate-600">User ID: <span className="text-slate-900 font-mono">#{order.user_id?.slice(0, 8)}</span></p>
                                <div className="pt-4">
                                    <p className="text-[10px] uppercase text-slate-400 font-bold">Transaction Info</p>
                                    <p className="text-xs font-black text-slate-700 mt-1 uppercase">
                                        {order.payment_method} / {order.payment_id || 'INTERNAL_TRANS'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-10">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-900 text-[11px] uppercase font-black text-slate-900">
                                    <th className="text-left py-4">S.No</th>
                                    <th className="text-left py-4">Description</th>
                                    <th className="text-center py-4">Qty</th>
                                    <th className="text-right py-4">Price</th>
                                    <th className="text-right py-4">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.order_items?.map((item: any, idx: number) => (
                                    <tr key={item.id} className="text-sm font-medium">
                                        <td className="py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                                        <td className="py-4">
                                            <p className="font-black text-slate-900">{item.product_name}</p>
                                            <p className="text-[10px] text-slate-400 italic">Item Ref: {item.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="py-4 text-center font-black text-slate-900">{item.quantity}</td>
                                        <td className="py-4 text-right text-slate-600">{formatCurrency(item.price)}</td>
                                        <td className="py-4 text-right font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Area */}
                    <div className="flex justify-end pt-4 border-t border-slate-100 mb-10">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-slate-900">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Shipping Fees</span>
                                <span className="text-slate-900">{order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}</span>
                            </div>
                            {order.coupon_discount > 0 && (
                                <div className="flex justify-between text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                                    <span>Discount</span>
                                    <span>- {formatCurrency(order.coupon_discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-4 border-t-2 border-slate-900 items-baseline">
                                <span className="text-sm uppercase font-black text-slate-900">Total Amount</span>
                                <span className="text-2xl font-black text-slate-900 leading-none">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Legal */}
                    <div className="mt-16 pt-8 border-t border-slate-100 grid grid-cols-2 gap-8 items-end">
                        <div className="text-[9px] text-slate-400 leading-relaxed font-black uppercase tracking-wider">
                            <p className="text-slate-500 mb-1 font-black">Authorized Document</p>
                            <p>1. Computer generated billing status.</p>
                            <p>2. Subject to Sangamner Jurisdiction.</p>
                            <p>3. Taxable as per Indian Commerce Rules.</p>
                            <p>4. Nijam Gold Works - Sangamner 422605.</p>
                        </div>
                        <div className="text-right">
                            <div className="h-12 w-32 border-b-2 border-[#D4AF37]/30 ml-auto mb-2" />
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Digital Signatory</p>
                            <p className="text-[8px] text-[#D4AF37] font-black mt-1 uppercase tracking-tighter">NIJAM GOLD WORKS OFFICIAL</p>
                        </div>
                    </div>
                </>
            )}

            {/* In Shipping Mode, add barcode area */}
            {isShipping && (
                <div className="mt-auto pt-4 border-t-2 border-slate-900 flex justify-between items-center text-slate-900">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">SECURE SHIPMENT</p>
                        <p className="text-[8px] font-bold text-slate-400">Handle with care • Verified for transit</p>
                    </div>
                    <div className="h-10 w-40 bg-slate-100 flex items-center justify-center border border-slate-200">
                        <span className="text-[8px] font-mono tracking-[0.5em] text-slate-400">#{order.order_number}</span>
                    </div>
                </div>
            )}

            {/* Branding Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-45 select-none font-black text-8xl text-slate-900">
                AURERXA
            </div>
        </div>
    )
}
