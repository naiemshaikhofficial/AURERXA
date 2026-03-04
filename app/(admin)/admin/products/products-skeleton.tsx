export function ProductsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-white/5 rounded-lg" />
                <div className="flex gap-2">
                    <div className="h-10 w-32 bg-white/5 rounded-xl" />
                    <div className="h-10 w-32 bg-white/5 rounded-xl" />
                </div>
            </div>

            <div className="h-10 w-full bg-white/5 rounded-xl" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5" />
                    ))}
                </div>
                <div className="h-96 bg-white/5 rounded-2xl border border-white/5" />
            </div>
        </div>
    )
}
