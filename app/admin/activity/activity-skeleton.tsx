export function ActivitySkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-white/5 rounded-lg" />
                <div className="h-10 w-24 bg-white/5 rounded-xl" />
            </div>

            <div className="flex gap-2 pb-1">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 w-20 bg-white/5 rounded-lg" />
                ))}
            </div>

            <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-20 bg-white/5 border border-white/5 rounded-xl" />
                ))}
            </div>
        </div>
    )
}
