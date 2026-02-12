export function OrdersSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 w-32 bg-white/5 rounded-lg" />
                <div className="h-10 w-24 bg-white/5 rounded-xl" />
            </div>

            <div className="flex gap-4">
                <div className="h-10 flex-1 bg-white/5 rounded-xl" />
                <div className="h-10 w-96 bg-white/5 rounded-xl" />
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
                <div className="h-12 border-b border-white/5 bg-white/5" />
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-16 border-b border-white/5 flex items-center px-4 gap-4">
                        <div className="h-4 w-20 bg-white/5 rounded" />
                        <div className="h-4 w-32 bg-white/5 rounded" />
                        <div className="h-4 w-16 bg-white/5 rounded" />
                        <div className="h-4 w-24 bg-white/5 rounded" />
                        <div className="h-6 w-20 bg-white/5 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    )
}
