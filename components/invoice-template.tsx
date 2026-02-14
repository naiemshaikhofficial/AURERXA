'use client'

import React from 'react'
import { Phone, MapPin, Globe, Shield, Scale, Hash, BadgeCheck, FileCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InvoiceProps {
    order: any
    type: 'customer' | 'shipping'
}

// Utility to convert number to words of Indian Currency
function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    function convert(n: number): string {
        if (n < 20) return ones[n]
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '')
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '')
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '')
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '')
    }

    if (num === 0) return 'Zero'
    return convert(Math.floor(num)) + ' Rupees Only'
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

    // Business Details (Industry Standard Placeholder for Gold Trader)
    const sellerDetails = {
        name: "NIJAM GOLD WORKS (AURERXA)",
        address: "Captain Lakshmi Chowk, Rangargalli, Sangamner, MS 422605",
        gstin: "27XXXXX0000X1Z5", // Placeholder GSTIN
        mobile: "+91 7776818394",
        bis_license: "CM/L-0000000", // BIS Hallmarking License Placeholder
        pan: "ABCDE0000F"
    }

    // Jewelry Specific Calculations
    const items = order.order_items?.map((item: any) => {
        const product = item.products?.[0] || item.products || {}
        const totalItemPrice = item.price * item.quantity

        const goldPercentage = 0.90
        const goldValue = totalItemPrice * goldPercentage
        const makingCharges = totalItemPrice * (1 - goldPercentage)

        const goldTax = goldValue * 0.03
        const makingTax = makingCharges * 0.05

        return {
            ...item,
            hsn: "7113",
            purity: product.purity || "22K",
            weight: product.weight_grams || 0,
            goldValue,
            makingCharges,
            goldTax,
            makingTax,
            totalTax: goldTax + makingTax,
            finalItemTotal: totalItemPrice + goldTax + makingTax
        }
    }) || []

    const totalGoldTax = items.reduce((acc: number, item: any) => acc + item.goldTax, 0)
    const totalMakingTax = items.reduce((acc: number, item: any) => acc + item.makingTax, 0)
    const gstTotal = totalGoldTax + totalMakingTax
    const grandTotal = order.total + gstTotal

    return (
        <div
            className={cn(
                "bg-white text-slate-900 mx-auto font-sans relative",
                isShipping
                    ? "p-6 w-[600px] h-[400px] border-[12px] border-slate-900 overflow-hidden shadow-2xl"
                    : "p-6 max-w-[800px] border-[1px] border-slate-100 min-h-[1000px] flex flex-col"
            )}
            id="printable-invoice"
        >
            {/* Logo and Header Details - Compacted */}
            <div className={cn("flex justify-between items-start mb-4 pb-4 border-b-2 border-slate-50")}>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className={cn("object-contain", isShipping ? "h-10" : "h-14")}
                        />
                        {!isShipping && (
                            <div className="border-l border-[#D4AF37] pl-3">
                                <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">AURERXA</h1>
                                <p className="text-[8px] uppercase tracking-[0.2em] text-[#D4AF37] font-black mt-0.5">Heritage Craftsmanship</p>
                            </div>
                        )}
                    </div>

                    {!isShipping && (
                        <div className="text-[9px] text-slate-500 space-y-0 mt-1">
                            <p className="font-bold text-slate-900 leading-tight">{sellerDetails.name}</p>
                            <p className="max-w-[200px] leading-tight">{sellerDetails.address}</p>
                            <p className="font-bold text-slate-600">
                                Ph: {sellerDetails.mobile} • <span className="text-slate-400">GSTIN:</span> {sellerDetails.gstin}
                            </p>
                        </div>
                    )}
                </div>

                <div className="text-right">
                    <div className="bg-slate-900 text-white px-2 py-1 rounded-sm inline-block mb-1">
                        <h2 className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {isShipping ? 'LOGISTICS UNIT' : 'TAX INVOICE'}
                        </h2>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 font-mono uppercase">REF: <span className="text-slate-900 font-black">#{order.order_number}</span></p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{formatDate(order.created_at)}</p>
                    {!isShipping && <p className="text-[8px] text-[#D4AF37] font-bold">BIS: {sellerDetails.bis_license}</p>}
                </div>
            </div>

            {isShipping ? (
                /* REDACTED LANDSCAPE SHIPPING (Stealth Mode) */
                <div className="grid grid-cols-12 gap-6 items-stretch pt-2">
                    <div className="col-span-7 border-[4px] border-slate-900 p-6 rounded-none relative flex flex-col justify-center">
                        <div className="absolute -top-3 left-4 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase">CONSIGNEE</div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-slate-900 leading-none mb-2">
                                {order.shipping_address?.full_name}
                            </p>
                            <p className="text-base font-bold text-slate-700 leading-tight">
                                {order.shipping_address?.street_address}
                            </p>
                            <p className="text-lg font-black text-slate-900 uppercase mt-2">
                                {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                            </p>
                            <div className="pt-4 border-t border-slate-100 mt-2">
                                <p className="text-xl font-black flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-slate-400" /> {order.shipping_address?.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-5 flex flex-col gap-4">
                        <div className="bg-slate-50 p-4 border border-slate-200">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Return Center</p>
                            <p className="text-[11px] font-bold text-slate-700 leading-tight">AURERXA OFFICIAL, Sangamner, MS</p>
                            <p className="text-[10px] text-slate-400">P: 7776818394</p>
                        </div>
                        <div className={cn(
                            "flex-grow flex flex-col items-center justify-center p-4 border-b-8",
                            order.payment_method === 'cod' ? "bg-slate-900 border-[#D4AF37] text-white" : "bg-white border-slate-900 text-slate-900"
                        )}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">MODE</p>
                            <p className="text-2xl font-black">{order.payment_method === 'cod' ? 'C O D' : 'PREPAID'}</p>
                            {order.payment_method === 'cod' && <p className="text-xl font-black text-[#D4AF37] mt-1">{formatCurrency(grandTotal)}</p>}
                        </div>
                    </div>
                </div>
            ) : (
                /* COMPACT COMPLIANCE GOLD TAX INVOICE */
                <div className="flex-grow flex flex-col">
                    {/* Biller / Client Split - Compact */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 p-3 rounded border border-slate-100">
                            <h3 className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1 border-b border-slate-200">Customer</h3>
                            <div className="text-[10px] space-y-0.5">
                                <p className="font-black text-slate-900">{order.shipping_address?.full_name}</p>
                                <p className="text-slate-600 leading-tight line-clamp-2">{order.shipping_address?.street_address}</p>
                                <p className="font-bold text-slate-800">{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
                                <p className="font-black">ph: {order.shipping_address?.phone}</p>
                            </div>
                        </div>
                        <div className="p-3 border border-slate-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1 border-b border-slate-200">Legal</h3>
                                <div className="text-[9px] space-y-0.5 font-bold">
                                    <div className="flex justify-between"><span className="text-slate-400">GSTIN:</span> <span>{order.shipping_address?.gstin || "CONSUMER"}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">PAYMENT:</span> <span className="uppercase">{order.payment_method}</span></div>
                                </div>
                            </div>
                            <p className="text-[8px] font-black text-[#D4AF37] italic uppercase flex items-center gap-1 mt-1">
                                <BadgeCheck className="w-2 h-2" /> 916 BIS Verified
                            </p>
                        </div>
                    </div>

                    {/* Highly Granular Gold Table - Compact Row heights */}
                    <div className="mb-4">
                        <table className="w-full text-left border-collapse border border-slate-200">
                            <thead>
                                <tr className="bg-slate-900 text-white text-[8px] uppercase tracking-wider font-black">
                                    <th className="p-1.5 border border-slate-800">S.No</th>
                                    <th className="p-1.5 border border-slate-800">Item & HSN</th>
                                    <th className="p-1.5 border border-slate-800 text-center">Wt(g)</th>
                                    <th className="p-1.5 border border-slate-800 text-center">Purity</th>
                                    <th className="p-1.5 border border-slate-800">Taxable Value</th>
                                    <th className="p-1.5 border border-slate-800 text-right">Taxes</th>
                                    <th className="p-1.5 border border-slate-800 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-[9px]">
                                {items.map((item: any, idx: number) => (
                                    <tr key={item.id} className="border-b border-slate-100">
                                        <td className="p-1.5 text-center text-slate-400 font-bold border-x border-slate-50">{idx + 1}</td>
                                        <td className="p-1.5 border-r border-slate-50">
                                            <p className="font-black text-slate-900 leading-tight">{item.product_name}</p>
                                            <p className="text-[7px] text-slate-400 font-mono italic">HSN: {item.hsn}</p>
                                        </td>
                                        <td className="p-1.5 border-r border-slate-50 font-black text-center text-slate-700">
                                            {item.weight.toFixed(3)}
                                        </td>
                                        <td className="p-1.5 border-r border-slate-50 font-black text-center text-[#D4AF37]">
                                            {item.purity}
                                        </td>
                                        <td className="p-1.5 border-r border-slate-50 leading-tight">
                                            <p className="font-medium">{formatCurrency(item.goldValue)}</p>
                                            <p className="text-[7px] text-slate-400">Making: {formatCurrency(item.makingCharges)}</p>
                                        </td>
                                        <td className="p-1.5 border-r border-slate-50 text-right font-bold text-slate-500 leading-tight">
                                            {formatCurrency(item.goldTax + item.makingTax)}
                                        </td>
                                        <td className="p-1.5 font-black text-right text-slate-900 bg-slate-50/20">
                                            {formatCurrency(item.finalItemTotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tax Breakdown and Total - More compact */}
                    <div className="grid grid-cols-12 gap-4 pt-2 border-t border-slate-100 mt-auto">
                        <div className="col-span-12">
                            <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <h4 className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Amount in Words</h4>
                                    <p className="text-[10px] font-black text-slate-900 italic">{numberToWords(grandTotal)}</p>
                                </div>
                                <div className="text-[8px] font-bold text-slate-500 text-right border-l pl-4 border-slate-200">
                                    <p>CGST/SGST (1.5% ea on Gold): {formatCurrency(totalGoldTax)}</p>
                                    <p>CGST/SGST (2.5% ea on Mk): {formatCurrency(totalMakingTax)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 flex justify-end gap-10 items-end mt-4">
                            <div className="flex gap-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="flex flex-col items-end">
                                    <span>SUBTOTAL</span>
                                    <span className="text-slate-900">{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span>TAX TOTAL</span>
                                    <span className="text-slate-900">{formatCurrency(gstTotal)}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span>SHIPPING</span>
                                    <span className="text-emerald-600">FREE</span>
                                </div>
                            </div>
                            <div className="border-l-2 border-slate-900 pl-6 h-12 flex flex-col justify-center">
                                <span className="text-[9px] font-black text-slate-900 uppercase">AMOUNT PAYABLE</span>
                                <span className="text-2xl font-black text-slate-900 leading-none underline decoration-[#D4AF37] decoration-2 underline-offset-4">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Fine Print / Footer - Compacted */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 items-end">
                        <div className="col-span-2 space-y-2">
                            <div className="text-[7px] font-bold text-slate-400 uppercase leading-tight max-w-sm">
                                <p className="text-slate-900 font-bold">Terms:</p>
                                <p>1. 22K/18K Gold Purity Verified. 2. No returns on customized items. 3. Subject to Sangamner jurisdiction.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[7px] font-black">
                                    <Shield className="w-2 h-2" /> SECURE TRANSIT
                                </div>
                                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[7px] font-black">
                                    <BadgeCheck className="w-2 h-2" /> 100% HALLMARKED
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="h-8 border-b border-dashed border-slate-300 mb-1 relative">
                                <span className="absolute bottom-0 right-0 text-[7px] text-slate-300 italic">Auth Sign</span>
                            </div>
                            <p className="text-[9px] font-black text-slate-900 uppercase leading-none">NIJAM GOLD WORKS</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Branding Watermark - Less Intrusive */}
            {!isShipping && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] pointer-events-none rotate-12 select-none font-black text-[10rem] text-slate-900 tracking-tight">
                    AURERXA
                </div>
            )}
        </div>
    )
}
