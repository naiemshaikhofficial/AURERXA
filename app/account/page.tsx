'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/app/actions'
import { Loader2, User, MapPin, Package, Edit2, Trash2, Plus, Check, Star, LifeBuoy, Wrench, ShieldCheck } from 'lucide-react'
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
        <div className="min-h-screen bg-background text-foreground">
            <main className="pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-center">My Account</h1>
                    <p className="text-muted-foreground text-center mb-12">{profile?.email}</p>

                    {message && (
                        <div className="mb-6 p-3 bg-primary/10 border border-primary/30 text-primary text-sm text-center flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            {message}
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                        <Link href="/account/orders" className="bg-card border border-border p-6 text-center hover:border-primary/30 transition-all">
                            <Package className="w-8 h-8 mx-auto mb-3 text-primary" />
                            <p className="font-medium">My Orders</p>
                        </Link>
                        <Link href="/wishlist" className="bg-card border border-border p-6 text-center hover:border-primary/30 transition-all">
                            <Star className="w-8 h-8 mx-auto mb-3 text-primary" />
                            <p className="font-medium">Wishlist</p>
                        </Link>
                        <Link href="/help" className="bg-card border border-border p-6 text-center hover:border-primary/30 transition-all">
                            <LifeBuoy className="w-8 h-8 mx-auto mb-3 text-primary" />
                            <p className="font-medium">Help Center</p>
                        </Link>
                        <Link href="/account/repairs" className="bg-card border border-border p-6 text-center hover:border-primary/30 transition-all">
                            <Wrench className="w-8 h-8 mx-auto mb-3 text-primary" />
                            <p className="font-medium">Repair Services</p>
                        </Link>
                        <Link href="/account/certificate" className="bg-card border border-border p-6 text-center hover:border-primary/30 transition-all">
                            <ShieldCheck className="w-8 h-8 mx-auto mb-3 text-primary" />
                            <p className="font-medium">Certificates</p>
                        </Link>
                        <button onClick={handleSignOut} className="bg-card border border-border p-6 text-center hover:border-destructive/30 transition-all">
                            <User className="w-8 h-8 mx-auto mb-3 text-destructive" />
                            <p className="font-medium text-destructive">Sign Out</p>
                        </button>
                    </div>

                    {/* Profile Section */}
                    <div className="bg-card border border-border p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-lg font-medium flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Profile Details
                            </h2>
                            {!editingProfile && (
                                <button onClick={() => setEditingProfile(true)} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            )}
                        </div>

                        {editingProfile ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Full Name</Label>
                                    <Input
                                        value={profileForm.full_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                        className="bg-background border-input text-foreground h-10"
                                    />
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Phone Number</Label>
                                    <Input
                                        value={profileForm.phone_number}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                        className="bg-background border-input text-foreground h-10"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={saving} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                                    </Button>
                                    <Button type="button" onClick={() => setEditingProfile(false)} variant="outline" size="sm" className="border-input hover:bg-muted">
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-2 text-sm">
                                <p><span className="text-muted-foreground">Name:</span> {profile?.full_name || 'Not set'}</p>
                                <p><span className="text-muted-foreground">Email:</span> {profile?.email}</p>
                                <p><span className="text-muted-foreground">Phone:</span> {profile?.phone_number || 'Not set'}</p>
                            </div>
                        )}
                    </div>

                    {/* Addresses Section */}
                    <div className="bg-card border border-border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-lg font-medium flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Saved Addresses ({addresses.length}/5)
                            </h2>
                            {addresses.length < 5 && !showAddressForm && !editingAddressId && (
                                <button onClick={() => setShowAddressForm(true)} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                            )}
                        </div>

                        {(showAddressForm || editingAddressId) && (
                            <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} className="mb-6 p-4 border border-input space-y-4 rounded-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Label</Label>
                                        <Input
                                            value={addressForm.label}
                                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                            placeholder="Home, Office..."
                                            className="bg-background border-input text-foreground h-10"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Full Name</Label>
                                        <Input
                                            value={addressForm.full_name}
                                            onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                            required
                                            className="bg-background border-input text-foreground h-10"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Phone</Label>
                                        <Input
                                            value={addressForm.phone}
                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                            required
                                            className="bg-background border-input text-foreground h-10"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs">Pincode</Label>
                                        <Input
                                            value={addressForm.pincode}
                                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                            required
                                            className="bg-background border-input text-foreground h-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Street Address</Label>
                                    <Input
                                        value={addressForm.street_address}
                                        onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                                        required
                                        className="bg-background border-input text-foreground h-10"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs">City</Label>
                                        <Input
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                            required
                                            className="bg-background border-input text-foreground h-10"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs">State</Label>
                                        <Input
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                            required
                                            className="bg-background border-input text-foreground h-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Country</Label>
                                    <Input
                                        value={addressForm.country}
                                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                        required
                                        className="bg-background border-input text-foreground h-10"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={saving} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAddressId ? 'Update' : 'Save'}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => { setShowAddressForm(false); setEditingAddressId(null); resetAddressForm() }}
                                        variant="outline"
                                        size="sm"
                                        className="border-input hover:bg-muted"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}

                        {addresses.length === 0 && !showAddressForm ? (
                            <p className="text-muted-foreground text-center py-8">No addresses saved yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map((addr) => (
                                    <div key={addr.id} className="p-4 border border-border hover:border-primary/50 transition-all rounded-md">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-foreground">{addr.full_name}</span>
                                                    <span className="text-xs bg-muted px-2 py-0.5 text-muted-foreground rounded-sm">{addr.label}</span>
                                                    {addr.is_default && (
                                                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-sm">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{addr.street_address}</p>
                                                <p className="text-sm text-muted-foreground">{addr.city}, {addr.state}, {addr.country} - {addr.pincode}</p>
                                                <p className="text-sm text-muted-foreground mt-1">Phone: {addr.phone}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!addr.is_default && (
                                                    <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-primary hover:text-primary/80">
                                                        Set Default
                                                    </button>
                                                )}
                                                <button onClick={() => startEditAddress(addr)} className="p-2 text-muted-foreground hover:text-primary">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
