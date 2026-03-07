import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Sparkles, Trophy } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-background relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative mb-12 animate-in fade-in zoom-in duration-1000">
                <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
                <div className="relative bg-background border border-border/50 p-8 rounded-full">
                    <ShoppingBag className="w-16 h-16 text-primary/40" />
                </div>
            </div>

            <div className="max-w-2xl mx-auto relative z-10 space-y-8">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-serif text-foreground/90 italic tracking-tight leading-none">
                        Elegance Lost
                    </h1>
                    <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] md:text-xs max-w-md mx-auto leading-relaxed opacity-60">
                        The masterpiece you seek has either found its owner or remains hidden in our private archive.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link href="/collections">
                        <button className="group flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-foreground hover:text-background transition-all duration-500 shadow-xl shadow-primary/10">
                            Discover Collections
                        </button>
                    </Link>
                    <Link href="/">
                        <button className="group flex items-center gap-3 px-10 py-5 border border-border text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-muted transition-all duration-500">
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            Return Home
                        </button>
                    </Link>
                </div>

                {/* Helpful Links for Retention */}
                <div className="pt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <Link href="/collections?tag=bestseller" className="group p-6 bg-card/30 border border-border hover:border-primary/30 transition-all duration-500 text-left">
                        <Trophy className="w-5 h-5 text-amber-500/50 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">Bestsellers</h3>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Explore our most coveted pieces</p>
                    </Link>
                    <Link href="/collections" className="group p-6 bg-card/30 border border-border hover:border-primary/30 transition-all duration-500 text-left">
                        <Sparkles className="w-5 h-5 text-primary/50 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1">New Arrivals</h3>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Witness our latest craftsmanship</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
