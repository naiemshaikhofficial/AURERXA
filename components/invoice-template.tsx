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
    const isGSTEnabled = false // Suppressed per user request

    // Business Details
    const sellerDetails = {
        name: "NIJAM GOLD WORKS (AURERXA)",
        address: "Captain Lakshmi Chowk, Rangargalli, Sangamner, MS 422605",
        gstin: order.shipping_address?.gstin || "Unregistered Consumer",
        mobile: "+91 7776818394",
        // bis_license: "CM/L-8200096511",
        pan: "ABCDE0000F",
        bank_name: "HDFC BANK LTD",
        acc_no: "502000XXXXXXXX",
        ifsc: "HDFC0001234",
        instagram: "@aurerxa_official",
        website: "www.aurerxa.com"
    }

    // Calculation Engine
    const items = order.order_items?.map((item: any) => {
        const product = item.products?.[0] || item.products || {}
        const totalItemPrice = (item.price || 0) * (item.quantity || 1)

        const purity = product.purity || "925 Silver"
        const purityLower = purity.toLowerCase()
        const nameLower = (product.name || '').toLowerCase()
        const categoryLower = (product.categories?.name || '').toLowerCase()

        let material = 'Gold'
        let hsn = '7113'
        let unit = 'g'

        if (purityLower.includes('silver') || nameLower.includes('silver') || categoryLower.includes('silver')) {
            material = 'Silver'
            hsn = '7113'
        } else if (purityLower.includes('diamond') || nameLower.includes('diamond') || categoryLower.includes('diamond')) {
            material = 'Diamond'
            hsn = '7117'
            unit = 'ct'
        } else if (purityLower.includes('platinum') || nameLower.includes('platinum') || categoryLower.includes('platinum')) {
            material = 'Platinum'
            hsn = '7113'
        }

        // Back-calculate 3% GST from inclusive price
        const taxRate = 0.03
        const taxableValue = totalItemPrice / (1 + taxRate)
        const totalTax = totalItemPrice - taxableValue

        return {
            ...item,
            hsn,
            material,
            unit,
            purity,
            huid: product.huid || (material === 'Gold' ? "HUID-T123" : null),
            weight: product.weight_grams || 0,
            taxableValue,
            totalTax,
            finalItemTotal: totalItemPrice
        }
    }) || []

    const shippingCharge = order.delivery_fee || order.shipping_cost || 0
    const subtotal = items.reduce((acc: number, item: any) => acc + item.finalItemTotal, 0)
    const gstTotal = items.reduce((acc: number, item: any) => acc + item.totalTax, 0)
    const grandTotal = subtotal + shippingCharge

    // Hallmarks
    const materialsInOrder = Array.from(new Set(items.map((i: any) => i.material)))
    const hasGold = materialsInOrder.includes('Gold')
    const hasSilver = materialsInOrder.includes('Silver')
    const hasDiamond = materialsInOrder.includes('Diamond')

    return (
        <div
            className={cn(
                "bg-white text-slate-900 mx-auto font-sans relative",
                isShipping
                    ? "p-2 w-[100mm] h-[100mm] border-[6px] border-slate-900 overflow-hidden shadow-2xl flex flex-col box-border"
                    : "p-8 max-w-[800px] border border-slate-100 min-h-[1056px] flex flex-col"
            )}
            id="printable-invoice"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-slate-50">
                <div className="flex gap-4 items-center">
                    <img src="/logo.png" alt="Logo" className={cn("object-contain", isShipping ? "h-10" : "h-16")} />
                    <div>
                        <h1 className={cn("font-black tracking-tighter leading-none", isShipping ? "text-xl" : "text-3xl")}>{sellerDetails.name}</h1>
                        <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mt-1">Heritage Craftsmanship & Hallmarked Jewelry</p>
                    </div>
                </div>
                {!isShipping && (
                    <div className="text-right">
                        <div className="bg-slate-900 text-white px-3 py-1 inline-block rounded mb-2">
                            <h2 className="text-xs font-black uppercase tracking-widest leading-none">Tax Invoice</h2>
                        </div>
                        <p className="text-xs font-black text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[10px] font-bold text-slate-400">{formatDate(order.created_at)}</p>
                    </div>
                )}
            </div>

            {isShipping ? (
                /* SHIPPING LABEL */
                <div className="flex flex-col gap-2 flex-grow overflow-hidden">
                    <div className="border-[3px] border-slate-900 p-3 flex-grow min-h-0 flex flex-col justify-center relative bg-white">
                        <span className="absolute top-0 left-0 bg-slate-900 text-white text-[7px] font-black px-2 py-0.5 uppercase">Consignee</span>
                        <div className="space-y-1">
                            <p className="text-lg font-black leading-none">{order.shipping_address?.full_name}</p>
                            <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-3">{order.shipping_address?.street_address}</p>
                            <p className="text-base font-black uppercase">
                                {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                            </p>
                            <p className="text-base font-black bg-slate-100 px-1 inline-block mt-1">PH: {order.shipping_address?.phone}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 h-[120px]">
                        <div className="bg-slate-50 p-2 border border-slate-200 flex flex-col justify-center">
                            <p className="text-[7px] font-black text-slate-400 uppercase">Return Address:</p>
                            <p className="text-[10px] font-bold text-slate-800 leading-tight mt-1">{sellerDetails.address}</p>
                            <p className="text-[9px] font-black mt-1">{sellerDetails.mobile}</p>
                        </div>
                        <div className={cn(
                            "flex flex-col items-center justify-center border-b-4",
                            order.payment_method === 'cod' ? "bg-slate-900 border-[#D4AF37] text-white" : "bg-white border-slate-900 text-slate-900"
                        )}>
                            <p className="text-[8px] font-black opacity-60 uppercase">Mode</p>
                            <p className="text-xl font-black">{order.payment_method === 'cod' ? 'C O D' : 'PREPAID'}</p>
                            {order.payment_method === 'cod' && (
                                <p className="text-lg font-black text-[#D4AF37] border-t border-[#D4AF37]/30 mt-1 pt-1">{formatCurrency(grandTotal)}</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* FULL INVOICE */
                <div className="flex-grow flex flex-col">
                    <div className="grid grid-cols-2 gap-6 mb-8 text-[11px]">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Billed To</h3>
                            <div className="space-y-1">
                                <p className="text-lg font-black text-slate-900 leading-none">{order.shipping_address?.full_name}</p>
                                <p className="text-slate-600 leading-tight">{order.shipping_address?.street_address}</p>
                                <p className="font-black">{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
                                <p className="text-slate-900 font-bold mt-2">Mobile: {order.shipping_address?.phone}</p>
                            </div>
                        </div>
                        <div className="p-4 border border-slate-100 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Seller Details</h3>
                                <div className="flex justify-between font-bold"><span className="text-slate-400">GSTIN:</span> <span>{sellerDetails.gstin}</span></div>
                                <div className="flex justify-between font-bold uppercase"><span className="text-slate-400">PAN:</span> <span>{sellerDetails.pan}</span></div>
                                <div className="flex justify-between font-bold text-emerald-600 uppercase"><span className="text-slate-400">STATUS:</span> <span>{order.payment_method}</span></div>
                                {order.payment_id && (
                                    <div className="flex justify-between font-bold text-slate-800 uppercase mt-1 pt-1 border-t border-slate-100">
                                        <span className="text-slate-400">Txn ID:</span>
                                        <span className="text-[9px]">{order.payment_id}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 font-black px-2 py-1 rounded text-[10px] uppercase">
                                    <BadgeCheck className="w-3 h-3" />
                                    {hasDiamond ? "IGI Certified" : hasGold ? "HUID Hallmarked" : "925 Verified"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <table className="w-full text-[11px] text-left">
                            <thead className="bg-slate-900 text-white font-black uppercase text-[10px]">
                                <tr>
                                    <th className="p-3 w-10 text-center">#</th>
                                    <th className="p-3">Description of Goods</th>
                                    <th className="p-3 text-center w-24">Gross Wt</th>
                                    <th className="p-3 text-center w-20">Purity</th>
                                    <th className="p-3 text-right w-28">Taxable Val</th>
                                    <th className="p-3 text-right w-16">GST</th>
                                    <th className="p-3 text-right w-28">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item: any, idx: number) => (
                                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                        <td className="p-3">
                                            <p className="font-black text-slate-900">{item.product_name}</p>
                                            <div className="flex gap-3 text-[8px] font-bold text-slate-400 mt-1 uppercase">
                                                <span>HSN: {item.hsn}</span>
                                                {item.huid && <span className="text-[#D4AF37]">HUID: {item.huid}</span>}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <p className="font-black text-slate-900">{item.weight > 0 ? `${item.weight.toFixed(3)}${item.unit}` : '-'}</p>
                                        </td>
                                        <td className="p-3 text-center font-black text-[#D4AF37]">{item.purity}</td>
                                        <td className="p-3 text-right font-bold text-slate-700">
                                            {formatCurrency(isGSTEnabled ? item.taxableValue : item.finalItemTotal)}
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-300">
                                            {isGSTEnabled ? formatCurrency(item.totalTax) : "N/A"}
                                        </td>
                                        <td className="p-3 text-right font-black text-slate-900 bg-slate-50/20">
                                            {formatCurrency(item.finalItemTotal)}
                                        </td>
                                    </tr>
                                ))}
                                {/* Fill height */}
                                {[...Array(Math.max(0, 5 - items.length))].map((_, i) => (
                                    <tr key={`f-${i}`} className="h-10 border-b border-slate-50"><td colSpan={7}></td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-12 gap-8 mt-auto pt-6 border-t-2 border-slate-900">
                        <div className="col-span-12 mb-4">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total in Words</p>
                                <p className="text-xs font-black text-slate-900 italic">{numberToWords(grandTotal)}</p>
                            </div>
                        </div>

                        <div className="col-span-7 flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest">Bank Details (NEFT)</h4>
                                    <div className="text-[10px] font-bold text-slate-600 space-y-0.5 uppercase">
                                        <p>{sellerDetails.bank_name}</p>
                                        <p>A/C: {sellerDetails.acc_no}</p>
                                        <p>IFSC: {sellerDetails.ifsc}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Returns Policy</h4>
                                    <div className="text-[9px] font-bold text-slate-500 leading-tight uppercase italic">
                                        <p>• 7 Day exchange policy</p>
                                        <p>• Tag must be intact</p>
                                        <p>• Buyback at market rates</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-5 flex flex-col items-end gap-6">
                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                {isGSTEnabled && (
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                                        <span>GST (3%)</span>
                                        <span className="text-slate-900">{formatCurrency(gstTotal)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                                    <span>Shipping</span>
                                    <span className={cn(shippingCharge > 0 ? "text-slate-900" : "text-emerald-600 font-black")}>
                                        {shippingCharge > 0 ? formatCurrency(shippingCharge) : "FREE"}
                                    </span>
                                </div>
                                <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline mt-2">
                                    <span className="text-sm font-black text-slate-900 uppercase">Total Payable</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <div className="w-14 h-14 bg-white p-1 border border-slate-200 rounded-lg">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://aurerxa.com/v/${order.id}`} className="w-full grayscale opacity-60" alt="QR" />
                                </div>
                                <div className="text-[8px] font-black tracking-widest uppercase text-slate-400 leading-tight">
                                    <p className="text-slate-900">Scan to Verify</p>
                                    <p>Authenticity &</p>
                                    <p>HUID Certificate</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-between items-end border-t border-slate-50 pt-6">
                        <div className="flex gap-6">
                            <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                                <Globe className="w-4 h-4" /> {sellerDetails.website}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                                <Phone className="w-4 h-4" /> {sellerDetails.instagram}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="h-12 border-b border-dashed border-slate-200 mb-2 w-48 ml-auto"></div>
                            <p className="text-xs font-black text-slate-900 uppercase">For {sellerDetails.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Authorized Signatory</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Watermark */}
            {!isShipping && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.012] pointer-events-none rotate-12 select-none font-black text-[15rem] leading-none text-slate-900 tracking-tighter">
                    AURERXA
                </div>
            )}
        </div>
    )
}
