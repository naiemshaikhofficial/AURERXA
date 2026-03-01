'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/app/actions'
import { Loader2, User, MapPin, Package, Edit2, Trash2, Plus, Check, Star, LifeBuoy, Wrench, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [addresses, setAddresses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingProfile, setEditingProfile] = useState(false)
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const [profileForm, setProfileForm] = useState({ full_name: '', phone_number: '' })
    const [addressForm, setAddressForm] = useState({
        label: 'Home',
        full_name: '',
        phone: '',
        street_address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        is_default: false
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const [profileData, addressData] = await Promise.all([getProfile(), getAddresses()])
        if (!profileData) {
            router.push('/login')
            return
        }
        setProfile(profileData)
        setProfileForm({ full_name: profileData.full_name || '', phone_number: profileData.phone_number || '' })
        setAddresses(addressData)
        setLoading(false)
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const result = await updateProfile(profileForm)
        if (result.success) {
            setMessage('Profile updated!')
            setEditingProfile(false)
            await loadData()
        }
        setSaving(false)
        setTimeout(() => setMessage(null), 3000)
    }

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const result = await addAddress(addressForm)
        if (result.success) {
            setMessage('Address added!')
            setShowAddressForm(false)
            resetAddressForm()
            await loadData()
        } else {
            setMessage(result.error || 'Failed')
        }
        setSaving(false)
        setTimeout(() => setMessage(null), 3000)
    }

    const handleUpdateAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingAddressId) return
        setSaving(true)
        const result = await updateAddress(editingAddressId, addressForm)
        if (result.success) {
            setMessage('Address updated!')
            setEditingAddressId(null)
            resetAddressForm()
            await loadData()
        }
        setSaving(false)
        setTimeout(() => setMessage(null), 3000)
    }

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Delete this address?')) return
        await deleteAddress(id)
        await loadData()
    }

    const handleSetDefault = async (id: string) => {
        await setDefaultAddress(id)
        await loadData()
    }

    const startEditAddress = (addr: any) => {
        setEditingAddressId(addr.id)
        setAddressForm({
            label: addr.label,
            full_name: addr.full_name,
            phone: addr.phone,
            street_address: addr.street_address,
            city: addr.city,
            state: addr.state,
            country: addr.country || 'India',
            pincode: addr.pincode,
            is_default: addr.is_default
        })
        setShowAddressForm(false)
    }

    const resetAddressForm = () => {
        setAddressForm({
            label: 'Home',
            full_name: '',
            phone: '',
            street_address: '',
            city: '',
            state: '',
            country: 'India',
            pincode: '',
            is_default: false
        })
    }

    const handleSignOut = async () => {
        const { signOut } = await import('@/app/actions')
        await signOut()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <main className="pb-24">
                {/* Premium Hero Header */}
                <div className="relative overflow-hidden border-b border-border bg-muted/30 pt-16 md:pt-24 pb-12 md:pb-16">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,hsl(var(--primary)/0.05),transparent)]" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-serif font-medium tracking-tight mb-2">
                                    Hello, <span className="text-primary italic">{profile?.full_name?.split(' ')[0] || 'Member'}</span>
                                </h1>
                                <p className="text-muted-foreground font-light tracking-wide uppercase text-[10px] md:text-xs">
                                    {profile?.email} • <span className="text-primary font-medium">AURERXA LUXE</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 md:px-6 py-2 border border-border hover:bg-foreground hover:text-background transition-all text-[10px] uppercase tracking-widest font-medium"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <nav className="sticky top-24 space-y-2">
                                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4 px-4 font-bold">Account Settings</div>
                                <button onClick={() => { setEditingProfile(false); setShowAddressForm(false) }} className="w-full text-left px-4 py-3 rounded-none border-l-2 border-primary bg-primary/5 text-primary text-sm font-medium transition-all">
                                    Dashboard
                                </button>
                                <button onClick={() => setEditingProfile(true)} className="w-full text-left px-4 py-3 rounded-none border-l-2 border-transparent hover:border-border hover:bg-muted text-foreground/70 hover:text-foreground text-sm transition-all font-light">
                                    Login & Security
                                </button>
                                <button onClick={() => setShowAddressForm(true)} className="w-full text-left px-4 py-3 rounded-none border-l-2 border-transparent hover:border-border hover:bg-muted text-foreground/70 hover:text-foreground text-sm transition-all font-light">
                                    Saved Addresses
                                </button>
                                <Link href="/account/orders" className="block px-4 py-3 rounded-none border-l-2 border-transparent hover:border-border hover:bg-muted text-foreground/70 hover:text-foreground text-sm transition-all font-light">
                                    Order History
                                </Link>
                                <Link href="/wishlist" className="block px-4 py-3 rounded-none border-l-2 border-transparent hover:border-border hover:bg-muted text-foreground/70 hover:text-foreground text-sm transition-all font-light">
                                    Your Wishlist
                                </Link>
                                <div className="pt-8 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4 px-4 font-bold">Support</div>
                                <Link href="/account/repairs" className="block px-4 py-3 rounded-none border-l-2 border-transparent hover:border-border hover:bg-muted text-foreground/70 hover:text-foreground text-sm transition-all font-light">
                                    Repair Tracker
                                </Link>
                                <Link href="/help" className="block px-4 py-3 rounded-none border-l-2 border-transparent hover:border-border hover:bg-muted text-foreground/70 hover:text-foreground text-sm transition-all font-light">
                                    Contact Luxury Concierge
                                </Link>
                            </nav>
                        </aside>

                        <div className="flex-1 min-w-0">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8 p-4 bg-primary/5 border border-primary/20 text-primary text-sm tracking-wide text-center flex items-center justify-center gap-3 backdrop-blur-sm"
                                >
                                    <Check className="w-4 h-4" />
                                    {message}
                                </motion.div>
                            )}

                            {/* Amazon-style Luxury Grid - 3x3 on Mobile */}
                            <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-12">
                                {/* Your Orders */}
                                <Link href="/account/orders" className="group">
                                    <div className="h-full bg-muted/20 border border-border p-3 md:p-8 hover:border-primary/40 transition-all duration-500 relative overflow-hidden flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity hidden md:block">
                                            <Package size={120} />
                                        </div>
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-primary/20 flex items-center justify-center mb-2 md:mb-6 group-hover:scale-110 transition-transform duration-500 bg-background/50">
                                            <Package className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                                        </div>
                                        <h3 className="text-[10px] md:text-xl font-serif font-medium leading-tight">Orders</h3>
                                        <p className="hidden md:block text-muted-foreground text-sm font-light leading-relaxed mt-1">Track or buy items again</p>
                                    </div>
                                </Link>

                                {/* Login & Security */}
                                <div className="group cursor-pointer" onClick={() => setEditingProfile(!editingProfile)}>
                                    <div className="h-full bg-muted/20 border border-border p-3 md:p-8 hover:border-primary/40 transition-all duration-500 relative overflow-hidden flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity hidden md:block">
                                            <User size={120} />
                                        </div>
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-primary/20 flex items-center justify-center mb-2 md:mb-6 group-hover:scale-110 transition-transform duration-500 bg-background/50">
                                            <User className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                                        </div>
                                        <h3 className="text-[10px] md:text-xl font-serif font-medium leading-tight">Security</h3>
                                        <p className="hidden md:block text-muted-foreground text-sm font-light leading-relaxed mt-1">Edit login and profile</p>
                                    </div>
                                </div>

                                {/* Your Addresses */}
                                <div className="group cursor-pointer" onClick={() => setShowAddressForm(true)}>
                                    <div className="h-full bg-muted/20 border border-border p-3 md:p-8 hover:border-primary/40 transition-all duration-500 relative overflow-hidden flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity hidden md:block">
                                            <MapPin size={120} />
                                        </div>
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-primary/20 flex items-center justify-center mb-2 md:mb-6 group-hover:scale-110 transition-transform duration-500 bg-background/50">
                                            <MapPin className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                                        </div>
                                        <h3 className="text-[10px] md:text-xl font-serif font-medium leading-tight">Address</h3>
                                        <p className="hidden md:block text-muted-foreground text-sm font-light leading-relaxed mt-1">Shipping details</p>
                                    </div>
                                </div>

                                {/* Wishlist */}
                                <Link href="/wishlist" className="group">
                                    <div className="h-full bg-muted/20 border border-border p-3 md:p-8 hover:border-primary/40 transition-all duration-500 relative overflow-hidden flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity hidden md:block">
                                            <Star size={120} />
                                        </div>
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-primary/20 flex items-center justify-center mb-2 md:mb-6 group-hover:scale-110 transition-transform duration-500 bg-background/50">
                                            <Star className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                                        </div>
                                        <h3 className="text-[10px] md:text-xl font-serif font-medium leading-tight">Wishlist</h3>
                                        <p className="hidden md:block text-muted-foreground text-sm font-light leading-relaxed mt-1">Saved treasures</p>
                                    </div>
                                </Link>

                                {/* Repair Services */}
                                <Link href="/account/repairs" className="group">
                                    <div className="h-full bg-muted/20 border border-border p-3 md:p-8 hover:border-primary/40 transition-all duration-500 relative overflow-hidden flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity hidden md:block">
                                            <Wrench size={120} />
                                        </div>
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-primary/20 flex items-center justify-center mb-2 md:mb-6 group-hover:scale-110 transition-transform duration-500 bg-background/50">
                                            <Wrench className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                                        </div>
                                        <h3 className="text-[10px] md:text-xl font-serif font-medium leading-tight">Repairs</h3>
                                        <p className="hidden md:block text-muted-foreground text-sm font-light leading-relaxed mt-1">Service & Care</p>
                                    </div>
                                </Link>

                                {/* Help Center */}
                                <Link href="/help" className="group">
                                    <div className="h-full bg-muted/20 border border-border p-3 md:p-8 hover:border-primary/40 transition-all duration-500 relative overflow-hidden flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity hidden md:block">
                                            <LifeBuoy size={120} />
                                        </div>
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-primary/20 flex items-center justify-center mb-2 md:mb-6 group-hover:scale-110 transition-transform duration-500 bg-background/50">
                                            <LifeBuoy className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                                        </div>
                                        <h3 className="text-[10px] md:text-xl font-serif font-medium leading-tight">Concierge</h3>
                                        <p className="hidden md:block text-muted-foreground text-sm font-light leading-relaxed mt-1">Support & Help</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Dynamic Section: Profile / Security */}
                            {(editingProfile || profile) && (
                                <div className="mb-12">
                                    <div className="bg-muted/10 border border-border animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
                                        <div className="p-6 md:p-8 border-b border-border flex items-center justify-between">
                                            <h2 className="text-xl md:text-2xl font-serif">Account Information</h2>
                                            {!editingProfile && (
                                                <button
                                                    onClick={() => setEditingProfile(true)}
                                                    className="text-primary text-[10px] uppercase tracking-widest hover:underline font-bold"
                                                >
                                                    Update
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-6 md:p-8">
                                            {editingProfile ? (
                                                <form onSubmit={handleUpdateProfile} className="max-w-md space-y-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label className="text-muted-foreground text-[10px] uppercase tracking-widest mb-2 block">Full Name</Label>
                                                            <Input
                                                                value={profileForm.full_name}
                                                                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                                                className="bg-background border-border text-foreground focus:border-primary/50 transition-colors h-12 px-4 rounded-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-muted-foreground text-[10px] uppercase tracking-widest mb-2 block">Phone Number</Label>
                                                            <Input
                                                                value={profileForm.phone_number}
                                                                onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                                                className="bg-background border-border text-foreground focus:border-primary/50 transition-colors h-12 px-4 rounded-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 pt-2">
                                                        <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 px-8 rounded-none">
                                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Account'}
                                                        </Button>
                                                        <Button type="button" onClick={() => setEditingProfile(false)} variant="ghost" className="text-muted-foreground h-12 hover:text-foreground rounded-none">
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Name</p>
                                                        <p className="text-base md:text-lg font-serif">{profile?.full_name || 'Not set'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Email Address</p>
                                                        <p className="text-base md:text-lg font-serif">{profile?.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Phone</p>
                                                        <p className="text-base md:text-lg font-serif">{profile?.phone_number || 'Not set'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dynamic Section: Addresses */}
                            <div className="mb-12" id="addresses-section">
                                <div className="bg-muted/10 border border-border animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="p-6 md:p-8 border-b border-border flex items-center justify-between">
                                        <h2 className="text-xl md:text-2xl font-serif">Shipping Addresses</h2>
                                        {addresses.length < 5 && !showAddressForm && !editingAddressId && (
                                            <button
                                                onClick={() => setShowAddressForm(true)}
                                                className="bg-primary/10 text-primary border border-primary/20 px-3 md:px-4 py-1.5 text-[8px] md:text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all rounded-sm font-bold"
                                            >
                                                Add New
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-6 md:p-8">
                                        {(showAddressForm || editingAddressId) && (
                                            <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} className="mb-12 max-w-2xl space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground text-[10px] uppercase tracking-widest">Address Label</Label>
                                                        <Input
                                                            value={addressForm.label}
                                                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                                            placeholder="Home, Office, etc."
                                                            className="bg-background border-border rounded-none h-12"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground text-[10px] uppercase tracking-widest">Full Name</Label>
                                                        <Input
                                                            value={addressForm.full_name}
                                                            onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                                            required
                                                            className="bg-background border-border rounded-none h-12"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground text-[10px] uppercase tracking-widest">Phone Number</Label>
                                                        <Input
                                                            value={addressForm.phone}
                                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                            required
                                                            className="bg-background border-border rounded-none h-12"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground text-[10px] uppercase tracking-widest">Pincode</Label>
                                                        <Input
                                                            value={addressForm.pincode}
                                                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                            required
                                                            className="bg-background border-border rounded-none h-12"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-muted-foreground text-[10px] uppercase tracking-widest">Street Address / Landmark</Label>
                                                    <Input
                                                        value={addressForm.street_address}
                                                        onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                                                        required
                                                        className="bg-background border-border rounded-none h-12"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground text-[10px] uppercase tracking-widest">City</Label>
                                                        <Input
                                                            value={addressForm.city}
                                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                            required
                                                            className="bg-background border-border rounded-none h-12"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-muted-foreground text-[10px] uppercase tracking-widest">State</Label>
                                                        <Input
                                                            value={addressForm.state}
                                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                            required
                                                            className="bg-background border-border rounded-none h-12"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 sm:col-span-1 col-span-2">
                                                        <Label className="text-muted-foreground text-[10px] uppercase tracking-widest">Country</Label>
                                                        <Input
                                                            value={addressForm.country}
                                                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                            required
                                                            className="bg-background border-border rounded-none h-12"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 pt-4">
                                                    <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-none h-12 font-medium">
                                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAddressId ? 'Save Changes' : 'Add Address'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => { setShowAddressForm(false); setEditingAddressId(null); resetAddressForm() }}
                                                        variant="ghost"
                                                        className="text-muted-foreground h-12 rounded-none hover:text-foreground"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        )}

                                        {addresses.length === 0 && !showAddressForm ? (
                                            <div className="text-center py-16">
                                                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                                <p className="text-muted-foreground font-light tracking-wide">No saved addresses found.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                {addresses.map((addr) => (
                                                    <div key={addr.id} className="p-5 md:p-6 bg-background border border-border hover:border-primary/20 transition-all group flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <span className="font-serif text-lg">{addr.full_name}</span>
                                                                <span className="text-[10px] uppercase tracking-[0.2em] bg-muted px-2 py-0.5 text-muted-foreground font-medium">
                                                                    {addr.label}
                                                                </span>
                                                                {addr.is_default && (
                                                                    <span className="text-[10px] uppercase tracking-[0.2em] border border-primary/40 text-primary px-2 py-0.5 font-medium">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1 text-sm text-muted-foreground font-light leading-relaxed">
                                                                <p>{addr.street_address}</p>
                                                                <p>{addr.city}, {addr.state} {addr.pincode}</p>
                                                                <p className="pt-2">{addr.country}</p>
                                                                <p className="text-muted-foreground/40 text-[10px] mt-2 tracking-widest uppercase">Mobile: {addr.phone}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border opacity-60 group-hover:opacity-100 transition-opacity">
                                                            {!addr.is_default && (
                                                                <button
                                                                    onClick={() => handleSetDefault(addr.id)}
                                                                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-medium"
                                                                >
                                                                    Default
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => startEditAddress(addr)}
                                                                className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAddress(addr.id)}
                                                                className="text-[10px] uppercase tracking-widest text-destructive/70 hover:text-destructive transition-colors font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
