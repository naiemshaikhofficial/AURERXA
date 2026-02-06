'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })

            if (error) throw error

            // Successful login - handle redirect
            const searchParams = new URLSearchParams(window.location.search)
            const redirect = searchParams.get('redirect') || '/'
            router.push(redirect)
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Failed to sign in')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError(null)
        const searchParams = new URLSearchParams(window.location.search)
        const redirect = searchParams.get('redirect') || '/'
        try {
            const redirectUrl = new URL('/auth/callback', window.location.origin)
            redirectUrl.searchParams.set('next', redirect)

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl.toString(),
                    queryParams: {
                        prompt: 'select_account',
                        access_type: 'offline',
                    },
                },
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative overflow-hidden">

            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 md:p-12 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <Link href="/">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Aurerxa" className="h-24 mx-auto mb-6 opacity-90" />
                    </Link>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-white/50 text-sm">Sign in to access your bespoke collection</p>
                </div>

                {error && (
                    <div className="alert-luxury-error mb-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <AlertCircle size={14} className="text-red-500" />
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <Button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        variant="outline"
                        className="w-full bg-neutral-800 text-white hover:bg-neutral-700 h-12 font-medium flex items-center justify-center gap-3 border border-neutral-700 hover:border-neutral-600 transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
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
                        )}
                        {loading ? 'Connecting...' : 'Continue with Google'}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-neutral-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-neutral-900 px-2 text-white/40">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-white/80 text-xs uppercase tracking-wider" htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-neutral-950 border-neutral-800 text-white placeholder:text-white/20 h-12 focus:border-amber-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="text-white/80 text-xs uppercase tracking-wider" htmlFor="password">Password</Label>
                                <Link href="#" className="text-xs text-amber-500 hover:text-amber-400">Forgot password?</Link>
                            </div>
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

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="policies"
                                defaultChecked
                                required
                                className="mt-1 accent-amber-500 w-3 h-3 bg-neutral-900 border-neutral-700 rounded-sm focus:ring-amber-500/20"
                            />
                            <label htmlFor="policies" className="text-[10px] text-white/50 leading-relaxed">
                                I agree to the <Link href="/terms" className="text-amber-500 hover:underline">Terms & Conditions</Link>, <Link href="/privacy" className="text-amber-500 hover:underline">Privacy Policy</Link>, and <Link href="/returns" className="text-amber-500 hover:underline">Refund Policy</Link>.
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest h-12 transition-all duration-300"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-white/50">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-amber-500 hover:text-amber-400 font-medium">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
