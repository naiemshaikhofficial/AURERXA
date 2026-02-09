'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, RefreshCcw, Truck, Award } from 'lucide-react'

const trustItems = [
    {
        icon: Award,
        title: '100% Purity',
        description: 'BIS Hallmarked Gold'
    },
    {
        icon: RefreshCcw,
        title: 'Easy Returns',
        description: '7-Day Return Policy'
    },
    {
        icon: ShieldCheck,
        title: 'Safe Shipping',
        description: 'Fully Insured Delivery'
    },
    {
        icon: Truck,
        title: 'Free Shipping',
        description: 'On all orders above ₹5000'
    }
]

export function TrustBar() {
    return (
        <section className="py-20 bg-background border-y border-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                    {trustItems.map((item, idx) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex flex-col items-center text-center space-y-4 group"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <item.icon className="w-8 h-8 md:w-10 md:h-10 text-primary/70 group-hover:text-primary transition-colors duration-500" strokeWidth={1} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-foreground font-serif text-lg md:text-xl italic tracking-tight uppercase group-hover:text-primary/80 transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-widest font-bold">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
