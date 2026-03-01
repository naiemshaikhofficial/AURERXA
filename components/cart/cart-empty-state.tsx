'use client'

import React from 'react'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CartEmptyStateProps {
    closeCart: () => void
}

export function CartEmptyState({ closeCart }: CartEmptyStateProps) {
    return (
        <div className="h-[50vh] flex flex-col items-center justify-center space-y-6 opacity-60 px-6 text-center">
            <div className="p-4 bg-muted rounded-full">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
                <p className="font-serif text-xl italic text-foreground mb-2">Your collection is empty</p>
                <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Start filling it with timeless pieces crafted just for you.</p>
            </div>
            <Button variant="outline" onClick={closeCart} className="uppercase tracking-widest text-xs border-primary/20 hover:border-primary text-primary transition-colors">
                Start Exploring
            </Button>
        </div>
    )
}
