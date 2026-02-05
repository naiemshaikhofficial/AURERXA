'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTicket } from '@/app/actions'
import { Loader2, MessageSquare, AlertCircle, CheckCircle, LifeBuoy } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HelpPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        urgency: 'normal'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        const result = await createTicket(formData)

        if (result.success) {
            setSuccess(true)
            setFormData({ subject: '', message: '', urgency: 'normal' })
            setTimeout(() => {
                setSuccess(false)
                router.push('/account') // Redirect to dashboard to see tickets? Or stay.
            }, 3000)
        } else {
            setError(result.error || 'Failed to submit ticket')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <LifeBuoy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-serif font-bold mb-4">Help Center</h1>
                        <p className="text-white/60">
                            Need assistance with your high-value purchase? <br />
                            Raise a ticket and our dedicated concierge will assist you.
                        </p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg shadow-2xl relative overflow-hidden">
                        {success && (
                            <div className="absolute inset-0 bg-neutral-900 z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                                <h3 className="text-2xl font-serif font-bold text-emerald-500 mb-2">Ticket Raised</h3>
                                <p className="text-white/60 text-center max-w-xs">
                                    Your request has been logged. <br />Ticket ID: #{Math.floor(Math.random() * 10000)}
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-8 border-neutral-700 hover:bg-neutral-800"
                                    onClick={() => setSuccess(false)}
                                >
                                    Raise Another
                                </Button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="text-white/70">Subject</Label>
                                <Input
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g., Order Delivery Status, Product Query"
                                    required
                                    className="mt-2 bg-neutral-950 border-neutral-700 text-white"
                                />
                            </div>

                            <div>
                                <Label className="text-white/70">Urgency</Label>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    {['low', 'normal', 'high'].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, urgency: level })}
                                            className={`p-3 text-sm capitalize border transition-all ${formData.urgency === level
                                                    ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-medium'
                                                    : 'border-neutral-700 text-white/50 hover:border-neutral-600'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-white/70">Message</Label>
                                <textarea
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    required
                                    rows={5}
                                    className="w-full mt-2 p-3 bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500 rounded-md"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/20 p-3 rounded">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold h-12"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Ticket'}
                            </Button>
                        </form>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-white/40 text-sm">
                            For immediate assistance, call us at <span className="text-white">+91 22 2640 5555</span> (10 AM - 7 PM)
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
