export function SupportSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-32 bg-white/5 rounded-lg" />
            <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-white/5 rounded-xl" />
                ))}
            </div>
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5" />
                ))}
            </div>
        </div>
    )
}
