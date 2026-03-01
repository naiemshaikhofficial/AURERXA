'use client'

import React from 'react'
import { Building2, User, Mail, Phone, FileText, MessageSquare } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface BulkBusinessDetailsProps {
    register: UseFormRegister<any>
    errors: FieldErrors<any>
}

export function BulkBusinessDetails({ register, errors }: BulkBusinessDetailsProps) {
    return (
        <div className="bg-card/30 border border-border p-6 md:p-8 rounded-sm">
            <h2 className="text-[10px] font-premium-sans text-primary/80 tracking-[0.2em] mb-6 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                BUSINESS DETAILS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5 font-bold">
                        <Building2 className="w-3 h-3" /> BUSINESS NAME *
                    </label>
                    <input
                        type="text"
                        {...register('businessName')}
                        placeholder="Your Company Name"
                        className={`w-full bg-background border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm ${errors.businessName ? 'border-destructive/50' : 'border-border'}`}
                    />
                    {errors.businessName && <p className="text-[9px] text-destructive uppercase tracking-widest font-bold">{errors.businessName.message as string}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5 font-bold">
                        <User className="w-3 h-3" /> CONTACT PERSON *
                    </label>
                    <input
                        type="text"
                        {...register('contactName')}
                        placeholder="Full Name"
                        className={`w-full bg-background border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm ${errors.contactName ? 'border-destructive/50' : 'border-border'}`}
                    />
                    {errors.contactName && <p className="text-[9px] text-destructive uppercase tracking-widest font-bold">{errors.contactName.message as string}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5 font-bold">
                        <Mail className="w-3 h-3" /> EMAIL *
                    </label>
                    <input
                        type="email"
                        {...register('email')}
                        placeholder="business@example.com"
                        className={`w-full bg-background border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm ${errors.email ? 'border-destructive/50' : 'border-border'}`}
                    />
                    {errors.email && <p className="text-[9px] text-destructive uppercase tracking-widest font-bold">{errors.email.message as string}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5 font-bold">
                        <Phone className="w-3 h-3" /> PHONE *
                    </label>
                    <input
                        type="tel"
                        {...register('phone')}
                        placeholder="+91 9XXXXXXXXX"
                        className={`w-full bg-background border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm ${errors.phone ? 'border-destructive/50' : 'border-border'}`}
                    />
                    {errors.phone && <p className="text-[9px] text-destructive uppercase tracking-widest font-bold">{errors.phone.message as string}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5 font-bold">
                        <FileText className="w-3 h-3" /> GST NUMBER
                    </label>
                    <input
                        type="text"
                        {...register('gstNumber')}
                        placeholder="Optional"
                        className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5 font-bold">
                        <MessageSquare className="w-3 h-3" /> NOTES
                    </label>
                    <input
                        type="text"
                        {...register('message')}
                        placeholder="Special requirements..."
                        className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm"
                    />
                </div>
            </div>
        </div>
    )
}
