import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getStores } from '@/app/actions'
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react'

export const metadata = {
    title: 'Store Locator | AURERXA',
    description: 'Find an AURERXA store near you. Visit us for a personalized jewelry experience.'
}

export default async function StoresPage() {
    const stores = await getStores()

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
                            <MapPin className="w-5 h-5" />
                            <span className="text-sm uppercase tracking-[0.2em]">Find Us</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Stores</h1>
                        <p className="text-white/50 max-w-2xl mx-auto">
                            Experience our exquisite collection in person. Our jewelry experts are ready to help you find the perfect piece.
                        </p>
                    </div>

                    {/* Stores Grid */}
                    {stores.length === 0 ? (
                        <div className="text-center py-16">
                            <MapPin className="w-16 h-16 mx-auto mb-6 text-white/20" />
                            <p className="text-xl text-white/50">No stores found. Coming soon to your city!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {stores.map((store) => (
                                <div
                                    key={store.id}
                                    className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all"
                                >
                                    {/* Store Image */}
                                    <div className="relative h-48 bg-neutral-800 overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <MapPin className="w-16 h-16 text-amber-500/20" />
                                        </div>
                                    </div>

                                    {/* Store Info */}
                                    <div className="p-6">
                                        <h2 className="font-serif text-xl font-medium mb-2">{store.name}</h2>
                                        <p className="text-amber-400 text-sm uppercase tracking-wider mb-4">{store.city}</p>

                                        <div className="space-y-3 text-sm text-white/60">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 mt-1 text-amber-500 flex-shrink-0" />
                                                <span>{store.address}</span>
                                            </div>

                                            {store.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                                    <a href={`tel:${store.phone}`} className="hover:text-amber-400 transition-colors">
                                                        {store.phone}
                                                    </a>
                                                </div>
                                            )}

                                            {store.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                                    <a href={`mailto:${store.email}`} className="hover:text-amber-400 transition-colors">
                                                        {store.email}
                                                    </a>
                                                </div>
                                            )}

                                            {store.hours && (
                                                <div className="flex items-start gap-3">
                                                    <Clock className="w-4 h-4 mt-1 text-amber-500 flex-shrink-0" />
                                                    <span>{store.hours}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Get Directions */}
                                        {store.lat && store.lng && (
                                            <a
                                                href={`https://maps.google.com/?q=${store.lat},${store.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-amber-500 text-neutral-950 text-sm font-medium hover:bg-amber-400 transition-colors"
                                            >
                                                <Navigation className="w-4 h-4" />
                                                Get Directions
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Book Appointment CTA */}
                    <div className="mt-16 text-center p-8 bg-neutral-900 border border-neutral-800">
                        <h3 className="font-serif text-2xl font-medium mb-3">Book a Personal Appointment</h3>
                        <p className="text-white/60 mb-6 max-w-xl mx-auto">
                            Get one-on-one attention from our jewelry experts. We'll help you find or create your perfect piece.
                        </p>
                        <a
                            href="mailto:appointments@aurerxa.com?subject=Store Appointment Request"
                            className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium uppercase tracking-widest text-sm transition-colors"
                        >
                            Request Appointment
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
