export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
            {/* Elegant Golden Spinner */}
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#D4AF37]/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#D4AF37] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}
