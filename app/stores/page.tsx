import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getStores } from '@/app/actions'
import { MapPin, Phone, Mail, Clock, Navigation, Sparkles } from 'lucide-react'

export const metadata = {
    title: 'Store Locator | AURERXA',
    description: 'Find an AURERXA store near you. Visit us for a personalized jewelry experience.'
}

export default async function StoresPage() {
    const stores = await getStores()

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-32 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-24 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                        <div className="flex items-center justify-center gap-2 text-amber-500 mb-6 animate-in fade-in duration-700">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-medium">Boutiques</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight animate-in slide-in-from-bottom-4 duration-700">
                            Our <span className="text-amber-500 italic">Presence</span>
                        </h1>
                        <p className="text-white/40 max-w-xl mx-auto font-light text-sm md:text-base animate-in slide-in-from-bottom-6 duration-700">
                            Experience the radiance of AURERXA excellence in person at our flagship boutiques across the nation.
                        </p>
                    </div>

                    {/* Stores Grid */}
                    {stores.length === 0 ? (
                        <div className="text-center py-32 animate-in zoom-in-95 duration-500">
                            <div className="mb-8 inline-flex p-8 rounded-full bg-neutral-900 border border-neutral-800">
                                <MapPin className="w-12 h-12 text-white/10" />
                            </div>
                            <h3 className="text-xl font-serif text-white mb-2 italic">AWAITING OUR DEBUT</h3>
                            <p className="text-white/40 text-sm tracking-widest uppercase font-light">New stores are appearing on the map soon</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {stores.map((store, idx) => (
                                <div
                                    key={store.id}
                                    className="group bg-neutral-900/40 border border-neutral-800 hover:border-amber-500/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
                                    style={{ animationDelay: `${idx * 150}ms` }}
                                >
                                    {/* Store Image / Map Placeholder */}
                                    <div className="relative h-64 bg-neutral-900 overflow-hidden border-b border-neutral-800">
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent z-10 opactiy-60" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <MapPin className="w-20 h-20 text-neutral-800 group-hover:text-amber-500/20 transition-colors duration-700" />
                                        </div>
                                        {/* You can replace this with actual store images if available */}
                                        <div className="absolute bottom-6 left-6 z-20">
                                            <span className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-bold">
                                                {store.city} Boutique
                                            </span>
                                        </div>
                                    </div>

                                    {/* Store Info */}
                                    <div className="p-8">
                                        <h2 className="font-serif text-2xl font-bold mb-6 text-white group-hover:text-amber-400 transition-colors italic">
                                            {store.name}
                                        </h2>

                                        <div className="space-y-5 text-sm">
                                            <div className="flex items-start gap-4 group/item">
                                                <MapPin className="w-4 h-4 mt-1 text-amber-500 group-hover/item:scale-110 transition-transform" />
                                                <span className="text-white/60 font-light leading-relaxed">{store.address}</span>
                                            </div>

                                            {store.phone && (
                                                <div className="flex items-center gap-4 group/item">
                                                    <Phone className="w-4 h-4 text-amber-500 group-hover/item:scale-110 transition-transform" />
                                                    <a href={`tel:${store.phone}`} className="text-white/60 hover:text-white transition-colors font-light">
                                                        {store.phone}
                                                    </a>
                                                </div>
                                            )}

                                            {store.email && (
                                                <div className="flex items-center gap-4 group/item">
                                                    <Mail className="w-4 h-4 text-amber-500 group-hover/item:scale-110 transition-transform" />
                                                    <a href={`mailto:${store.email}`} className="text-white/60 hover:text-white transition-colors font-light">
                                                        {store.email}
                                                    </a>
                                                </div>
                                            )}

                                            {store.hours && (
                                                <div className="flex items-start gap-4 group/item">
                                                    <Clock className="w-4 h-4 mt-1 text-amber-500 group-hover/item:scale-110 transition-transform" />
                                                    <span className="text-white/60 font-light italic">{store.hours}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Get Directions Button */}
                                        {store.lat && store.lng && (
                                            <a
                                                href={`https://maps.google.com/?q=${store.lat},${store.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-3 mt-10 w-full py-4 border border-neutral-800 text-[10px] uppercase tracking-[0.3em] font-bold text-white hover:bg-white hover:text-neutral-950 hover:border-white transition-all duration-500"
                                            >
                                                <Navigation className="w-3.5 h-3.5" />
                                                Locate Boutique
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Book Appointment CTA */}
                    <div className="mt-32 relative group border border-neutral-800 p-[1px]">
                        <div className="bg-neutral-900 px-8 py-16 md:py-24 text-center overflow-hidden relative">
                            {/* Subtle Background Elements */}
                            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-amber-500/20" />
                            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-amber-500/20" />

                            <h3 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-white relative z-10">
                                Royal <span className="text-amber-500 italic">Consultation</span>
                            </h3>
                            <p className="text-white/40 mb-10 max-w-xl mx-auto font-light leading-relaxed relative z-10">
                                Arrange a private one-on-one session with our master jewelry consultants to discover or create your next heirloom.
                            </p>
                            <a
                                href="mailto:appointments@aurerxa.com?subject=Boutique Appointment Request"
                                className="inline-block px-12 py-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-[0.3em] text-[10px] transition-all duration-500 relative z-10 shadow-2xl"
                            >
                                Request Private Session
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
