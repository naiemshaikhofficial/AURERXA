'use client'

import React from 'react'
import { MapPin, Home, ChevronsUpDown, Check } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface AddressLocationDetailsProps {
    register: UseFormRegister<any>
    errors: FieldErrors<any>
    country: string
    state: string
    city: string
    countries: any[]
    states: any[]
    cities: any[]
    currentCountry: any
    currentState: any
    setValue: any
    countryOpen: boolean
    setCountryOpen: (open: boolean) => void
    stateOpen: boolean
    setStateOpen: (open: boolean) => void
    cityOpen: boolean
    setCityOpen: (open: boolean) => void
    variants: any
}

export function AddressLocationDetails({
    register,
    errors,
    country,
    state,
    city,
    countries,
    states,
    cities,
    currentCountry,
    currentState,
    setValue,
    countryOpen,
    setCountryOpen,
    stateOpen,
    setStateOpen,
    cityOpen,
    setCityOpen,
    variants
}: AddressLocationDetailsProps) {
    return (
        <motion.div variants={variants} className="space-y-10 pt-4">
            <div className="relative pb-4 flex items-center justify-between">
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-primary/30 via-primary/5 to-transparent" />
                <h4 className="font-serif italic text-lg text-primary/80 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Location Details
                </h4>
            </div>

            <div className="space-y-6">
                <div className="space-y-3 group">
                    <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                        <MapPin className="w-3.5 h-3.5" />
                        Address Line 1 (House No., Building, Area)
                    </Label>
                    <Textarea
                        {...register('address_line1')}
                        placeholder="e.g. House No. 12, AURERXA Residency, Heritage Colony"
                        className={cn(
                            "bg-background/20 border-white/5 text-foreground min-h-[100px] rounded-none focus:border-primary/40 focus:ring-0 transition-all font-light text-center py-8 text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 resize-none",
                            errors.address_line1 && "border-destructive/50"
                        )}
                    />
                    {errors.address_line1 && <p className="text-[9px] text-destructive uppercase tracking-widest font-bold">{errors.address_line1.message as string}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 group">
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                            Address Line 2
                        </Label>
                        <Input
                            {...register('address_line2')}
                            placeholder="e.g. Near Heritage Tower"
                            className="bg-background/20 border-white/5 text-foreground h-14 rounded-none focus:border-primary/40 focus:ring-0 transition-all font-light text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 text-center"
                        />
                    </div>

                    <div className="space-y-3 group">
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                            Landmark
                        </Label>
                        <Input
                            {...register('landmark')}
                            placeholder="e.g. Opp. Gold Market"
                            className="bg-background/20 border-white/5 text-foreground h-14 rounded-none focus:border-primary/40 focus:ring-0 transition-all font-light text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 text-center"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">Country</Label>
                        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full relative justify-center h-14 rounded-none border-white/5 bg-background/20 font-light text-foreground hover:bg-white/5 transition-all text-base px-12 border-b-primary/20",
                                        errors.country && "border-destructive/50"
                                    )}
                                >
                                    <span className="truncate">{country ? currentCountry?.name : "Select Country"}</span>
                                    <ChevronsUpDown className="absolute right-4 h-4 w-4 shrink-0 opacity-40 text-primary" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-white/10 bg-[#080808] rounded-none z-[1001] backdrop-blur-xl" align="start">
                                <Command className="bg-transparent text-zinc-100">
                                    <CommandInput placeholder="Search country..." className="border-white/5 h-12" />
                                    <CommandList className="max-h-[350px] custom-scrollbar">
                                        <CommandEmpty className="text-zinc-500 py-10 text-[10px] uppercase tracking-[0.3em] text-center italic">No destinations found</CommandEmpty>
                                        <CommandGroup>
                                            {countries.map((c) => (
                                                <CommandItem
                                                    key={c.isoCode}
                                                    value={c.name}
                                                    onSelect={() => {
                                                        setValue('country', c.isoCode)
                                                        setValue('state', '')
                                                        setValue('city', '')
                                                        setCountryOpen(false)
                                                    }}
                                                    className="cursor-pointer hover:bg-white/5 py-4 transition-colors"
                                                >
                                                    <Check className={cn("mr-3 h-4 w-4 text-primary", country === c.isoCode ? "opacity-100" : "opacity-0")} />
                                                    <span className="text-sm font-light tracking-wide">{c.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">State</Label>
                        <Popover open={stateOpen} onOpenChange={setStateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    disabled={!country}
                                    className={cn(
                                        "w-full relative justify-center h-14 rounded-none border-white/5 bg-background/20 font-light text-foreground disabled:opacity-20 hover:bg-white/5 transition-all text-base px-12 border-b-primary/20",
                                        errors.state && "border-destructive/50"
                                    )}
                                >
                                    <span className="truncate">{state ? currentState?.name : "Select State"}</span>
                                    <ChevronsUpDown className="absolute right-4 h-4 w-4 shrink-0 opacity-40 text-primary" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-white/10 bg-[#080808] rounded-none z-[1001] backdrop-blur-xl" align="start">
                                <Command className="bg-transparent text-zinc-100">
                                    <CommandInput placeholder="Search state..." className="border-white/5 h-12" />
                                    <CommandList className="max-h-[350px] custom-scrollbar">
                                        <CommandEmpty className="text-zinc-500 py-10 text-[10px] uppercase tracking-[0.3em] text-center italic">Region not found</CommandEmpty>
                                        <CommandGroup>
                                            {states.map((s) => (
                                                <CommandItem
                                                    key={s.isoCode}
                                                    value={s.name}
                                                    onSelect={() => {
                                                        setValue('state', s.isoCode)
                                                        setValue('city', '')
                                                        setStateOpen(false)
                                                    }}
                                                    className="cursor-pointer hover:bg-white/5 py-4 transition-colors"
                                                >
                                                    <Check className={cn("mr-3 h-4 w-4 text-primary", state === s.isoCode ? "opacity-100" : "opacity-0")} />
                                                    <span className="text-sm font-light tracking-wide">{s.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">City</Label>
                        <Popover open={cityOpen} onOpenChange={setCityOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    disabled={!state}
                                    className={cn(
                                        "w-full relative justify-center h-14 rounded-none border-white/5 bg-background/20 font-light text-foreground disabled:opacity-20 hover:bg-white/5 transition-all text-base px-12 border-b-primary/20",
                                        errors.city && "border-destructive/50"
                                    )}
                                >
                                    <span className="truncate">{city ? city : "Select City"}</span>
                                    <ChevronsUpDown className="absolute right-4 h-4 w-4 shrink-0 opacity-40 text-primary" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-white/10 bg-[#080808] rounded-none z-[1001] backdrop-blur-xl" align="start">
                                <Command className="bg-transparent text-zinc-100">
                                    <CommandInput placeholder="Search city..." className="border-white/5 h-12" />
                                    <CommandList className="max-h-[350px] custom-scrollbar">
                                        <CommandEmpty className="text-zinc-500 py-10 text-[10px] uppercase tracking-[0.3em] text-center italic">Locality not found</CommandEmpty>
                                        <CommandGroup>
                                            {cities.map((c) => (
                                                <CommandItem
                                                    key={c.name}
                                                    value={c.name}
                                                    onSelect={() => {
                                                        setValue('city', c.name)
                                                        setCityOpen(false)
                                                    }}
                                                    className="cursor-pointer hover:bg-white/5 py-4 transition-colors"
                                                >
                                                    <Check className={cn("mr-3 h-4 w-4 text-primary", city === c.name ? "opacity-100" : "opacity-0")} />
                                                    <span className="text-sm font-light tracking-wide">{c.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
