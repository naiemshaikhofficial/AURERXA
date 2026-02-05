'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { SectionTitle } from '@/components/section-title' // Assuming this component exists or I'll create inline
import Image from 'next/image'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/heritage-rings.jpg"
                        alt="Heritage"
                        fill
                        className="object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
                </div>

                <div className="relative z-10 text-center max-w-4xl px-4">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight text-white drop-shadow-2xl">
                        Our Story
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-amber-400 tracking-[0.2em] uppercase">
                        From Dust to Diamond
                    </p>
                </div>
            </section>

            {/* Narrative Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center space-y-12">

                    <div className="space-y-6">
                        <h2 className="text-3xl font-serif font-bold text-white mb-8 relative inline-block">
                            Humble Beginnings
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-amber-500"></span>
                        </h2>

                        <p className="text-lg text-white/80 leading-relaxed font-light">
                            We belong to a poor Bengali family who have been serving in the gold industry as workers for generations.
                        </p>

                        <p className="text-lg text-white/70 leading-relaxed font-light">
                            My father’s hands were callous and scarred, stained with the polish and dust of gold that didn't belong to him.
                            Day after day, he would shape dreams for others, crafting intricate designs that would adorn high-society weddings,
                            while our own home barely had a solid roof. He taught me that gold isn't just a metal—it's patience, it's sacrifice, and it's art.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <p className="text-lg text-white/70 leading-relaxed font-light">
                            We watched the world sparkle from the shadows of small, dimly lit workshops in narrow lanes.
                            But in those shadows, a fire was burning. We didn't just want to be the hands that built the luxury;
                            we wanted to be the visionaries who defined it.
                        </p>
                        <p className="text-lg text-white/70 leading-relaxed font-light">
                            AURERXA is not just a brand. It is the culmination of decades of sweat, tears, and an undying hope.
                            It is the story of rising from the dust to craft the diamond. Today, we bring you not just jewelry,
                            but a legacy forged in the fires of struggle, purely handmade with the soul of Bengal's finest craftsmanship.
                        </p>
                    </div>

                    <div className="pt-12">
                        <p className="text-2xl font-serif italic text-amber-400">
                            "We craft with our soul, because we know the value of every grain of gold."
                        </p>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    )
}
