import Link from 'next/link'
import { ShieldAlert, Mail } from 'lucide-react'

export default function BannedPage() {
    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-serif font-bold text-white">Account Suspended</h1>
                    <p className="text-white/40 text-sm leading-relaxed">
                        Your account has been suspended due to a violation of our terms of service or suspicious activity.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                    <p className="text-xs text-white/30 uppercase tracking-wider mb-2">What this means</p>
                    <ul className="text-sm text-white/60 space-y-2 list-disc list-inside">
                        <li>You cannot place new orders.</li>
                        <li>You cannot access your order history.</li>
                        <li>Any pending orders may be cancelled.</li>
                    </ul>
                </div>

                <div className="pt-4">
                    <p className="text-xs text-white/30 mb-4"> believe this is a mistake?</p>
                    <a
                        href="mailto:support@aurerxa.com"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-sm uppercase tracking-widest text-xs font-bold hover:bg-neutral-200 transition"
                    >
                        <Mail className="w-4 h-4" />
                        Contact Support
                    </a>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <Link href="/" className="text-xs text-white/40 hover:text-white transition underline">
                        Return to Homepage
                    </Link>
                </div>
            </div>
        </div>
    )
}
