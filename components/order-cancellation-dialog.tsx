'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle, ShieldCheck, Scale } from 'lucide-react'
import { cancelOrder } from '@/app/actions'
import { toast } from 'sonner'

interface OrderCancellationDialogProps {
    orderId: string
    orderNumber: string
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

const CANCELLATION_REASONS = [
    "Changed my mind",
    "Incorrect product selected",
    "Incorrect shipping address",
    "Found a better price elsewhere",
    "Delivery date is too late",
    "Order placed by mistake",
    "Other"
]

export function OrderCancellationDialog({
    orderId,
    orderNumber,
    isOpen,
    onClose,
    onSuccess
}: OrderCancellationDialogProps) {
    const [reason, setReason] = useState('')
    const [otherReason, setOtherReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCancel = async () => {
        if (!reason) {
            toast.error('Please select a reason for cancellation')
            return
        }

        if (reason === 'Other' && !otherReason.trim()) {
            toast.error('Please specify the reason for cancellation')
            return
        }

        const finalReason = reason === 'Other' ? `Other: ${otherReason.trim()}` : reason

        setIsSubmitting(true)
        try {
            const result = await cancelOrder(orderId, finalReason)
            if (result.success) {
                toast.success(result.message)
                onSuccess()
                onClose()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-background border-border">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif text-foreground">Cancel Order #{orderNumber}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        We're sorry to see you cancel your luxury acquisition. Please help us improve by selecting a reason.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Reason Selection - Compact Grid */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Select Reason</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CANCELLATION_REASONS.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setReason(r)}
                                    className={`text-left px-3 py-2 text-[11px] border transition-all ${reason === r
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border hover:border-primary/50 text-muted-foreground'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Other Reason Input */}
                    {reason === 'Other' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Please specify the reason</label>
                            <textarea
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                placeholder="Tell us more about why you're cancelling..."
                                className="w-full p-3 bg-background border border-input text-foreground text-sm focus:outline-none focus:border-primary resize-none min-h-[80px]"
                                required
                            />
                        </div>
                    )}

                    {/* Combined Policy Section - Compact */}
                    <div className="pt-4 border-t border-border space-y-3">
                        <div className="flex items-start gap-2.5 p-3 bg-muted/30 border border-border/50">
                            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">Luxury Advisory</p>
                                <p className="text-[10px] text-muted-foreground leading-snug">
                                    Cancellations only before shipment. Returns **ONLY for defective pieces** with forensic inspection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-2 border-t border-border flex flex-row items-center justify-end gap-3 sm:gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="h-9 px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                        disabled={isSubmitting}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancel}
                        className="h-9 px-6 bg-destructive hover:bg-destructive/90 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-destructive/10"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            'Cancel Order'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
