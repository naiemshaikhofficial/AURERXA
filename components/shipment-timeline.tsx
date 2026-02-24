'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Truck, Package, MapPin, Clock, AlertCircle } from 'lucide-react'

interface Scan {
    status: string
    location: string
    timestamp: string
    instructions?: string
}

interface ShipmentTimelineProps {
    scans: Scan[]
    currentStatus: string
    estimatedDelivery?: string
}

const statusConfig: Record<string, { icon: any, color: string, description: string }> = {
    'picked up': { icon: Package, color: 'text-primary', description: 'Shipment has been picked up from our warehouse.' },
    'in transit': { icon: Truck, color: 'text-blue-500', description: 'Your package is on the way to the next hub.' },
    'arrived': { icon: MapPin, color: 'text-amber-500', description: 'Shipment arrived at a delivery hub.' },
    'out for delivery': { icon: Truck, color: 'text-emerald-500', description: 'Our delivery partner is on their way to your address!' },
    'delivered': { icon: CheckCircle2, color: 'text-primary', description: 'Package delivered successfully. Enjoy your AURERXA treasure!' },
    'pending': { icon: Clock, color: 'text-muted-foreground', description: 'Preparing for shipment.' },
    'delayed': { icon: AlertCircle, color: 'text-destructive', description: 'There is a slight delay in transit.' },
    'default': { icon: Circle, color: 'text-muted-foreground', description: 'Updating status...' }
}

export function ShipmentTimeline({ scans, currentStatus, estimatedDelivery }: ShipmentTimelineProps) {
    const getStatusInfo = (status: string) => {
        const s = status.toLowerCase()
        if (s.includes('delivered')) return statusConfig['delivered']
        if (s.includes('out for delivery')) return statusConfig['out for delivery']
        if (s.includes('transit')) return statusConfig['in transit']
        if (s.includes('arrived')) return statusConfig['arrived']
        if (s.includes('picked')) return statusConfig['picked up']
        if (s.includes('delay')) return statusConfig['delayed']
        return statusConfig['default']
    }

    // Sort scans by timestamp descending (newest first)
    const sortedScans = [...scans].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return (
        <div className="space-y-8 py-4">
            {estimatedDelivery && (
                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-sm mb-6">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Estimated Delivery</p>
                            <p className="text-sm font-serif font-bold text-foreground">
                                {new Date(estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Current Hub</p>
                        <p className="text-sm text-foreground">{sortedScans[0]?.location || 'N/A'}</p>
                    </div>
                </div>
            )}

            <div className="relative pl-8 space-y-10">
                {/* Continuous Timeline Line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-border/50" />

                {sortedScans.map((scan, index) => {
                    const info = getStatusInfo(scan.status)
                    const Icon = info.icon
                    const isLatest = index === 0

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group"
                        >
                            {/* Timeline Node */}
                            <div className={`absolute -left-8 top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110 ${isLatest ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                                <Icon className={isLatest ? "w-4 h-4" : "w-3 h-3"} />
                            </div>

                            {/* Scan Content */}
                            <div className="space-y-1">
                                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1">
                                    <h4 className={`text-sm font-bold uppercase tracking-wider ${isLatest ? 'text-primary' : 'text-foreground/80'}`}>
                                        {scan.status}
                                        {isLatest && <span className="ml-2 text-[8px] bg-primary/20 px-1.5 py-0.5 rounded-full align-middle">Current</span>}
                                    </h4>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {new Date(scan.timestamp).toLocaleString('en-IN', {
                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {scan.location ? `@ ${scan.location}` : info.description}
                                </p>

                                {scan.instructions && (
                                    <p className="text-[10px] italic text-primary/70 mt-1">
                                        "{scan.instructions}"
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )
                })}

                {/* Start Point (Order Placed) */}
                {!sortedScans.find(s => s.status.toLowerCase().includes('picked')) && (
                    <div className="relative group opacity-50">
                        <div className="absolute -left-8 top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center z-10 bg-muted text-muted-foreground">
                            <Package className="w-3 h-3" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Shipment Ready</h4>
                            <p className="text-xs text-muted-foreground">Waiting for pickup by delivery partner.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
