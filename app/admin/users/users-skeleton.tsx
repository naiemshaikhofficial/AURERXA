export function UsersSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-32 bg-white/5 rounded-lg" />
            <div className="h-10 w-full bg-white/5 rounded-xl" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-40 bg-white/5 rounded-xl border border-white/5" />
                ))}
            </div>
        </div>
    )
}
