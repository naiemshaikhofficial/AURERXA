'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    })
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match")
            setLoading(false)
            return
        }

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        phone_number: formData.phone, // Passing phone in metadata to be picked up by trigger or manual insert
                    },
                },
            })

            if (signUpError) throw signUpError

            // If successful, update the profiles table if trigger didn't handle phone (Trigger handles full_name from metadata)
            // We'll update the phone number in profile manually just in case to ensure it's saved
            if (data.user) {
                await supabase
                    .from('profiles')
                    .update({ phone_number: formData.phone })
                    .eq('id', data.user.id)
            }

            setIsSubmitted(true)
        } catch (err: any) {
            setError(err.message || 'Failed to sign up')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignup = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-20 relative overflow-hidden">
            {/* Background Luxury Elements */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23D4AF37%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 md:p-12 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <Link href="/">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Aurerxa" className="h-12 mx-auto mb-6 opacity-90" />
                    </Link>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">
                        {isSubmitted ? 'Check Your Inbox' : 'Create Account'}
                    </h2>
                    <p className="text-white/50 text-sm">
                        {isSubmitted ? 'A verification link has been sent to your email.' : 'Join the circle of exclusivity'}
                    </p>
                </div>

                {isSubmitted ? (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 mx-auto rounded-full border border-amber-500/30 flex items-center justify-center bg-amber-500/5">
                            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-white/70 text-sm leading-relaxed">
                                We have sent a luxurious invitation to verify your account at <span className="text-amber-500 font-medium">{formData.email}</span>.
                            </p>
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                                Verification is required to access your bespoke portal.
                            </p>
                        </div>

                        <div className="pt-4 space-y-4">
                            <Button
                                onClick={() => router.push('/login')}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest h-12"
                            >
                                Back to Login
                            </Button>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="w-full text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Re-enter Email
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <Button
                                onClick={handleGoogleSignup}
                                variant="outline"
                                className="w-full bg-white text-black hover:bg-gray-100 h-12 font-medium flex items-center justify-center gap-3 border-none"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-neutral-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-neutral-900 px-2 text-white/40">Or register with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-white/80 text-xs uppercase tracking-wider" htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="John Doe"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-white/20 h-12 focus:border-amber-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white/80 text-xs uppercase tracking-wider" htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="bg-neutral-950 border-neutral-800 text-white placeholder:text-white/20 h-12 focus:border-amber-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white/80 text-xs uppercase tracking-wider" htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            placeholder="+1 (555)..."
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="bg-neutral-950 border-neutral-800 text-white placeholder:text-white/20 h-12 focus:border-amber-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white/80 text-xs uppercase tracking-wider" htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-white/20 h-12 focus:border-amber-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/80 text-xs uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-white/20 h-12 focus:border-amber-500/50"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest h-12 transition-all duration-300 mt-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                                </Button>
                            </form>

                            <div className="text-center text-sm text-white/50">
                                Already have an account?{' '}
                                <Link href="/login" className="text-amber-500 hover:text-amber-400 font-medium">
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
