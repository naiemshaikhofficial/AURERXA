'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRepairRequest } from '@/app/actions'
import { Loader2, Wrench, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RepairsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        productName: '',
        orderNumber: '',
        issue: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        const result = await createRepairRequest(formData)

        if (result.success) {
            setSuccess(true)
            setFormData({ productName: '', orderNumber: '', issue: '' })
        } else {
            setError(result.error || 'Failed to submit repair request')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <Wrench className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h1 className="text-3xl font-serif font-bold mb-4">Repair Services</h1>
                        <p className="text-muted-foreground">
                            We ensure your legacy lasts forever. <br />
                            Request a professional repair or polish for your AURERXA jewelry.
                        </p>
                    </div>

                    <div className="bg-card border border-border p-8 rounded-lg shadow-2xl relative overflow-hidden">
                        {success && (
                            <div className="absolute inset-0 bg-card z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                                <h3 className="text-2xl font-serif font-bold text-emerald-500 mb-2">Request Submitted</h3>
                                <p className="text-muted-foreground text-center max-w-xs mb-6">
                                    Our artisans will review your request and contact you shortly with shipping instructions.
                                </p>
                                <Button
                                    variant="outline"
                                    className="border-input hover:bg-muted"
                                    onClick={() => setSuccess(false)}
                                >
                                    Submit Another
                                </Button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="text-muted-foreground">Product Name / Description</Label>
                                <Input
                                    value={formData.productName}
                                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                                    placeholder="e.g., Diamond Solitaire Ring"
                                    required
                                    className="mt-2 bg-background border-input text-foreground"
                                />
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Order Number (Optional)</Label>
                                <Input
                                    value={formData.orderNumber}
                                    onChange={e => setFormData({ ...formData, orderNumber: e.target.value })}
                                    placeholder="e.g., AUR12345"
                                    className="mt-2 bg-background border-input text-foreground"
                                />
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Issue Description</Label>
                                <textarea
                                    value={formData.issue}
                                    onChange={e => setFormData({ ...formData, issue: e.target.value })}
                                    placeholder="Describe the damage or service needed (e.g., loose stone, polishing required)..."
                                    required
                                    rows={5}
                                    className="w-full mt-2 p-3 bg-background border border-input text-foreground text-sm focus:outline-none focus:border-primary rounded-md"
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
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Service'}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
