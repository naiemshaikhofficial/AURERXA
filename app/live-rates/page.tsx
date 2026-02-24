import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { GoldRateCard } from '@/components/gold-rate-card'
import Script from 'next/script'

// SEO Metadata for the complete page
export const metadata: Metadata = {
    title: 'Live Gold, Silver & Platinum Rates Today in India | AURERXA',
    description: 'Check today\'s live and accurate market rates for 24K, 22K Gold, 999 Silver, and Platinum. Get real-time bullion pricing updates directly from global markets. Buy with confidence at AURERXA.',
    keywords: [
        'Live gold rate', 'today gold rate in india', '22 carat gold price', '24 carat gold price',
        'gold rate today', 'silver rate today', 'platinum price today', 'aurerxa jewelry', 'bullion market'
    ],
    openGraph: {
        title: 'Live Gold, Silver & Platinum Rates | AURERXA',
        description: 'Check today\'s real-time market rates for 24K, 22K Gold, 999 Silver, and Platinum. Transparent pricing from AURERXA.',
        type: 'website',
        url: 'https://aurerxa.in/live-rates',
    },
    alternates: {
        canonical: 'https://aurerxa.in/live-rates',
    }
}

// JSON-LD Structured Data for Rich Snippets on Google
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Live Gold & Silver Rates Today",
    "description": "Real-time updates for Gold, Silver, and Platinum rates in India. Provided by AURERXA.",
    "url": "https://aurerxa.com/live-rates",
    "publisher": {
        "@type": "Organization",
        "name": "AURERXA",
        "logo": {
            "@type": "ImageObject",
            "url": "https://aurerxa.com/icon.png"
        }
    }
}

export default function LiveRatesPage() {
    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
            {/* Injecting Structured Data into the `<head>` */}
            <Script
                id="structured-data-live-rates"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                strategy="afterInteractive"
            />

            <Navbar />

            <main className="pt-20">
                {/* Hero / Information Section for SEO */}
                <section className="px-6 pt-16 lg:pt-24 max-w-5xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-foreground/90 leading-tight tracking-tight">
                        Today's <span className="text-primary italic">Live Market</span> Rates
                    </h1>
                    <p className="text-muted-foreground font-light text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        At AURERXA, we believe in absolute transparency. We track global bullion markets to provide you with indicative live rates for Gold (24K, 22K, 18K), Silver (999, 925), and Platinum. Our jewelry is priced fairly, reflecting real-time market values.
                    </p>
                </section>

                <div className="-mt-12">
                    <GoldRateCard />
                </div>

                {/* Secondary SEO Content Section */}
                <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto border-t border-white/5 space-y-12">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h2 className="text-xl font-serif text-foreground">Why Track Live Gold Rates?</h2>
                            <p className="text-muted-foreground text-sm font-light leading-relaxed">
                                Gold and precious metals are global commodities traded around the clock. Their prices fluctuate based on international demand, currency values, and economic factors. Knowing the exact live rate ensures you make informed decisions when purchasing fine jewelry or bullion.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-xl font-serif text-foreground">AURERXA's Pricing Philosophy</h2>
                            <p className="text-muted-foreground text-sm font-light leading-relaxed">
                                We combine these live material costs with meticulous craftsmanship. When you purchase an AURERXA piece, you are investing in transparently priced raw materials paired with unparalleled design and lifetime maintenance.
                            </p>
                        </div>
                    </div>
                </section>


            </main>

            <Footer />
        </div>
    )
}
