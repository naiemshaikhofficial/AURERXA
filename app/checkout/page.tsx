'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAddresses, addAddress, createOrder, validateCoupon } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import { Loader2, Plus, MapPin, Check, CreditCard, Banknote, ChevronRight, Tag, Gift, X, AlertCircle, Clock } from 'lucide-react'
import { DeliveryEstimate } from '@/components/delivery-checker'


import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login?redirect=/checkout')
            }
        }
        checkAuth()
    }, [])

    const { items: cart, loading: cartLoading, refreshCart } = useCart()
    const [addresses, setAddresses] = useState<any[]>([])
    const [selectedAddress, setSelectedAddress] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<string>('online')
    const [loading, setLoading] = useState(true)
    const [termsAccepted, setTermsAccepted] = useState(true)
    const [placing, setPlacing] = useState(false)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [shippingCharge, setShippingCharge] = useState<number>(90)
    const [shippingLoading, setShippingLoading] = useState(false)

    // Coupon state
    const [couponCode, setCouponCode] = useState('')
    const [couponApplied, setCouponApplied] = useState<any>(null)
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponError, setCouponError] = useState<string | null>(null)

    // Gift wrap state
    const [giftWrap, setGiftWrap] = useState(false)
    const [giftMessage, setGiftMessage] = useState('')
    const GIFT_WRAP_PRICE = 199

    // Delivery time slot state
    const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('anytime')

    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        full_name: '',
        phone: '',
        street_address: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
    })

    useEffect(() => {
        refreshCart()
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const addressData = await getAddresses()
        setAddresses(addressData)
        if (addressData.length > 0) {
            const defaultAddr = addressData.find((a: any) => a.is_default) || addressData[0]
            setSelectedAddress(defaultAddr.id)
            updateShippingRate(defaultAddr.pincode)
        }
        setLoading(false)
    }

    const updateShippingRate = async (pincode: string) => {
        if (!pincode || cart.length === 0) return
        setShippingLoading(true)
        try {
            const { calculateShippingRate } = await import('@/app/actions')
            const res = await calculateShippingRate(pincode, cart)
            if (res.success) {
                setShippingCharge(res.rate)
            }
        } catch (err) {
            console.error('Failed to update shipping rate:', err)
        } finally {
            setShippingLoading(false)
        }
    }

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        const result = await addAddress(newAddress)
        if (result.success) {
            await loadData()
            setShowAddressForm(false)
            setNewAddress({
                label: 'Home',
                full_name: '',
                phone: '',
                street_address: '',
                city: '',
                state: '',
                pincode: '',
                is_default: false
            })
        } else {
            setError(result.error || 'Failed to add address')
        }
    }

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return

        setCouponLoading(true)
        setCouponError(null)

        const result = await validateCoupon(couponCode.toUpperCase(), subtotal)

        if (result.valid) {
            setCouponApplied({
                code: couponCode.toUpperCase(),
                discount: result.discount,
                message: result.message
            })
            setCouponError(null)
        } else {
            setCouponError(result.error || 'Invalid coupon')
            setCouponApplied(null)
        }

        setCouponLoading(false)
    }

    const removeCoupon = () => {
        setCouponApplied(null)
        setCouponCode('')
        setCouponError(null)
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            setError('Please select a delivery address')
            return
        }

        setPlacing(true)
        setError(null)

        const result = await createOrder(selectedAddress, paymentMethod, {
            giftWrap,
            giftMessage: giftWrap ? giftMessage : undefined,
            deliveryTimeSlot,
            couponCode: couponApplied?.code,
            couponDiscount: couponApplied?.discount
        })

        if (result.success) {
            router.push(`/account/orders/${result.orderId}?success=true`)
        } else {
            setError(result.error || 'Failed to place order')
            setPlacing(false)
        }
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)
    const shipping = subtotal >= 50000 ? 0 : shippingCharge
    const discount = couponApplied?.discount || 0
    const giftWrapCost = giftWrap ? GIFT_WRAP_PRICE : 0
    const total = subtotal + shipping + giftWrapCost - discount

    if (loading || cartLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        )
    }

    if (cart.length === 0 && !cartLoading && !loading) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white">
                <Navbar />
                <main className="pt-24 pb-24 min-h-[70vh] flex flex-col items-center justify-center">
                    <p className="text-xl text-white/50 mb-8 font-serif italic">Your bespoke collection is currently empty</p>
                    <Link href="/collections">
                        <Button className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest px-8 h-12">
                            Explore Collections
                        </Button>
                    </Link>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-16 md:pt-24 pb-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">Checkout</h1>

                    {error && (
                        <div className="alert-luxury-error mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center justify-center gap-3">
                                <AlertCircle size={14} className="text-red-500" />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Address & Payment */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Delivery Address */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-serif text-lg font-medium flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-amber-500" />
                                        Delivery Address
                                    </h2>
                                    {addresses.length < 5 && (
                                        <button
                                            onClick={() => setShowAddressForm(!showAddressForm)}
                                            className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add New
                                        </button>
                                    )}
                                </div>

                                {showAddressForm && (
                                    <form onSubmit={handleAddAddress} className="mb-6 p-4 border border-neutral-700 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-white/70 text-xs">Label</Label>
                                                <Input
                                                    value={newAddress.label}
                                                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                                    placeholder="Home, Office..."
                                                    className="bg-neutral-950 border-neutral-700 text-white h-10"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-white/70 text-xs">Full Name</Label>
                                                <Input
                                                    value={newAddress.full_name}
                                                    onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                                    required
                                                    className="bg-neutral-950 border-neutral-700 text-white h-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-white/70 text-xs">Phone</Label>
                                                <Input
                                                    value={newAddress.phone}
                                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                    required
                                                    className="bg-neutral-950 border-neutral-700 text-white h-10"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-white/70 text-xs">Pincode</Label>
                                                <Input
                                                    value={newAddress.pincode}
                                                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                                    required
                                                    className="bg-neutral-950 border-neutral-700 text-white h-10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-white/70 text-xs">Street Address</Label>
                                            <Input
                                                value={newAddress.street_address}
                                                onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                                                required
                                                className="bg-neutral-950 border-neutral-700 text-white h-10"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-white/70 text-xs">City</Label>
                                                <Input
                                                    value={newAddress.city}
                                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                    required
                                                    className="bg-neutral-950 border-neutral-700 text-white h-10"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-white/70 text-xs">State</Label>
                                                <Input
                                                    value={newAddress.state}
                                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                    required
                                                    className="bg-neutral-950 border-neutral-700 text-white h-10"
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-400 text-neutral-950">
                                            Save Address
                                        </Button>
                                    </form>
                                )}

                                {addresses.length === 0 && !showAddressForm ? (
                                    <p className="text-white/50 text-center py-8">No addresses saved. Add one to continue.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map((addr) => (
                                            <label
                                                key={addr.id}
                                                className={`block p-4 border cursor-pointer transition-all ${selectedAddress === addr.id
                                                    ? 'border-amber-500 bg-amber-500/5'
                                                    : 'border-neutral-700 hover:border-neutral-600'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="address"
                                                        checked={selectedAddress === addr.id}
                                                        onChange={() => {
                                                            setSelectedAddress(addr.id)
                                                            updateShippingRate(addr.pincode)
                                                        }}
                                                        className="mt-1 accent-amber-500"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{addr.full_name}</span>
                                                            <span className="text-xs bg-neutral-800 px-2 py-0.5 text-white/60">{addr.label}</span>
                                                            {addr.is_default && (
                                                                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5">Default</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-white/60">{addr.street_address}</p>
                                                        <p className="text-sm text-white/60">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                        <p className="text-sm text-white/50 mt-1">Phone: {addr.phone}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Gift Wrapping */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6">
                                <h2 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-amber-500" />
                                    Gift Options
                                </h2>

                                <label className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${giftWrap ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-700 hover:border-neutral-600'}`}>
                                    <input
                                        type="checkbox"
                                        checked={giftWrap}
                                        onChange={(e) => setGiftWrap(e.target.checked)}
                                        className="mt-1 accent-amber-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Add Premium Gift Wrapping</span>
                                            <span className="text-amber-400 text-sm font-medium">+₹{GIFT_WRAP_PRICE}</span>
                                        </div>
                                        <p className="text-xs text-white/50 mt-1">Elegant packaging with ribbon and personalized message card</p>
                                    </div>
                                </label>

                                {giftWrap && (
                                    <div className="mt-4">
                                        <Label className="text-white/70 text-xs">Gift Message (optional)</Label>
                                        <textarea
                                            value={giftMessage}
                                            onChange={(e) => setGiftMessage(e.target.value)}
                                            placeholder="Write a personal message..."
                                            maxLength={200}
                                            className="w-full mt-1 p-3 bg-neutral-950 border border-neutral-700 text-white text-sm resize-none h-20 focus:outline-none focus:border-amber-500"
                                        />
                                        <p className="text-xs text-white/40 text-right mt-1">{giftMessage.length}/200</p>
                                    </div>
                                )}
                            </div>

                            {/* Delivery Time Slot */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6">
                                <h2 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                    Preferred Delivery Time
                                </h2>
                                <p className="text-white/50 text-xs mb-4">Select a preferred time slot for your delivery. We will try our best to accommodate your request.</p>

                                <div className="space-y-3">
                                    {[
                                        { id: 'anytime', label: 'Anytime', time: '9:00 AM - 9:00 PM' },
                                        { id: 'morning', label: 'Morning Slot', time: '9:00 AM - 12:00 PM' },
                                        { id: 'afternoon', label: 'Afternoon Slot', time: '12:00 PM - 5:00 PM' },
                                        { id: 'evening', label: 'Evening Slot', time: '5:00 PM - 9:00 PM' }
                                    ].map((slot) => (
                                        <label
                                            key={slot.id}
                                            className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${deliveryTimeSlot === slot.id
                                                ? 'border-amber-500 bg-amber-500/5'
                                                : 'border-neutral-700 hover:border-neutral-600'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="timeSlot"
                                                checked={deliveryTimeSlot === slot.id}
                                                onChange={() => setDeliveryTimeSlot(slot.id)}
                                                className="accent-amber-500"
                                            />
                                            <div className="flex-1 flex justify-between items-center">
                                                <span className="font-medium text-sm">{slot.label}</span>
                                                <span className="text-xs text-white/50">{slot.time}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6">
                                <h2 className="font-serif text-lg font-medium mb-6 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-amber-500" />
                                    Payment Method
                                </h2>

                                <div className="space-y-4">
                                    <label
                                        className={`block p-4 border cursor-pointer transition-all border-amber-500 bg-amber-500/5`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={true}
                                                readOnly
                                                className="accent-amber-500"
                                            />
                                            <CreditCard className="w-5 h-5 text-amber-500" />
                                            <div>
                                                <span className="font-medium text-amber-500">Secure Online Payment</span>
                                                <p className="text-xs text-white/50">UPI, Credit/Debit Card, Net Banking</p>
                                            </div>
                                        </div>
                                    </label>

                                    <div className="bg-neutral-950/50 p-4 border border-red-900/30 rounded">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                className="mt-1 accent-amber-500 w-4 h-4"
                                            />
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-white/90">I accept all Policy Agreements</span>
                                                <p className="text-xs text-white/50 leading-relaxed">
                                                    I have read and agree to the <Link href="/terms" target="_blank" className="text-amber-500 underline">Terms & Conditions</Link>, <Link href="/privacy" target="_blank" className="text-amber-500 underline">Privacy Policy</Link>, and <Link href="/returns" target="_blank" className="text-amber-500 underline">Refund/Cancellation Policy</Link>.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-neutral-900 border border-neutral-800 p-6 sticky top-24">
                                <div className="font-serif text-lg font-medium mb-6 flex items-center justify-between">
                                    <span>Order Summary</span>
                                    <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="BIS Hallmarked & Certified">
                                        <div className="relative w-6 h-6">
                                            <Image src="/pngegg.png" alt="Hallmark" fill className="object-contain" />
                                        </div>
                                        <span className="text-[8px] font-premium-sans tracking-widest uppercase">Certified</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="relative w-14 h-14 flex-shrink-0 bg-neutral-800">
                                                <Image
                                                    src={item.products?.image_url || '/placeholder.jpg'}
                                                    alt={item.products?.name || 'Product'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate">{item.products?.name}</p>
                                                <p className="text-xs text-white/50">Qty: {item.quantity}</p>
                                                <p className="text-sm text-amber-400">₹{((item.products?.price || 0) * item.quantity).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon Code */}
                                <div className="border-t border-neutral-800 pt-4 mb-4">
                                    <label className="text-xs text-white/60 uppercase tracking-wider flex items-center gap-1 mb-2">
                                        <Tag className="w-3 h-3" />
                                        Coupon Code
                                    </label>
                                    {couponApplied ? (
                                        <div className="alert-luxury-success animate-in fade-in duration-500">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Check size={12} className="text-emerald-500" />
                                                    <span className="text-emerald-400 font-medium">{couponApplied.code}</span>
                                                </div>
                                                <button onClick={removeCoupon} className="text-white/30 hover:text-white transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-emerald-400/70 mt-1">{couponApplied.message}</p>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter code"
                                                className="bg-neutral-950 border-neutral-700 text-white h-10 uppercase"
                                            />
                                            <Button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="bg-neutral-800 hover:bg-neutral-700 text-white h-10 px-4"
                                            >
                                                {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                            </Button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="text-[10px] font-premium-sans text-red-400 mt-2 px-1 tracking-widest">{couponError}</p>
                                    )}
                                </div>

                                <div className="border-t border-neutral-800 pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-white/70">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>Shipping</span>
                                        <span>
                                            {shippingLoading ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                shipping === 0 ? 'FREE' : `₹${shipping}`
                                            )}
                                        </span>
                                    </div>
                                    {giftWrap && (
                                        <div className="flex justify-between text-white/70">
                                            <span>Gift Wrapping</span>
                                            <span>₹{giftWrapCost}</span>
                                        </div>
                                    )}
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Discount</span>
                                            <span>-₹{discount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-neutral-800 pt-2 flex justify-between font-medium text-lg">
                                        <span>Total</span>
                                        <span className="text-amber-400">₹{total.toLocaleString('en-IN')}</span>
                                    </div>

                                    {/* Estimated Delivery */}
                                    {selectedAddress && (
                                        <DeliveryEstimate pincode={addresses.find((a: any) => a.id === selectedAddress)?.pincode} />
                                    )}
                                </div>


                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={placing || !selectedAddress || !termsAccepted}
                                    className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {placing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            Pay Securely
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-white/40 text-center mt-4">
                                    By placing this order, you agree to our Terms & Conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
