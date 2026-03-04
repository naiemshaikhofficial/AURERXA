import { Metadata } from 'next'
import { RingSizeCalculatorClient } from '@/components/ring-size-calculator-client'

export const metadata: Metadata = {
    title: 'Ring Size Calculator | AURERXA',
    description: 'Find your perfect ring size using our interactive Indian ring size calculator. Three methods: measure a ring on screen, use string, or browse the full size chart.',
    alternates: {
        canonical: '/ring-size-calculator',
    },
}

export default function RingSizeCalculatorPage() {
    return <RingSizeCalculatorClient />
}
