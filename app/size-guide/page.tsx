import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Ruler, Circle, AlertCircle } from 'lucide-react'

export const metadata = {
    title: 'Size Guide | AURERXA',
    description: 'Find your perfect ring and chain size with our comprehensive size guide.'
}

export default function SizeGuidePage() {
    const ringSizes = [
        { indian: '6', us: '4', diameter: '14.9mm', circumference: '46.8mm' },
        { indian: '8', us: '5', diameter: '15.7mm', circumference: '49.3mm' },
        { indian: '10', us: '6', diameter: '16.5mm', circumference: '51.9mm' },
        { indian: '12', us: '7', diameter: '17.3mm', circumference: '54.4mm' },
        { indian: '14', us: '8', diameter: '18.1mm', circumference: '56.9mm' },
        { indian: '16', us: '9', diameter: '18.9mm', circumference: '59.5mm' },
        { indian: '18', us: '10', diameter: '19.8mm', circumference: '62.1mm' },
        { indian: '20', us: '11', diameter: '20.6mm', circumference: '64.6mm' },
        { indian: '22', us: '12', diameter: '21.4mm', circumference: '67.2mm' },
        { indian: '24', us: '13', diameter: '22.2mm', circumference: '69.7mm' },
    ]

    const chainLengths = [
        { length: '14 inch (36cm)', fits: 'Choker style, sits at collar bone' },
        { length: '16 inch (41cm)', fits: 'Princess length, most popular for pendants' },
        { length: '18 inch (46cm)', fits: 'Falls below collar bone, versatile length' },
        { length: '20 inch (51cm)', fits: 'Longer style, sits on chest' },
        { length: '22 inch (56cm)', fits: 'Matinee length, elegant look' },
        { length: '24 inch (61cm)', fits: 'Opera length, dramatic statement' },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold mb-4 text-center">Size Guide</h1>
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-12" />

                    {/* Ring Size Section */}
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Circle className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-serif font-medium">Ring Sizes</h2>
                        </div>

                        <div className="bg-card border border-border overflow-hidden mb-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="px-4 py-3 text-left font-medium text-primary">Indian Size</th>
                                        <th className="px-4 py-3 text-left font-medium text-primary">US Size</th>
                                        <th className="px-4 py-3 text-left font-medium text-primary">Diameter</th>
                                        <th className="px-4 py-3 text-left font-medium text-primary">Circumference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ringSizes.map((size, i) => (
                                        <tr key={i} className="border-t border-border hover:bg-muted/50">
                                            <td className="px-4 py-3 text-foreground">{size.indian}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{size.us}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{size.diameter}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{size.circumference}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* How to Measure */}
                        <div className="bg-card border border-border p-6">
                            <h3 className="font-serif font-medium mb-4 flex items-center gap-2">
                                <Ruler className="w-5 h-5 text-primary" />
                                How to Measure Your Ring Size
                            </h3>
                            <ol className="text-muted-foreground space-y-3">
                                <li className="flex gap-3">
                                    <span className="text-primary font-medium">1.</span>
                                    <span>Wrap a thin strip of paper or string around your finger</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-primary font-medium">2.</span>
                                    <span>Mark where it overlaps with a pen</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-primary font-medium">3.</span>
                                    <span>Measure the length in millimeters (this is your circumference)</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-primary font-medium">4.</span>
                                    <span>Find your size in the chart above</span>
                                </li>
                            </ol>
                        </div>
                    </section>

                    {/* Chain Length Section */}
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Ruler className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-serif font-medium">Chain Lengths</h2>
                        </div>

                        <div className="bg-card border border-border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="px-4 py-3 text-left font-medium text-primary">Length</th>
                                        <th className="px-4 py-3 text-left font-medium text-primary">Where It Sits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chainLengths.map((chain, i) => (
                                        <tr key={i} className="border-t border-border hover:bg-muted/50">
                                            <td className="px-4 py-3 text-foreground font-medium">{chain.length}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{chain.fits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Tips */}
                    <section className="bg-primary/10 border border-primary/30 p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-serif font-medium mb-2 text-primary">Pro Tips</h3>
                                <ul className="text-muted-foreground space-y-2 text-sm">
                                    <li>• Measure your finger at the end of the day when fingers are slightly larger</li>
                                    <li>• Avoid measuring when hands are cold (fingers shrink)</li>
                                    <li>• If between sizes, choose the larger size for comfort</li>
                                    <li>• Wide bands need a slightly larger size than thin bands</li>
                                    <li>• For surprise gifts, use a ring they already own to measure</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <p className="text-center text-muted-foreground text-sm mt-8">
                        Need help? Contact us at <a href="mailto:sizing@aurerxa.com" className="text-primary hover:text-primary/80">sizing@aurerxa.com</a>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
