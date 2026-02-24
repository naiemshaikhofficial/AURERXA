import Link from 'next/link'
import { ShieldAlert, Mail } from 'lucide-react'

export default function BannedPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-serif font-bold text-foreground">Account Suspended</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Your account has been suspended due to a violation of our terms of service or suspicious activity.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 text-left shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">What this means</p>
                    <ul className="text-sm text-foreground/70 space-y-2 list-disc list-inside">
                        <li>You cannot place new orders.</li>
                        <li>You cannot access your order history.</li>
                        <li>Any pending orders may be cancelled.</li>
                    </ul>
                </div>

                <div className="pt-4">
                    <p className="text-xs text-muted-foreground mb-4"> believe this is a mistake?</p>
                    <a
                        href="mailto:support@aurerxa.com"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full uppercase tracking-widest text-[10px] font-bold hover:bg-foreground hover:text-background transition-all duration-500 shadow-lg"
                    >
                        <Mail className="w-4 h-4" />
                        Contact Support
                    </a>
                </div>

                <div className="pt-8 border-t border-border">
                    <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
                        Return to Homepage
                    </Link>
                </div>
            </div>
        </div>
    )
}
