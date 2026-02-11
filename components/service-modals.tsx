'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { submitVirtualTryOn, submitGoldHarvest, submitJewelryCare, submitBoutiqueVisit } from '@/app/actions/services'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Success Modal Component
function SuccessView({ title, message, onClose }: { title: string, message: string, onClose: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 className="text-xl font-serif text-[#D4AF37]">{title}</h3>
            <p className="text-white/70 max-w-xs mx-auto">{message}</p>
            <Button onClick={onClose} className="mt-4 bg-[#D4AF37] text-black hover:bg-[#B5952F]">
                Done
            </Button>
        </div>
    )
}

export function VirtualTryOnModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await submitVirtualTryOn(formData)
        setLoading(false)

        if (res.success) {
            setSuccess(true)
        } else {
            toast.error(res.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#111111] border-white/10 text-white sm:max-w-[425px]">
                {!success ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-[#D4AF37] font-serif text-2xl">Virtual Try-On</DialogTitle>
                            <DialogDescription className="text-white/60">
                                Experience our jewelry from anywhere. Schedule a session.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" type="tel" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Preferred Date</Label>
                                    <Input id="date" name="date" type="date" className="bg-white/5 border-white/10 focus:border-[#D4AF37] [color-scheme:dark]" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="time">Preferred Time</Label>
                                    <Input id="time" name="time" type="time" className="bg-white/5 border-white/10 focus:border-[#D4AF37] [color-scheme:dark]" />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-black hover:bg-[#B5952F] mt-2">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Request Session'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <SuccessView
                        title="Request Sent"
                        message="We have received your request. Our team will contact you shortly to confirm the session."
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

export function GoldHarvestModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await submitGoldHarvest(formData)
        setLoading(false)

        if (res.success) {
            setSuccess(true)
        } else {
            toast.error(res.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#111111] border-white/10 text-white sm:max-w-[425px]">
                {!success ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-[#D4AF37] font-serif text-2xl">Gold Harvest Scheme</DialogTitle>
                            <DialogDescription className="text-white/60">
                                Join our exclusive saving scheme. Secure your future in gold.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" type="tel" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Monthly Investment Amount (Estim.)</Label>
                                <Input id="amount" name="amount" type="number" placeholder="₹" className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-black hover:bg-[#B5952F] mt-2">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Interest'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <SuccessView
                        title="Interest Registered"
                        message="Thank you for your interest in Gold Harvest. Our advisor will get in touch with you."
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

export function JewelryCareModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await submitJewelryCare(formData)
        setLoading(false)

        if (res.success) {
            setSuccess(true)
        } else {
            toast.error(res.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#111111] border-white/10 text-white sm:max-w-[425px]">
                {!success ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-[#D4AF37] font-serif text-2xl">Jewelry Care</DialogTitle>
                            <DialogDescription className="text-white/60">
                                Professional cleaning and inspection services.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" type="tel" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="serviceType">Service Type</Label>
                                <Select name="serviceType" defaultValue="cleaning">
                                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-[#D4AF37]">
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                        <SelectItem value="cleaning">Professional Cleaning</SelectItem>
                                        <SelectItem value="inspection">Stone Inspection</SelectItem>
                                        <SelectItem value="repair">Minor Repair</SelectItem>
                                        <SelectItem value="polishing">Polishing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Preferred Date</Label>
                                <Input id="date" name="date" type="date" className="bg-white/5 border-white/10 focus:border-[#D4AF37] [color-scheme:dark]" />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-black hover:bg-[#B5952F] mt-2">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Book Service'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <SuccessView
                        title="Service Booked"
                        message="Your appointment request has been sent. We look forward to serving you."
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

export function BoutiqueVisitModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await submitBoutiqueVisit(formData)
        setLoading(false)

        if (res.success) {
            setSuccess(true)
        } else {
            toast.error(res.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#111111] border-white/10 text-white sm:max-w-[425px]">
                {!success ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-[#D4AF37] font-serif text-2xl">Personalized Visit</DialogTitle>
                            <DialogDescription className="text-white/60">
                                Schedule a private consultation at our boutique.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" type="tel" required className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Preferred Date</Label>
                                    <Input id="date" name="date" type="date" className="bg-white/5 border-white/10 focus:border-[#D4AF37] [color-scheme:dark]" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="time">Preferred Time</Label>
                                    <Input id="time" name="time" type="time" className="bg-white/5 border-white/10 focus:border-[#D4AF37] [color-scheme:dark]" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="purpose">Reason for Visit</Label>
                                <Textarea id="purpose" name="purpose" placeholder="e.g. Wedding Shopping, Solitaire Selection..." className="bg-white/5 border-white/10 focus:border-[#D4AF37]" />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-black hover:bg-[#B5952F] mt-2">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Appointment'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <SuccessView
                        title="Appointment Confirmed"
                        message="Your visit is scheduled. We are prepared to welcome you."
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
