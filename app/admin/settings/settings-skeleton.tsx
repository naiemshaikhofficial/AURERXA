export function SettingsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-32 bg-white/5 rounded-lg" />
            <div className="flex gap-2">
                <div className="h-10 w-24 bg-white/5 rounded-xl" />
                <div className="h-10 w-24 bg-white/5 rounded-xl" />
            </div>
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/5" />
                ))}
            </div>
        </div>
    )
}
