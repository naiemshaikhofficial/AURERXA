import { AboutClient } from './AboutClient'

export const metadata = {
    title: 'About Us | AURERXA',
    description: 'The story of AURERXA - Legacy, Craft, and Integrity.',
}

export const revalidate = 3600 // revalidate every hour

export default function AboutPage() {
    return <AboutClient />
}
