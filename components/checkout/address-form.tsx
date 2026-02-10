'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Country, State, City } from 'country-state-city'
import PhoneInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'
import { Check, ChevronsUpDown, MapPin, Phone, User, Home, Tag, Sparkles, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

import { getPincodeDetails } from '@/app/actions'
import { useCart } from '@/context/cart-context'

interface AddressFormProps {
    initialData?: any
    onSave: (data: any) => void
    onCancel: () => void
    loading?: boolean
}

// Helper to ensure E.164 format for better compatibility with react-phone-number-input
const formatInitialPhone = (phone: string, country: string = 'IN') => {
    if (!phone) return '';
    if (phone.startsWith('+')) return phone;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10 && (country === 'IN' || !country)) return `+91${digits}`;
    if (digits.length > 10) return `+${digits}`;
    return phone;
}

const PhoneInputStyles = () => (
    <style jsx global>{`
        .phone-input-wrapper .PhoneInput {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .phone-input-wrapper .PhoneInputInput {
            background: transparent;
            border: none;
            outline: none;
            color: #f2f2f2;
            font-size: 1rem;
            width: 100%;
            font-family: inherit;
            font-weight: 300;
            text-align: center;
        }
        .phone-input-wrapper .PhoneInputCountry {
            position: relative;
            display: flex;
            align-items: center;
        }
        .phone-input-wrapper .PhoneInputCountrySelectArrow {
            color: #BF9B65;
            margin-left: 8px;
            opacity: 0.6;
        }
        .phone-input-wrapper .PhoneInputCountryIcon {
            width: 28px;
            height: 20px;
            border-radius: 2px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.05);
            background: rgba(255,255,255,0.05);
        }
        .phone-input-wrapper .PhoneInputCountryIconImg {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(191,155,101,0.2);
        }
    `}</style>
)

