'use client'

import React from 'react'

export function DashboardSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="h-8 w-48 bg-white/5 rounded-lg mb-2" />
                    <div className="h-4 w-64 bg-white/5 rounded-lg" />
                </div>
                <div className="h-10 w-32 bg-white/5 rounded-xl" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5" />
                ))}
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-64 bg-white/5 rounded-2xl border border-white/5" />
                <div className="h-64 bg-white/5 rounded-2xl border border-white/5" />
            </div>
        </div>
    )
}
