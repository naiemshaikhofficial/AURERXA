'use client'

import React from 'react'
import { Phone, MapPin, Loader2 } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import PhoneInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface AddressContactDetailsProps {
    register: UseFormRegister<any>
    errors: FieldErrors<any>
    phone: string
    setPhone: (val: string) => void
    pincodeLoading: boolean
    variants: any
}

export function AddressContactDetails({ register, errors, phone, setPhone, pincodeLoading, variants }: AddressContactDetailsProps) {
    return (
        <motion.div variants={variants} className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5 pt-10">
            <div className="space-y-3 group">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    Phone Number
                </Label>
                <div className={cn(
                    "phone-input-wrapper border-white/5 border-b border-b-primary/20 transition-all focus-within:border-primary/40 hover:border-primary/30",
                    errors.phone && "border-destructive/50"
                )}>
                    <PhoneInput
                        international
                        defaultCountry="IN"
                        flags={flags}
                        flagUrl="https://flagcdn.com/{xx}.svg"
                        value={phone}
                        onChange={(val) => setPhone(val || '')}
                        className="flex h-14 w-full bg-transparent px-0 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/20 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                {errors.phone && <p className="text-[9px] text-destructive uppercase tracking-widest font-bold">{errors.phone.message as string}</p>}
            </div>

            <div className="space-y-3 group">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                    <MapPin className="w-3.5 h-3.5" />
                    Pincode / ZIP
                    {pincodeLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                </Label>
                <Input
                    {...register('pincode')}
                    placeholder="e.g. 422001"
                    maxLength={6}
                    className={cn(
                        "bg-background/20 border-white/5 text-foreground h-14 rounded-none focus:border-primary/40 focus:ring-0 transition-all font-light text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 text-center",
                        errors.pincode && "border-destructive/50"
                    )}
                />
                {errors.pincode && <p className="text-[9px] text-destructive uppercase tracking-widest font-bold">{errors.pincode.message as string}</p>}
            </div>
        </motion.div>
    )
}
