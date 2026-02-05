'use client'

import { Navbar } from '@/components/navbar'
import { CustomOrderForm } from '@/components/custom-order-form'

export default function CustomJewelryPage() {
    return (
        <div className="min-h-screen bg-background pb-24">
            <Navbar />
            <div className="pt-24 md:pt-32">
                <div className="px-6 mb-8 mt-4">
                    <p className="text-amber-500/80 text-[10px] uppercase mb-4 font-premium-sans">
                        Bespoke Creation
                    </p>
                    <h1 className="text-4xl font-serif font-light text-white tracking-widest italic mb-4">
                        Custom <span className="text-amber-500">Design</span>
                    </h1>
                    <p className="text-sm text-white/50 font-light leading-relaxed">
                        Bring your unique vision to life. Our artisans are ready to forge your masterpiece.
                    </p>
                </div>
                <CustomOrderForm />
            </div>
        </div>
    )
}
