'use client'

import React from 'react'
import { Tag, User, Sparkles } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface AddressPersonalDetailsProps {
    register: UseFormRegister<any>
    errors: FieldErrors<any>
    variants: any
}

export function AddressPersonalDetails({ register, errors, variants }: AddressPersonalDetailsProps) {
    return (
        <motion.div variants={variants} className="space-y-10">
            <div className="relative pb-4 flex items-center justify-between">
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-primary/30 via-primary/5 to-transparent" />
                <h4 className="font-serif italic text-lg text-primary/80 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Personal Details
                </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3 group">
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                        <Tag className="w-3.5 h-3.5" />
                        Address Label
                    </Label>
                    <Input
                        {...register('label')}
                        placeholder="e.g. Home, Office, Studio"
                        className={cn(
                            "bg-background/20 border-white/5 text-foreground h-14 rounded-none focus:border-primary/40 focus:ring-0 transition-all placeholder:text-muted-foreground/20 font-light italic text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 text-center",
                            errors.label && "border-destructive/50"
                        )}
                    />
                    {errors.label && <p className="text-[9px] text-destructive uppercase tracking-widest font-bold">{errors.label.message as string}</p>}
                </div>

                <div className="space-y-3 group">
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                        <User className="w-3.5 h-3.5" />
                        Full Name
                    </Label>
                    <Input
                        {...register('full_name')}
                        placeholder="Enter your full name"
                        className={cn(
                            "bg-background/20 border-white/5 text-foreground h-14 rounded-none focus:border-primary/40 focus:ring-0 transition-all font-light text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 text-center",
                            errors.full_name && "border-destructive/50"
                        )}
                    />
                    {errors.full_name && <p className="text-[9px] text-destructive uppercase tracking-widest font-bold">{errors.full_name.message as string}</p>}
                </div>
            </div>
        </motion.div>
    )
}
