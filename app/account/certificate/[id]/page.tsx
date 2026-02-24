'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DigitalCertificate } from '@/components/account/digital-certificate'
import { Button } from '@/components/ui/button'
import { Download, Share2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CertificatePage() {
    const { id } = useParams()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            // In a real app, you would fetch the specific order details
            // For this demo, we'll simulate fetching or use the ID to generate a mock certificate
            // if the DB fetch fails (since I don't have your full DB schema popuplated with orders yet)

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*, products(*))')
                    .eq('id', id)
                    .single()

                if (data) {
                    setOrder(data)
                } else {
                    // Fallback for demo purposes if order not found in DB
                    setOrder({
                        id: id as string,
                        created_at: new Date().toISOString(),
                        full_name: "Valued Customer",
                        order_items: [
                            {
                                products: {
                                    name: "Signature Diamond Eternity Ring",
                                    sku: "AUR-RIN-dia-001"
                                }
                            }
                        ]
                    })
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchOrder()
    }, [id])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Certificate...</div>
    }

    if (!order) {
        return <div className="min-h-screen flex items-center justify-center">Certificate not found.</div>
    }

    // Assuming we show the certificate for the first item in the order for simplicity
    // Ideally, you'd list certificates for each item.
    const product = order.order_items?.[0]?.products || { name: 'Custom Jewelry Piece', sku: 'AUR-CUST-001' }

    return (
        <div className="min-h-screen bg-[#1a1a1a] py-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
                <Link href="/account/orders" className="text-white/60 hover:text-white flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </Link>
                <div className="flex gap-4">
                    <Button variant="outline" className="gap-2 bg-transparent text-white border-white/20 hover:bg-white/10 hidden md:flex">
                        <Share2 className="w-4 h-4" /> Share
                    </Button>
                    <Button className="gap-2 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-semibold">
                        <Download className="w-4 h-4" /> Download PDF
                    </Button>
                </div>
            </div>

            <DigitalCertificate
                orderId={order.id}
                productName={product.name}
                purchaseDate={order.created_at}
                sku={product.sku || 'AUR-GEN-001'}
                customerName={order.full_name || 'Valued Customer'}
            />

            <p className="text-center text-white/30 text-xs mt-12 max-w-2xl mx-auto">
                This is a digital representation of your authenticity certificate. The physical certificate was included in your delivery.
                For insurance purposes, please download the PDF version.
            </p>
        </div>
    )
}
