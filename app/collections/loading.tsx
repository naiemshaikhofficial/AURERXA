import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4 opacity-50">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-[10px] font-premium-sans tracking-[0.3em] uppercase">Loading Collection...</span>
        </div>
      </main>
    </div>
  )
}
