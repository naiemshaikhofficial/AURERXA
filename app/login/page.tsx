'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
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
            // Check for 'redirect' or 'next' (common conventions)
            const redirectPath = searchParams.get('redirect') || searchParams.get('next') || '/'

            // Force a hard refresh to ensure middleware/server components pick up the new session
            // This is often more reliable than router.push + router.refresh for auth state changes
            window.location.href = redirectPath
        } catch (err: any) {
            setError(err.message || 'Failed to sign in')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError(null)
        const redirect = searchParams.get('redirect') || searchParams.get('next') || '/'
        try {
            const redirectUrl = new URL('/auth/callback', window.location.origin)
            // Always use 'next' for the callback handler to understand
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
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">

            <div className="w-full max-w-md bg-card/60 backdrop-blur-md border border-border p-8 md:p-12 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <Link href="/">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.webp" alt="Aurerxa" className="h-24 mx-auto mb-6 opacity-90 dark:invert-0 invert" />
                    </Link>
                    <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Welcome Back</h2>
                    <p className="text-muted-foreground text-sm">Sign in to access your bespoke collection</p>
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
                        className="w-full bg-background/5 text-foreground hover:bg-background/10 h-12 font-medium flex items-center justify-center gap-3 border border-border hover:border-foreground/20 transition-all duration-300 disabled:opacity-50 rounded-none uppercase tracking-widest text-xs"
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
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground tracking-widest text-[10px]">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-foreground/80 text-xs uppercase tracking-wider" htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 h-12 focus:border-primary/50 rounded-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="text-foreground/80 text-xs uppercase tracking-wider" htmlFor="password">Password</Label>
                                <Link href="/forgot-password" title="Reset Password" className="text-xs text-primary hover:text-primary/80">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 h-12 focus:border-primary/50 pr-10 rounded-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="policies"
                                defaultChecked
                                required
                                className="mt-1 accent-primary w-3 h-3 bg-background border-input rounded-sm focus:ring-primary/20"
                            />
                            <label htmlFor="policies" className="text-[10px] text-muted-foreground leading-relaxed">
                                I agree to the <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link>, <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and <Link href="/returns" className="text-primary hover:underline">Refund Policy</Link>.
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.2em] h-12 transition-all duration-300 rounded-none"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href={`/signup${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} className="text-primary hover:text-primary/80 font-medium">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
