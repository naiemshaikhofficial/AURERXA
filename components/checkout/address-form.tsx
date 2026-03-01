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
import { useConsent } from '@/context/consent-context'

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

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const addressSchema = z.object({
    label: z.string().min(1, 'Label is required'),
    full_name: z.string().min(2, 'Full name is required'),
    phone: z.string().min(10, 'Invalid phone number'),
    pincode: z.string().length(6, 'Pincode must be 6 digits'),
    address_line1: z.string().min(5, 'Address is too short'),
    address_line2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().min(2, 'Country is required'),
    is_default: z.boolean().default(false),
})

type AddressValues = z.infer<typeof addressSchema>

import { AddressPersonalDetails } from './address-personal-details'
import { AddressContactDetails } from './address-contact-details'
import { AddressLocationDetails } from './address-location-details'

export function AddressForm({ initialData, onSave, onCancel, loading }: AddressFormProps) {
    const { items: cartItems } = useCart()
    const { consentStatus, userDetails, updateUserDetails } = useConsent()
    const [pincodeLoading, setPincodeLoading] = useState(false)
    const [countryOpen, setCountryOpen] = useState(false)
    const [stateOpen, setStateOpen] = useState(false)
    const [cityOpen, setCityOpen] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AddressValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            label: initialData?.label || 'Home',
            full_name: initialData?.full_name || userDetails.name || '',
            phone: formatInitialPhone(initialData?.phone || userDetails.phone, initialData?.country),
            pincode: initialData?.pincode || '',
            address_line1: initialData?.address_line1 || (initialData?.street_address?.split(', ')[0] || ''),
            address_line2: initialData?.address_line2 || (initialData?.street_address?.split(', ').slice(1, -1).join(', ') || ''),
            landmark: initialData?.landmark || (initialData?.street_address?.split(', ').slice(-1)[0] || ''),
            city: initialData?.city || '',
            state: initialData?.state || '',
            country: initialData?.country || 'IN',
            is_default: initialData?.is_default || false,
        }
    })

    const formData = watch()

    const countries = useMemo(() => Country.getAllCountries(), [])
    const states = useMemo(() =>
        formData.country ? State.getStatesOfCountry(formData.country) : [],
        [formData.country])
    const cities = useMemo(() =>
        formData.country && formData.state ? City.getCitiesOfState(formData.country, formData.state) : [],
        [formData.country, formData.state])

    const currentCountry = useMemo(() => countries.find(c => c.isoCode === formData.country), [countries, formData.country])
    const currentState = useMemo(() => states.find(s => s.isoCode === formData.state), [states, formData.state])

    // Pincode auto-detection
    useEffect(() => {
        let isCancelled = false;
        const detectAddress = async () => {
            if (formData.country === 'IN' && formData.pincode.length === 6) {
                setPincodeLoading(true)
                try {
                    const data = await getPincodeDetails(formData.pincode)
                    if (isCancelled) return;

                    if (data && data.success) {
                        if (data.city) setValue('city', data.city)
                        if (data.stateCode) setValue('state', data.stateCode)
                    }
                } catch (err) {
                    console.error('Pincode detection error:', err)
                } finally {
                    if (!isCancelled) setPincodeLoading(false)
                }
            }
        }
        detectAddress()
        return () => { isCancelled = true }
    }, [formData.pincode, formData.country, states, setValue])

    const onAddressSubmit = (data: AddressValues) => {
        const stateName = currentState?.name || data.state
        const countryName = currentCountry?.name || data.country
        const combinedAddress = [
            data.address_line1,
            data.address_line2,
            data.landmark,
            data.city,
            stateName,
            data.pincode,
            countryName
        ].filter(Boolean).join(', ')

        const savePayload = {
            ...data,
            street_address: combinedAddress,
        }

        if (consentStatus === 'granted') {
            updateUserDetails({
                name: data.full_name,
                phone: data.phone
            })
        }

        onSave(savePayload)
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

    return (
        <motion.form
            onSubmit={handleSubmit(onAddressSubmit)}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 font-sans"
        >
            <PhoneInputStyles />

            <AddressPersonalDetails register={register} errors={errors} variants={itemVariants} />

            <AddressContactDetails
                register={register}
                errors={errors}
                phone={formData.phone}
                setPhone={(val) => setValue('phone', val)}
                pincodeLoading={pincodeLoading}
                variants={itemVariants}
            />

            <AddressLocationDetails
                register={register}
                errors={errors}
                country={formData.country}
                state={formData.state}
                city={formData.city}
                countries={countries}
                states={states}
                cities={cities}
                currentCountry={currentCountry}
                currentState={currentState}
                setValue={setValue}
                countryOpen={countryOpen}
                setCountryOpen={setCountryOpen}
                stateOpen={stateOpen}
                setStateOpen={setStateOpen}
                cityOpen={cityOpen}
                setCityOpen={setCityOpen}
                variants={itemVariants}
            />

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
