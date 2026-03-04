import { ParallaxSection } from '@/components/story/parallax-section'
import { Timeline } from '@/components/story/timeline'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Jewelry Heritage & Artisanal Craftsmanship | Our Story | AURERXA',
    description: 'The journey of AURERXA: From a legacy of artisan craftsmanship to a global symbol of fine luxury jewelry. Discover our commitment to ethical materials and timeless design.',
    keywords: ['Jewelry Heritage', 'Artisanal Craftsmanship', 'Handmade Jewelry History', 'Bespoke Jewelry Maker', 'Fine Jewelry Design Story', 'Ethical Luxury Jewelry India'],
}

export default function OurStoryPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Hero Video Section */}
            <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
                >
                    {/* Using a placeholder jewelry making video */}
                    <source src="https://videos.pexels.com/video-files/5323928/5323928-uhd_2560_1440_30fps.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40" /> { /* Dark overlay */}

                <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl mx-auto">
                    <span className="text-primary text-sm tracking-[0.4em] uppercase font-bold animate-fade-in">
                        Since 1989
                    </span>
                    <h1 className="text-5xl md:text-8xl font-serif font-light text-white tracking-wide animate-fade-in-up">
                        The Art of <br /> <span className="italic text-primary-foreground">Timelessness</span>
                    </h1>
                    <p className="text-white/80 max-w-xl mx-auto font-light text-lg leading-relaxed animate-fade-in-up delay-200">
                        Crafting more than just jewelry. We create heirlooms that carry stories across generations.
                    </p>
                </div>
            </section>

            {/* Introduction */}
            <section className="py-24 text-center px-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl font-serif italic text-muted-foreground">
                        "Jewelry is silent poetry."
                    </h2>
                    <div className="w-16 h-px bg-primary mx-auto" />
                    <p className="text-lg text-foreground/80 font-light leading-loose">
                        At AURERXA, we believe that every piece of jewelry holds a soul. It absorbs the laughter of celebrations, the warmth of embraces, and the quiet dignity of everyday moments. Our journey is not just about gold and diamonds; it is about the pursuit of perfection in its most beautiful form.
                    </p>
                </div>
            </section>

            {/* Parallax Sections */}
            <ParallaxSection
                imgUrl="https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=2070&auto=format&fit=crop"
                subheading="The Craft"
                heading="Master Artisans"
            >
                <p>
                    In our workshops, time slows down. Hands that have known the touch of gold for decades work with a precision that machines cannot replicate.
                </p>
                <p>
                    Each setting is hand-carved, each stone hand-selected. We honor the ancient techniques of our ancestors while embracing modern innovation to create pieces that are structurally sound and aesthetically divine.
                </p>
            </ParallaxSection>

            <ParallaxSection
                imgUrl="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2075&auto=format&fit=crop"
                subheading="The Materials"
                heading="Ethical Luxury"
                reverse
            >
                <p>
                    Beauty should not come at a cost to the earth. We are rigorously committed to ethical sourcing. Our diamonds are conflict-free, and our gold is responsibly mined or recycled.
                </p>
                <p>
                    When you wear AURERXA, you wear a promise of integrity. A promise that luxury can be both breathtaking and benevolent.
                </p>
            </ParallaxSection>

            {/* Timeline */}
            <section className="bg-muted/10">
                <div className="container px-4 py-20 text-center">
                    <span className="text-primary text-xs tracking-[0.3em] uppercase block mb-4">Our Journey</span>
                    <h2 className="text-4xl font-serif mb-12">A Legacy in the Making</h2>
                    <Timeline />
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-32 relative flex items-center justify-center bg-foreground text-background overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 0 C 50 100 80 100 100 0 Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="relative z-10 text-center space-y-8 px-4">
                    <h2 className="text-4xl md:text-5xl font-serif">Be Part of Our Story</h2>
                    <p className="text-white/60 max-w-md mx-auto font-light">
                        Own a piece of history. Explore our latest collections and find the one that speaks to your soul.
                    </p>
                    <a href="/products" className="inline-block border border-primary text-primary px-8 py-4 uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-500">
                        Explore Collections
                    </a>
                </div>
            </section>
        </div>
    )
}