export function AddressForm({ initialData, onSave, onCancel, loading }: AddressFormProps) {
    const [formData, setFormData] = useState({
        label: initialData?.label || 'Home',
        full_name: initialData?.full_name || '',
        phone: formatInitialPhone(initialData?.phone, initialData?.country),
        street_address: initialData?.street_address || '',
        address_line1: initialData?.address_line1 || (initialData?.street_address?.split(', ')[0] || ''),
        address_line2: initialData?.address_line2 || (initialData?.street_address?.split(', ').slice(1, -1).join(', ') || ''),
        landmark: initialData?.landmark || (initialData?.street_address?.split(', ').slice(-1)[0] || ''),
        city: initialData?.city || '',
        state: initialData?.state || '',
        country: initialData?.country || 'IN',
        pincode: initialData?.pincode || '',
        is_default: initialData?.is_default || false,
    })

    const { items: cartItems } = useCart()
    const [pincodeLoading, setPincodeLoading] = useState(false)

    const [countryOpen, setCountryOpen] = useState(false)
    const [stateOpen, setStateOpen] = useState(false)
    const [cityOpen, setCityOpen] = useState(false)

    const countries = useMemo(() => Country.getAllCountries(), [])
    const states = useMemo(() =>
        formData.country ? State.getStatesOfCountry(formData.country) : [],
        [formData.country])
    const cities = useMemo(() =>
        formData.country && formData.state ? City.getCitiesOfState(formData.country, formData.state) : [],
        [formData.country, formData.state])

    const currentCountry = useMemo(() => countries.find(c => c.isoCode === formData.country), [countries, formData.country])
    const currentState = useMemo(() => states.find(s => s.isoCode === formData.state), [states, formData.state])

    // Pincode auto-detection and estimates
    useEffect(() => {
        let isCancelled = false;

        const detectAddress = async () => {
            if (formData.country === 'IN' && formData.pincode.length === 6) {
                setPincodeLoading(true)
                try {
                    // 1. Get City/State
                    const data = await getPincodeDetails(formData.pincode)
                    if (isCancelled) return;

                    if (data && data[0] && data[0].Status === 'Success') {
                        const postOffice = data[0].PostOffice[0]
                        const cityName = postOffice.District
                        const stateName = postOffice.State

                        const stateObj = states.find(s =>
                            s.name.toLowerCase() === stateName.toLowerCase() ||
                            s.name.toLowerCase().includes(stateName.toLowerCase())
                        )

                        setFormData(prev => ({
                            ...prev,
                            city: cityName,
                            state: stateObj ? stateObj.isoCode : prev.state
                        }))
                    }
                } catch (err) {
                    console.error('Pincode detection error:', err)
                } finally {
                    if (!isCancelled) setPincodeLoading(false)
                }
            }
        }

        detectAddress()

        return () => {
            isCancelled = true;
        }
    }, [formData.pincode, formData.country, states, cartItems])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const stateName = currentState?.name || formData.state
        const countryName = currentCountry?.name || formData.country
        const combinedAddress = [
            formData.address_line1,
            formData.address_line2,
            formData.city,
            stateName,
            countryName,
            formData.pincode
        ].filter(Boolean).join(', ')

        onSave({
            ...formData,
            street_address: combinedAddress
        })
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    }

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 font-sans"
        >
            <PhoneInputStyles />

            <div className="relative pb-4 flex items-center justify-between">
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-primary/30 via-primary/5 to-transparent" />
                <h4 className="font-serif italic text-lg text-primary/80 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Personal Details
                </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="space-y-3 group">
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                            <Tag className="w-3.5 h-3.5" />
                            Address Label
                        </Label>
                        <Input
                            value={formData.label}
                            onChange={(e) => updateField('label', e.target.value)}
                            placeholder="e.g. Home, Office, Studio"
                            className="bg-background/20 border-white/5 text-foreground h-14 rounded-none focus:border-primary/40 focus:ring-0 transition-all placeholder:text-muted-foreground/20 font-light italic text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 text-center"
                        />
                    </div>

                    <div className="space-y-3 group">
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                            <User className="w-3.5 h-3.5" />
                            Full Name
                        </Label>
                        <Input
                            value={formData.full_name}
                            onChange={(e) => updateField('full_name', e.target.value)}
                            required
                            placeholder="Enter your full name"
                            className="bg-background/20 border-white/5 text-foreground h-14 rounded-none focus:border-primary/40 focus:ring-0 transition-all font-light text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 text-center"
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="space-y-3 group">
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                            Phone Number
                        </Label>
                        <div className="phone-input-wrapper border-white/5 border-b border-b-primary/20 transition-all focus-within:border-primary/40 hover:border-primary/30">
                            <PhoneInput
                                international
                                defaultCountry="IN"
                                flags={flags}
                                flagUrl="https://flagcdn.com/{xx}.svg"
                                value={formData.phone}
                                onChange={(val) => updateField('phone', val || '')}
                                className="flex h-14 w-full bg-transparent px-0 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/20 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 group">
                        <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                            Pincode / ZIP
                            {pincodeLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                        </Label>
                        <Input
                            value={formData.pincode}
                            onChange={(e) => updateField('pincode', e.target.value)}
                            required
                            placeholder="e.g. 422001"
                            maxLength={6}
                            className="bg-background/20 border-white/5 text-foreground h-14 rounded-none focus:border-primary/40 focus:ring-0 transition-all font-light text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 text-center"
                        />
                    </div>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-10 pt-4">
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
                            value={formData.address_line1}
                            onChange={(e) => updateField('address_line1', e.target.value)}
                            required
                            placeholder="e.g. House No. 12, AURERXA Residency, Heritage Colony"
                            className="bg-background/20 border-white/5 text-foreground min-h-[100px] rounded-none focus:border-primary/40 focus:ring-0 transition-all font-light text-center py-8 text-base ring-offset-transparent outline-none border-b-primary/20 hover:border-primary/30 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3 group">
                            <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <MapPin className="w-3.5 h-3.5" />
                                Address Line 2
                            </Label>
                            <Input
                                value={formData.address_line2}
                                onChange={(e) => updateField('address_line2', e.target.value)}
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
                                value={formData.landmark}
                                onChange={(e) => updateField('landmark', e.target.value)}
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
                                        className="w-full relative justify-center h-14 rounded-none border-white/5 bg-background/20 font-light text-foreground hover:bg-white/5 transition-all text-base px-12 border-b-primary/20"
                                    >
                                        <span className="truncate">{formData.country ? currentCountry?.name : "Select Country"}</span>
                                        <ChevronsUpDown className="absolute right-4 h-4 w-4 shrink-0 opacity-40 text-primary" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-white/10 bg-[#080808] rounded-none z-[1001] backdrop-blur-xl" align="start">
                                    <Command className="bg-transparent text-zinc-100">
                                        <CommandInput placeholder="Search country..." className="border-white/5 h-12" />
                                        <CommandList className="max-h-[350px] custom-scrollbar">
                                            <CommandEmpty className="text-zinc-500 py-10 text-[10px] uppercase tracking-[0.3em] text-center italic">No destinations found</CommandEmpty>
                                            <CommandGroup>
                                                {countries.map((country) => (
                                                    <CommandItem
                                                        key={country.isoCode}
                                                        value={country.name}
                                                        onSelect={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                country: country.isoCode,
                                                                state: '',
                                                                city: ''
                                                            }))
                                                            setCountryOpen(false)
                                                        }}
                                                        className="cursor-pointer hover:bg-white/5 py-4 transition-colors"
                                                    >
                                                        <Check className={cn("mr-3 h-4 w-4 text-primary", formData.country === country.isoCode ? "opacity-100" : "opacity-0")} />
                                                        <span className="text-sm font-light tracking-wide">{country.name}</span>
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
                                        disabled={!formData.country}
                                        className="w-full relative justify-center h-14 rounded-none border-white/5 bg-background/20 font-light text-foreground disabled:opacity-20 hover:bg-white/5 transition-all text-base px-12 border-b-primary/20"
                                    >
                                        <span className="truncate">{formData.state ? currentState?.name : "Select State"}</span>
                                        <ChevronsUpDown className="absolute right-4 h-4 w-4 shrink-0 opacity-40 text-primary" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-white/10 bg-[#080808] rounded-none z-[1001] backdrop-blur-xl" align="start">
                                    <Command className="bg-transparent text-zinc-100">
                                        <CommandInput placeholder="Search state..." className="border-white/5 h-12" />
                                        <CommandList className="max-h-[350px] custom-scrollbar">
                                            <CommandEmpty className="text-zinc-500 py-10 text-[10px] uppercase tracking-[0.3em] text-center italic">Region not found</CommandEmpty>
                                            <CommandGroup>
                                                {states.map((state) => (
                                                    <CommandItem
                                                        key={state.isoCode}
                                                        value={state.name}
                                                        onSelect={() => {
                                                            setFormData(prev => ({ ...prev, state: state.isoCode, city: '' }))
                                                            setStateOpen(false)
                                                        }}
                                                        className="cursor-pointer hover:bg-white/5 py-4 transition-colors"
                                                    >
                                                        <Check className={cn("mr-3 h-4 w-4 text-primary", formData.state === state.isoCode ? "opacity-100" : "opacity-0")} />
                                                        <span className="text-sm font-light tracking-wide">{state.name}</span>
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
                                        disabled={!formData.state}
                                        className="w-full relative justify-center h-14 rounded-none border-white/5 bg-background/20 font-light text-foreground disabled:opacity-20 hover:bg-white/5 transition-all text-base px-12 border-b-primary/20"
                                    >
                                        <span className="truncate">{formData.city ? formData.city : "Select City"}</span>
                                        <ChevronsUpDown className="absolute right-4 h-4 w-4 shrink-0 opacity-40 text-primary" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-white/10 bg-[#080808] rounded-none z-[1001] backdrop-blur-xl" align="start">
                                    <Command className="bg-transparent text-zinc-100">
                                        <CommandInput placeholder="Search city..." className="border-white/5 h-12" />
                                        <CommandList className="max-h-[350px] custom-scrollbar">
                                            <CommandEmpty className="text-zinc-500 py-10 text-[10px] uppercase tracking-[0.3em] text-center italic">Locality not found</CommandEmpty>
                                            <CommandGroup>
                                                {cities.map((city) => (
                                                    <CommandItem
                                                        key={city.name}
                                                        value={city.name}
                                                        onSelect={() => {
                                                            setFormData(prev => ({ ...prev, city: city.name }))
                                                            setCityOpen(false)
                                                        }}
                                                        className="cursor-pointer hover:bg-white/5 py-4 transition-colors"
                                                    >
                                                        <Check className={cn("mr-3 h-4 w-4 text-primary", formData.city === city.name ? "opacity-100" : "opacity-0")} />
                                                        <span className="text-sm font-light tracking-wide">{city.name}</span>
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

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 pt-12">
                <Button
                    type="submit"
                    disabled={loading}
                    className="relative group overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.4em] px-16 h-16 rounded-none transition-all shadow-2xl hover:shadow-primary/20"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        {loading ? 'Processing...' : initialData?.id ? 'Update Destination' : 'Confirm Destination'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-foreground hover:bg-white/5 uppercase tracking-[0.3em] rounded-none px-10 h-16 transition-all border border-white/5 hover:border-primary/20"
                >
                    Return
                </Button>
            </motion.div>
        </motion.form>
    )
}
