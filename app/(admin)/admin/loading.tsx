import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">Loading Dashboard...</p>
            </div>
        </div>
    )
}
