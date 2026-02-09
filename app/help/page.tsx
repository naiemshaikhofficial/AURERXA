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
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <LifeBuoy className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h1 className="text-3xl font-serif font-bold mb-4">Help Center</h1>
                        <p className="text-muted-foreground">
                            Need assistance with your high-value purchase? <br />
                            Raise a ticket and our dedicated concierge will assist you.
                        </p>
                    </div>

                    <div className="bg-card border border-border p-8 rounded-lg shadow-2xl relative overflow-hidden">
                        {success && (
                            <div className="absolute inset-0 bg-card z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                                <h3 className="text-2xl font-serif font-bold text-emerald-500 mb-2">Ticket Raised</h3>
                                <p className="text-muted-foreground text-center max-w-xs">
                                    Your request has been logged. <br />Ticket ID: #{Math.floor(Math.random() * 10000)}
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-8 border-border hover:bg-muted"
                                    onClick={() => setSuccess(false)}
                                >
                                    Raise Another
                                </Button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="text-muted-foreground">Subject</Label>
                                <Input
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g., Order Delivery Status, Product Query"
                                    required
                                    className="mt-2 bg-background border-input text-foreground font-sans placeholder:text-muted-foreground"
                                />
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Urgency</Label>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    {['low', 'normal', 'high'].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, urgency: level })}
                                            className={`p-3 text-sm capitalize border transition-all ${formData.urgency === level
                                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                                : 'border-border text-muted-foreground hover:border-primary/50'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Message</Label>
                                <textarea
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    required
                                    rows={5}
                                    className="w-full mt-2 p-3 bg-background border border-input text-foreground text-sm focus:outline-none focus:border-primary rounded-md placeholder:text-muted-foreground"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Ticket'}
                            </Button>
                        </form>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            For immediate assistance, call us at <span className="text-foreground">+91 22 2640 5555</span> (10 AM - 7 PM)
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
