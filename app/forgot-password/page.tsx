'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [email, setEmail] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) throw error
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
            <div className="w-full max-w-md bg-card border border-border p-8 md:p-12 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-xs uppercase tracking-widest mb-6 transition-colors">
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                    <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Reset Password</h2>
                    <p className="text-muted-foreground text-sm">Enter your email to receive a bespoke recovery link</p>
                </div>

                {success ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-foreground font-medium">Link Sent Successfully</p>
                            <p className="text-muted-foreground/80 text-sm leading-relaxed">
                                A password recovery link has been sent to <span className="text-foreground">{email}</span>. Please check your inbox.
                            </p>
                        </div>
                        <Button
                            onClick={() => window.location.href = '/login'}
                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-12 uppercase tracking-widest text-xs"
                        >
                            Return to Sign In
                        </Button>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="alert-luxury-error mb-6 text-center">
                                <div className="flex items-center justify-center gap-3">
                                    <AlertCircle size={14} className="text-red-500" />
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider" htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background border-input text-foreground placeholder:text-muted-foreground/50 h-12 focus:border-primary/50"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest h-12 transition-all duration-300"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
