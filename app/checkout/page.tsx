'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAddresses, addAddress, createOrder, validateCoupon, initiatePayment, verifyPayment } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import { Loader2, Plus, MapPin, Check, CreditCard, Banknote, ChevronRight, Tag, Gift, X, AlertCircle, Clock, Pencil, ShoppingBag } from 'lucide-react'
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
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

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

    // Script loading state
    const [razorpayLoaded, setRazorpayLoaded] = useState(false)
    const [cashfreeLoaded, setCashfreeLoaded] = useState(false)
    const [enableCod, setEnableCod] = useState(false)

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

        console.log('CheckoutPage: Checking for payment scripts...');

        // Check for scripts periodically as a fallback
        const checkScripts = () => {
            const isRPReady = typeof window !== 'undefined' && (window as any).Razorpay;
            const isCFReady = typeof window !== 'undefined' && (window as any).Cashfree;

            if (isRPReady !== razorpayLoaded || isCFReady !== cashfreeLoaded) {
                console.log('CheckoutPage: Script status check:', { razorpay: !!isRPReady, cashfree: !!isCFReady });
            }

            if (isRPReady && !razorpayLoaded) {
                console.log('Razorpay detected on window');
                setRazorpayLoaded(true);
            }
            if (isCFReady && !cashfreeLoaded) {
                console.log('Cashfree detected on window');
                setCashfreeLoaded(true);
            }
        };

        checkScripts();
        const interval = setInterval(checkScripts, 1000);
        return () => clearInterval(interval);
    }, [razorpayLoaded, cashfreeLoaded])

    async function loadData() {
        setLoading(true)
        const [addressData, config] = await Promise.all([
            getAddresses(),
            import('@/app/actions').then(m => m.getPaymentGatewayConfig())
        ])
        setAddresses(addressData)
        setEnableCod(config.enableCod)

        if (addressData.length > 0) {
            const defaultAddr = addressData.find((a: any) => a.is_default) || addressData[0]
            setSelectedAddress(defaultAddr.id)
        } else {
            setShowAddressForm(true)
        }
        setLoading(false)
    }

    const updateShippingRate = async (pincode: string, isCod: boolean) => {
        if (!pincode || cart.length === 0) return
        setShippingLoading(true)
        try {
            const { calculateShippingRate } = await import('@/app/actions')
            const res = await calculateShippingRate(pincode, cart, isCod)
            if (res.success) {
                setShippingCharge(res.rate)
            }
        } catch (err) {
            console.error('Failed to update shipping rate:', err)
        } finally {
            setShippingLoading(false)
        }
    }

    // React to changes in address or payment method
    useEffect(() => {
        const addr = addresses.find(a => a.id === selectedAddress)
        if (addr) {
            updateShippingRate(addr.pincode, paymentMethod === 'cod')
        }
    }, [selectedAddress, paymentMethod])

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        let result
        if (editingAddressId) {
            const { updateAddress } = await import('@/app/actions')
            result = await updateAddress(editingAddressId, newAddress)
        } else {
            result = await addAddress(newAddress)
        }

        if (result.success) {
            await loadData()
            setShowAddressForm(false)
            setEditingAddressId(null)
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
            setError(result.error || 'Failed to save address')
        }
    }

    const handleEditAddress = (addr: any) => {
        setNewAddress({
            label: addr.label,
            full_name: addr.full_name,
            phone: addr.phone,
            street_address: addr.street_address,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            is_default: addr.is_default
        })
        setEditingAddressId(addr.id)
        setShowAddressForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
            setError('Please select a delivery address');
            return;
        }

        setPlacing(true);
        setError(null);

        try {
            const result = await createOrder(selectedAddress, paymentMethod, {
                giftWrap,
                giftMessage: giftWrap ? giftMessage : undefined,
                deliveryTimeSlot,
                couponCode: couponApplied?.code,
                couponDiscount: couponApplied?.discount
            });

            if (!result.success) {
                setError(result.error || 'Failed to place order');
                setPlacing(false);
                return;
            }

            if (paymentMethod === 'cod') {
                router.push(`/account/orders/${result.orderId}?success=true`);
                return;
            }

            // Online Payment Flow
            const paymentResult = await initiatePayment(result.orderId);

            if (!paymentResult.success) {
                setError(paymentResult.error || 'Failed to initiate payment');
                setPlacing(false);
                return;
            }

            if (paymentResult.gateway === 'razorpay') {
                const rp = paymentResult as any;

                // Check if Razorpay is loaded with retry
                let isRPReady = typeof window !== 'undefined' && (window as any).Razorpay;
                if (!isRPReady) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    isRPReady = typeof window !== 'undefined' && (window as any).Razorpay;
                }

                if (!isRPReady) {
                    setError('Payment connection is slow. Please click again in 2 seconds...');
                    setPlacing(false);
                    return;
                }

                const options = {
                    key: rp.keyId,
                    amount: rp.amount,
                    currency: rp.currency,
                    name: "AURERXA",
                    description: rp.productName,
                    order_id: rp.razorpayOrderId,
                    handler: async function (response: any) {
                        setPlacing(true);
                        const verifyResult = await verifyPayment(result.orderId, response);
                        if (verifyResult.success) {
                            router.push(`/account/orders/${result.orderId}?success=true`);
                        } else {
                            setError(verifyResult.error || 'Verification failed');
                            setPlacing(false);
                        }
                    },
                    prefill: {
                        name: rp.customer.name,
                        email: rp.customer.email,
                        contact: rp.customer.contact
                    },
                    theme: {
                        color: "#D4AF37"
                    },
                    modal: {
                        ondismiss: function () {
                            setPlacing(false);
                        }
                    }
                };

                // @ts-ignore
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else if (paymentResult.gateway === 'cashfree') {
                const cf = paymentResult as any;

                const isCFReady = typeof window !== 'undefined' && (window as any).Cashfree;
                if (!isCFReady) {
                    setError('Payment system still loading. Please wait a moment...');
                    setPlacing(false);
                    return;
                }

                // @ts-ignore
                const cashfree = (window as any).Cashfree({
                    mode: cf.mode || "sandbox"
                });

                cashfree.checkout({
                    paymentSessionId: cf.paymentSessionId,
                    redirectTarget: "_self",
                });
            }
        } catch (err: any) {
            console.error('Payment Error:', err);
            setError('Payment gateway error. Please try again.');
            setPlacing(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)
    const shipping = subtotal >= 50000 ? 0 : shippingCharge
    const discount = couponApplied?.discount || 0
    const giftWrapCost = giftWrap ? GIFT_WRAP_PRICE : 0
    const total = subtotal + shipping + giftWrapCost - discount

    if (loading || cartLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (cart.length === 0 && !cartLoading && !loading) {
        return (
            <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
                <main className="pb-24 min-h-[70vh] flex flex-col items-center justify-center">
                    <div className="w-20 h-20 mb-8 rounded-full bg-card flex items-center justify-center border border-border">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4 italic">Your collection is empty</h1>
                    <p className="text-muted-foreground mb-12 font-premium-sans text-sm tracking-wide max-w-md text-center">
                        Explore our curated selection of heritage pieces and add them to your collection.
                    </p>
                    <Link href="/collections">
                        <Button className="bg-foreground hover:bg-foreground/90 text-background font-bold uppercase tracking-[0.2em] px-10 py-7 rounded-none transition-all">
                            Explore Collections
                        </Button>
                    </Link>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <main className="pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center mb-12">
                        <h1 className="text-3xl md:text-5xl font-serif text-foreground tracking-tight">
                            Secure <span className="text-primary italic">Checkout</span>
                        </h1>
                    </div>

                    {error && (
                        <div className="alert-luxury-error mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center justify-center gap-3">
                                <AlertCircle size={14} className="text-destructive" />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Address & Payment */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Delivery Address */}
                            <div className="bg-card/30 border border-border p-8 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="font-serif text-2xl font-light flex items-center gap-3 text-foreground/90">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        Delivery Details
                                    </h2>
                                    {!showAddressForm && addresses.length < 5 && (
                                        <button
                                            onClick={() => {
                                                setEditingAddressId(null)
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
                                                setShowAddressForm(true)
                                            }}
                                            className="text-[10px] uppercase tracking-[0.2em] text-primary hover:text-foreground flex items-center gap-2 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add New
                                        </button>
                                    )}
                                </div>

                                {showAddressForm && (
                                    <form onSubmit={handleSaveAddress} className="mb-8 p-6 border border-primary/20 bg-primary/5 space-y-6 rounded-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest">
                                                {editingAddressId ? 'Edit Address' : 'New Address'}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddressForm(false)
                                                    setEditingAddressId(null)
                                                }}
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Label</Label>
                                                <Input
                                                    value={newAddress.label}
                                                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                                    placeholder="Home, Office..."
                                                    className="bg-background border-input text-foreground h-12 rounded-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Full Name</Label>
                                                <Input
                                                    value={newAddress.full_name}
                                                    onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                                    required
                                                    className="bg-background border-input text-foreground h-12 rounded-none focus:border-primary/50 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Phone</Label>
                                                <Input
                                                    value={newAddress.phone}
                                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                    required
                                                    className="bg-background border-input text-foreground h-12 rounded-none focus:border-primary/50 transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Pincode</Label>
                                                <Input
                                                    value={newAddress.pincode}
                                                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                                    required
                                                    className="bg-background border-input text-foreground h-12 rounded-none focus:border-primary/50 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Street Address</Label>
                                            <Input
                                                value={newAddress.street_address}
                                                onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                                                required
                                                className="bg-background border-input text-foreground h-12 rounded-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">City</Label>
                                                <Input
                                                    value={newAddress.city}
                                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                    required
                                                    className="bg-background border-input text-foreground h-12 rounded-none focus:border-primary/50 transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">State</Label>
                                                <Input
                                                    value={newAddress.state}
                                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                    required
                                                    className="bg-background border-input text-foreground h-12 rounded-none focus:border-primary/50 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 pt-2">
                                            <Button type="submit" className="bg-foreground hover:bg-foreground/90 text-background font-bold uppercase tracking-[0.2em] px-8 rounded-none transition-all">
                                                {editingAddressId ? 'Update' : 'Save'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    setShowAddressForm(false)
                                                    setEditingAddressId(null)
                                                }}
                                                className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 uppercase tracking-[0.2em] rounded-none"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {addresses.length === 0 && !showAddressForm ? (
                                    <p className="text-muted-foreground text-center py-8">No addresses saved. Add one to continue.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                className={`group block p-4 border transition-all rounded-xl relative ${selectedAddress === addr.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-foreground/20'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="address"
                                                        checked={selectedAddress === addr.id}
                                                        onChange={() => setSelectedAddress(addr.id)}
                                                        className="mt-1 accent-primary cursor-pointer"
                                                    />
                                                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedAddress(addr.id)}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-foreground">{addr.full_name}</span>
                                                            <span className="text-[10px] bg-muted px-2 py-0.5 text-muted-foreground uppercase tracking-widest">{addr.label}</span>
                                                            {addr.is_default && (
                                                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 uppercase tracking-widest">Default</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{addr.street_address}</p>
                                                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                        <p className="text-sm text-muted-foreground/80 mt-1">Phone: {addr.phone}</p>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            handleEditAddress(addr)
                                                        }}
                                                        className="p-2 text-muted-foreground/50 hover:text-primary transition-colors"
                                                        title="Edit Address"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Gift Wrapping */}
                            <div className="bg-card/30 border border-border p-8 backdrop-blur-sm">
                                <h2 className="font-serif text-2xl font-light mb-6 flex items-center gap-3 text-foreground/90">
                                    <Gift className="w-5 h-5 text-primary" />
                                    Gift Options
                                </h2>

                                <label className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${giftWrap ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'}`}>
                                    <input
                                        type="checkbox"
                                        checked={giftWrap}
                                        onChange={(e) => setGiftWrap(e.target.checked)}
                                        className="mt-1 accent-primary"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-foreground">Add Premium Gift Wrapping</span>
                                            <span className="text-primary text-sm font-medium">+₹{GIFT_WRAP_PRICE}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Elegant packaging with ribbon and personalized message card</p>
                                    </div>
                                </label>

                                {giftWrap && (
                                    <div className="mt-4">
                                        <Label className="text-foreground/70 text-xs">Gift Message (optional)</Label>
                                        <textarea
                                            value={giftMessage}
                                            onChange={(e) => setGiftMessage(e.target.value)}
                                            placeholder="Write a personal message..."
                                            maxLength={200}
                                            className="w-full mt-1 p-3 bg-background border border-border text-foreground text-sm resize-none h-20 focus:outline-none focus:border-primary"
                                        />
                                        <p className="text-xs text-muted-foreground/60 text-right mt-1">{giftMessage.length}/200</p>
                                    </div>
                                )}
                            </div>

                            {/* Delivery Time Slot */}
                            <div className="bg-card/30 border border-border p-8 backdrop-blur-sm">
                                <h2 className="font-serif text-2xl font-light mb-6 flex items-center gap-3 text-foreground/90">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Delivery Preference
                                </h2>
                                <p className="text-muted-foreground text-xs mb-4">Select a preferred time slot for your delivery. We will try our best to accommodate your request.</p>

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
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-foreground/20'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="timeSlot"
                                                checked={deliveryTimeSlot === slot.id}
                                                onChange={() => setDeliveryTimeSlot(slot.id)}
                                                className="accent-primary"
                                            />
                                            <div className="flex-1 flex justify-between items-center">
                                                <span className="font-medium text-sm text-foreground">{slot.label}</span>
                                                <span className="text-xs text-muted-foreground">{slot.time}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-card/30 border border-border p-8 backdrop-blur-sm">
                                <h2 className="font-serif text-2xl font-light mb-6 flex items-center gap-3 text-foreground/90">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Payment
                                </h2>

                                <div className="space-y-4">
                                    <label
                                        onClick={() => setPaymentMethod('online')}
                                        className={`block p-4 border cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={paymentMethod === 'online'}
                                                onChange={() => setPaymentMethod('online')}
                                                className="accent-primary"
                                            />
                                            <CreditCard className="w-5 h-5 text-primary" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={`font-medium ${paymentMethod === 'online' ? 'text-primary' : 'text-foreground'}`}>Secure Online Payment</span>
                                                    <div className="flex items-center gap-2 grayscale-0 group-hover:opacity-100 transition-all">
                                                        <div className="relative w-8 h-4">
                                                            <Image src="/upi-icon.svg" alt="UPI" fill className="object-contain dark:invert invert-0" />
                                                        </div>
                                                        <div className="relative w-8 h-4">
                                                            <Image src="/Mastercard-logo.svg" alt="Mastercard" fill className="object-contain" />
                                                        </div>
                                                        <div className="relative w-8 h-4">
                                                            <img src="https://img.icons8.com/?size=100&id=13611&format=png&color=FFFFFF" alt="Visa" className="h-full object-contain invert dark:invert-0" />
                                                        </div>
                                                        <div className="relative w-8 h-4">
                                                            <img src="https://logowik.com/content/uploads/images/rupay6734.jpg" alt="RuPay" className="h-full object-contain" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">UPI, Credit/Debit Card, Net Banking</p>
                                            </div>
                                        </div>
                                    </label>

                                    {enableCod && (
                                        <label
                                            onClick={() => setPaymentMethod('cod')}
                                            className={`block p-4 border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    checked={paymentMethod === 'cod'}
                                                    onChange={() => setPaymentMethod('cod')}
                                                    className="accent-primary"
                                                />
                                                <Banknote className="w-5 h-5 text-primary" />
                                                <div>
                                                    <span className={`font-medium ${paymentMethod === 'cod' ? 'text-primary' : 'text-foreground'}`}>Cash on Delivery</span>
                                                    <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                                                </div>
                                            </div>
                                        </label>
                                    )}

                                    <div className="bg-background/50 p-4 border border-destructive/10 rounded">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                className="mt-1 accent-primary w-4 h-4"
                                            />
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-foreground/90">I accept all Policy Agreements</span>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    I have read and agree to the <Link href="/terms" target="_blank" className="text-primary underline">Terms & Conditions</Link>, <Link href="/privacy" target="_blank" className="text-primary underline">Privacy Policy</Link>, and <Link href="/returns" target="_blank" className="text-primary underline">Refund/Cancellation Policy</Link>.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-card/30 border border-border p-8 sticky top-24 backdrop-blur-sm">
                                <div className="font-serif text-2xl font-light mb-8 flex items-center justify-between italic text-foreground/90">
                                    <span>Order Summary</span>
                                    <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="BIS Hallmarked & Certified">
                                        <div className="relative w-6 h-6">
                                            <Image src="/pngegg.png" alt="Hallmark" fill className="object-contain dark:invert invert-0" />
                                        </div>
                                        <span className="text-[8px] font-premium-sans tracking-widest uppercase text-foreground">Certified</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-2 hover:bg-foreground/5 transition-colors group rounded-sm">
                                            <div className="relative w-16 h-16 flex-shrink-0 bg-background border border-border overflow-hidden">
                                                <Image
                                                    src={item.products?.image_url || '/placeholder.jpg'}
                                                    alt={item.products?.name || 'Product'}
                                                    fill
                                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="text-sm font-serif text-foreground/90 truncate group-hover:text-primary transition-colors">{item.products?.name}</p>
                                                <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                                                    <span>Qty: {item.quantity}</span>
                                                    {item.size && (
                                                        <>
                                                            <span className="opacity-20">|</span>
                                                            <span className="text-muted-foreground/80">{item.size}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="text-xs font-premium-sans text-primary mt-1">₹{((item.products?.price || 0) * item.quantity).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon Code */}
                                <div className="border-t border-border pt-6 mb-6">
                                    <label className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                                        <Tag className="w-3 h-3" />
                                        Access Code
                                    </label>
                                    {couponApplied ? (
                                        <div className="bg-primary/10 border border-primary/20 p-3 rounded-none animate-in fade-in duration-500">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Check size={12} className="text-primary" />
                                                    <span className="text-primary font-premium-sans text-xs tracking-widest">{couponApplied.code}</span>
                                                </div>
                                                <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-primary/70 mt-1 tracking-wider uppercase">{couponApplied.message}</p>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="ENTER CODE"
                                                className="bg-background border-input text-foreground h-10 uppercase text-xs tracking-widest rounded-none focus:border-primary/50 placeholder:text-muted-foreground/40"
                                            />
                                            <Button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="bg-foreground/5 hover:bg-foreground/10 text-foreground h-10 px-6 rounded-none uppercase text-[10px] tracking-widest border border-border"
                                            >
                                                {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                                            </Button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="text-[9px] font-premium-sans text-destructive/80 mt-2 px-1 tracking-widest flex items-center gap-1">
                                            <AlertCircle size={10} />
                                            {couponError}
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-border pt-6 space-y-3">
                                    <div className="flex justify-between text-muted-foreground text-xs uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-foreground/80">₹{subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground text-xs uppercase tracking-widest">
                                        <span>Shipping</span>
                                        <span className="text-foreground/80">
                                            {shippingLoading ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                shipping === 0 ? 'Complimentary' : `₹${shipping}`
                                            )}
                                        </span>
                                    </div>
                                    {giftWrap && (
                                        <div className="flex justify-between text-muted-foreground text-xs uppercase tracking-widest">
                                            <span>Gift Wrapping</span>
                                            <span className="text-primary font-bold">₹{giftWrapCost}</span>
                                        </div>
                                    )}
                                    {discount > 0 && (
                                        <div className="flex justify-between text-primary text-xs uppercase tracking-widest">
                                            <span>Privilege</span>
                                            <span>-₹{discount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-border pt-4 flex justify-between items-baseline">
                                        <span className="text-sm uppercase tracking-widest text-muted-foreground">Total</span>
                                        <span className="font-serif text-2xl text-primary">₹{total.toLocaleString('en-IN')}</span>
                                    </div>

                                    {/* Estimated Delivery */}
                                    {selectedAddress && (
                                        <DeliveryEstimate pincode={addresses.find((a: any) => a.id === selectedAddress)?.pincode} />
                                    )}
                                </div>


                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={placing || !selectedAddress || !termsAccepted || (paymentMethod === 'online' && !razorpayLoaded && !cashfreeLoaded && !(typeof window !== 'undefined' && ((window as any).Razorpay || (window as any).Cashfree)))}
                                    className="w-full mt-8 bg-foreground hover:bg-foreground/90 text-background font-bold uppercase tracking-[0.25em] h-14 rounded-none disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                                >
                                    {placing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (paymentMethod === 'online' && !razorpayLoaded && !cashfreeLoaded && !(typeof window !== 'undefined' && ((window as any).Razorpay || (window as any).Cashfree))) ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Initializing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {paymentMethod === 'cod' ? 'Place Order' : 'Secure Payment'}
                                            <ChevronRight className="w-4 h-4 ml-2 opacity-50 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>

                                <div className="mt-4 space-y-2">
                                    {!selectedAddress && (
                                        <p className="text-[10px] text-destructive text-center animate-pulse uppercase tracking-[0.2em] font-medium">
                                            Please select a delivery address
                                        </p>
                                    )}
                                    {selectedAddress && !termsAccepted && (
                                        <p className="text-[10px] text-destructive text-center animate-pulse uppercase tracking-[0.2em] font-medium">
                                            Please accept Policy Agreements below
                                        </p>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground/40 text-center mt-4">
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
