'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { INDIAN_RING_SIZES, RingSizeEntry } from '@/lib/ring-sizes'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Info, Ruler, Search, CreditCard } from 'lucide-react'

// --- Constants ---
// Standard credit card width in mm for calibration
const CREDIT_CARD_WIDTH_MM = 85.6

// --- Helper ---
function findClosestSize(diameterMm: number): RingSizeEntry | null {
    if (!diameterMm || diameterMm <= 0) return null
    return INDIAN_RING_SIZES.reduce((prev, curr) => {
        const prevDiff = Math.abs(parseFloat(prev.mm) - diameterMm)
        const currDiff = Math.abs(parseFloat(curr.mm) - diameterMm)
        return currDiff < prevDiff ? curr : prev
    })
}

function findSizeByCircumference(circMm: number): RingSizeEntry | null {
    if (!circMm || circMm <= 0) return null
    return INDIAN_RING_SIZES.reduce((prev, curr) => {
        const prevDiff = Math.abs(parseFloat(prev.circumference) - circMm)
        const currDiff = Math.abs(parseFloat(curr.circumference) - circMm)
        return currDiff < prevDiff ? curr : prev
    })
}

type Method = 'ring' | 'string' | 'chart'

export function RingSizeCalculatorClient() {
    const [activeMethod, setActiveMethod] = useState<Method>('ring')
    const [result, setResult] = useState<RingSizeEntry | null>(null)

    // === Method 1: On-Screen Ring Sizer ===
    // PPI calibration: user aligns a credit card to set their screen's PPI
    const [pixelsPerMm, setPixelsPerMm] = useState(3.78) // default 96dpi
    const [cardWidthPx, setCardWidthPx] = useState(323) // initial guess for card
    const [ringDiameterPx, setRingDiameterPx] = useState(180)
    const [isCalibrated, setIsCalibrated] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const ringRef = useRef<HTMLDivElement>(null)
    const isDraggingCard = useRef(false)
    const isDraggingRing = useRef(false)
    const dragStartX = useRef(0)
    const dragStartValue = useRef(0)

    const ringDiameterMm = ringDiameterPx / pixelsPerMm

    useEffect(() => {
        const ppi = window.devicePixelRatio * 96
        setPixelsPerMm(ppi / 25.4)
        setCardWidthPx(Math.round(CREDIT_CARD_WIDTH_MM * (ppi / 25.4)))
        setRingDiameterPx(Math.round(17.9 * (ppi / 25.4)))
    }, [])

    const calibrate = useCallback(() => {
        const ppm = cardWidthPx / CREDIT_CARD_WIDTH_MM
        setPixelsPerMm(ppm)
        setIsCalibrated(true)
    }, [cardWidthPx])

    // Touch / mouse drag handlers for calibration bar
    const startDrag = (
        e: React.MouseEvent | React.TouchEvent,
        ref: React.MutableRefObject<boolean>,
        startXRef: React.MutableRefObject<number>,
        startValRef: React.MutableRefObject<number>,
        currentVal: number
    ) => {
        e.preventDefault()
        ref.current = true
        startXRef.current = 'touches' in e ? e.touches[0].clientX : e.clientX
        startValRef.current = currentVal
    }

    useEffect(() => {
        let ticking = false
        const move = (e: MouseEvent | TouchEvent) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
                    const dx = clientX - dragStartX.current
                    if (isDraggingCard.current) {
                        setCardWidthPx(v => Math.max(200, Math.min(600, dragStartValue.current + dx)))
                    }
                    if (isDraggingRing.current) {
                        const newD = Math.max(80, Math.min(350, dragStartValue.current + dx))
                        setRingDiameterPx(newD)
                        const ppm = isCalibrated ? pixelsPerMm : 3.78
                        const dMm = newD / ppm
                        setResult(findClosestSize(dMm))
                    }
                    ticking = false
                })
                ticking = true
            }
        }
        const up = () => {
            isDraggingCard.current = false
            isDraggingRing.current = false
        }
        window.addEventListener('mousemove', move)
        window.addEventListener('touchmove', move, { passive: false })
        window.addEventListener('mouseup', up)
        window.addEventListener('touchend', up)
        return () => {
            window.removeEventListener('mousemove', move)
            window.removeEventListener('touchmove', move)
            window.removeEventListener('mouseup', up)
            window.removeEventListener('touchend', up)
        }
    }, [isCalibrated, pixelsPerMm])

    // === Method 2: String / Circumference ===
    const [circumferenceInput, setCircumferenceInput] = useState('')
    const handleCircumferenceSubmit = () => {
        const val = parseFloat(circumferenceInput)
        if (!isNaN(val) && val > 0) {
            setResult(findSizeByCircumference(val))
        }
    }

    const methods = [
        { id: 'ring' as Method, label: 'Measure a Ring', icon: '💍', desc: 'Place an existing ring on screen' },
        { id: 'string' as Method, label: 'Measure your Finger', icon: '📏', desc: 'Use string or paper to measure' },
        { id: 'chart' as Method, label: 'Size Chart', icon: '📋', desc: 'Browse full Indian size guide' },
    ]

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Hero / Title */}
            <section className="relative py-24 px-6 text-center overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,175,55,0.4) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 hover:text-amber-500 transition-colors mb-12 group">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500/60 mb-4">AURERXA Heritage</p>
                <h1 className="text-4xl md:text-6xl font-serif italic font-light text-white mb-4">Find Your Perfect Size</h1>
                <p className="text-sm text-white/30 max-w-md mx-auto tracking-wider">
                    Three precise methods to find your ideal ring size, calibrated to Indian standards.
                </p>
            </section>

            {/* Method Tabs */}
            <section className="sticky top-20 z-30 bg-neutral-950/95 backdrop-blur-sm border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex">
                        {methods.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => { setActiveMethod(m.id); setResult(null) }}
                                className={`flex-1 py-5 px-3 flex flex-col items-center gap-1 text-center transition-all border-b-2 ${activeMethod === m.id
                                    ? 'border-amber-500 text-amber-400'
                                    : 'border-transparent text-white/30 hover:text-white/60 hover:border-white/10'
                                    }`}
                            >
                                <span className="text-xl">{m.icon}</span>
                                <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:block">{m.label}</span>
                                <span className="text-[9px] text-white/30 hidden md:block">{m.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16">
                <AnimatePresence mode="wait">
                    {/* ================================ */}
                    {/* METHOD 1: RING ON SCREEN */}
                    {/* ================================ */}
                    {activeMethod === 'ring' && (
                        <motion.div
                            key="ring"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
                        >
                            {/* Step 1: Calibrate */}
                            <div className="border border-white/10 bg-white/[0.02] p-6 md:p-10 space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">1</span>
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-widest mb-1">Calibrate Your Screen</h2>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            Place a standard credit card or debit card on your screen and drag the slider until it matches the card width exactly.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-6">
                                    {/* Credit card visual */}
                                    <div
                                        ref={cardRef}
                                        className="relative h-20 bg-gradient-to-br from-amber-900/30 to-neutral-800 border border-amber-500/20 rounded-xl flex items-center justify-center cursor-ew-resize select-none overflow-hidden shadow-xl"
                                        style={{ width: `${cardWidthPx}px`, maxWidth: '100%' }}
                                        onMouseDown={(e) => startDrag(e, isDraggingCard, dragStartX, dragStartValue, cardWidthPx)}
                                        onTouchStart={(e) => startDrag(e, isDraggingCard, dragStartX, dragStartValue, cardWidthPx)}
                                    >
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, transparent 40%, rgba(212,175,55,0.3) 50%, transparent 60%)' }} />
                                        <div className="flex flex-col items-start px-4 gap-1 w-full">
                                            <div className="w-8 h-5 rounded bg-amber-500/30 border border-amber-500/20" />
                                            <div className="text-[9px] text-amber-400/60 uppercase tracking-widest">Credit Card</div>
                                        </div>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-500/40">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        {/* Drag handles */}
                                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-amber-500/20 flex items-center justify-center cursor-ew-resize">
                                            <div className="w-0.5 h-4 bg-amber-500/40 rounded" />
                                        </div>
                                        <div className="absolute right-0 top-0 bottom-0 w-3 bg-amber-500/20 flex items-center justify-center cursor-ew-resize">
                                            <div className="w-0.5 h-4 bg-amber-500/40 rounded" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-white/30">← Drag card edge to resize → | Standard card is 85.6mm wide</p>
                                    <button
                                        onClick={calibrate}
                                        className="px-8 py-3 bg-amber-500 text-black font-bold uppercase tracking-widest text-[10px] hover:bg-amber-400 transition-colors"
                                    >
                                        {isCalibrated ? '✓ Screen Calibrated' : 'Calibrate Screen'}
                                    </button>
                                    {isCalibrated && (
                                        <p className="text-[10px] text-amber-400/70 uppercase tracking-widest">
                                            Calibrated: {pixelsPerMm.toFixed(2)} px/mm
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Place Ring */}
                            <div className="border border-white/10 bg-white/[0.02] p-6 md:p-10 space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">2</span>
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-widest mb-1">Place Your Ring</h2>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            Place a ring flat on your screen and resize the circle below until it matches your ring's inner edge perfectly.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-6">
                                    {/* Interactive Ring Circle */}
                                    <div className="relative flex items-center justify-center" style={{ width: `${ringDiameterPx + 40}px`, height: `${ringDiameterPx + 40}px`, maxWidth: '100%' }}>
                                        {/* Outer glow */}
                                        <div
                                            className="absolute rounded-full animate-pulse"
                                            style={{
                                                width: ringDiameterPx + 20,
                                                height: ringDiameterPx + 20,
                                                background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)'
                                            }}
                                        />
                                        {/* Main ring circle */}
                                        <div
                                            ref={ringRef}
                                            className="rounded-full border-2 border-amber-500/60 flex items-center justify-center cursor-ew-resize select-none relative"
                                            style={{
                                                width: ringDiameterPx,
                                                height: ringDiameterPx,
                                                boxShadow: '0 0 30px rgba(212,175,55,0.15), inset 0 0 30px rgba(212,175,55,0.05)',
                                            }}
                                            onMouseDown={(e) => startDrag(e, isDraggingRing, dragStartX, dragStartValue, ringDiameterPx)}
                                            onTouchStart={(e) => startDrag(e, isDraggingRing, dragStartX, dragStartValue, ringDiameterPx)}
                                        >
                                            <div className="text-center">
                                                <p className="text-xs font-mono text-amber-400">{ringDiameterMm.toFixed(1)} mm</p>
                                                <p className="text-[9px] text-white/30 uppercase tracking-widest">diameter</p>
                                            </div>
                                            {/* Drag handle */}
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-amber-500 border-2 border-neutral-950 flex items-center justify-center cursor-ew-resize shadow-lg">
                                                <div className="w-1 h-3 bg-black/60 rounded" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Slider for accessibility */}
                                    <div className="w-full max-w-sm space-y-2">
                                        <input
                                            type="range"
                                            min={80}
                                            max={350}
                                            value={ringDiameterPx}
                                            onChange={(e) => {
                                                const newD = parseInt(e.target.value)
                                                setRingDiameterPx(newD)
                                                const dMm = newD / pixelsPerMm
                                                setResult(findClosestSize(dMm))
                                            }}
                                            className="w-full accent-amber-500"
                                        />
                                        <div className="flex justify-between text-[9px] text-white/20 uppercase tracking-widest">
                                            <span>Smaller</span>
                                            <span>Larger</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setResult(findClosestSize(ringDiameterPx / pixelsPerMm))}
                                        className="px-10 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-amber-400 transition-colors"
                                    >
                                        Find My Size
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ================================ */}
                    {/* METHOD 2: STRING MEASUREMENT */}
                    {/* ================================ */}
                    {activeMethod === 'string' && (
                        <motion.div
                            key="string"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="border border-white/10 bg-white/[0.02] p-6 md:p-10 space-y-8">
                                {/* Instructions */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { step: '1', icon: '🧵', title: 'Wrap String', desc: 'Wrap a thin string or strip of paper around your finger comfortably' },
                                        { step: '2', icon: '✂️', title: 'Mark & Measure', desc: 'Mark where it overlaps and measure the length in mm with a ruler' },
                                        { step: '3', icon: '📐', title: 'Enter Length', desc: 'Enter the measured circumference below to get your Indian ring size' },
                                    ].map((item) => (
                                        <div key={item.step} className="p-6 border border-white/5 bg-white/[0.02] text-center space-y-3">
                                            <div className="text-3xl">{item.icon}</div>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-[10px] text-amber-500/60 uppercase tracking-widest">Step {item.step}</span>
                                            </div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest">{item.title}</h3>
                                            <p className="text-[11px] text-white/30 leading-relaxed">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Input */}
                                <div className="max-w-sm mx-auto space-y-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={circumferenceInput}
                                            onChange={(e) => setCircumferenceInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCircumferenceSubmit()}
                                            placeholder="e.g. 56.3"
                                            className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 pr-16 text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/40 transition-colors font-mono"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/30 uppercase tracking-wider">mm</span>
                                    </div>
                                    <button
                                        onClick={handleCircumferenceSubmit}
                                        disabled={!circumferenceInput}
                                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Calculate Size
                                    </button>
                                </div>

                                {/* Tip */}
                                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10">
                                    <Info className="w-3.5 h-3.5 text-amber-500/60 mt-0.5 flex-shrink-0" />
                                    <p className="text-[11px] text-white/30 leading-relaxed">
                                        <span className="text-amber-400/70">Tip:</span> Measure your finger at the end of the day when it's at its largest. If you're between sizes, choose the larger one. For wider bands, go up half a size.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ================================ */}
                    {/* METHOD 3: SIZE CHART */}
                    {/* ================================ */}
                    {activeMethod === 'chart' && (
                        <motion.div
                            key="chart"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2 pb-4">
                                <h2 className="text-sm font-serif italic text-white/60">Indian Ring Size Reference Guide</h2>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">Sizes 1 – 30 | Diameter & Circumference in mm</p>
                            </div>
                            <div className="overflow-hidden border border-white/10">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.03]">
                                            <th className="py-3 px-4 text-[9px] uppercase tracking-widest text-amber-500/70 font-bold">Indian Size</th>
                                            <th className="py-3 px-4 text-[9px] uppercase tracking-widest text-amber-500/70 font-bold">Diameter (mm)</th>
                                            <th className="py-3 px-4 text-[9px] uppercase tracking-widest text-amber-500/70 font-bold">Circumference (mm)</th>
                                            <th className="py-3 px-4 text-[9px] uppercase tracking-widest text-amber-500/70 font-bold hidden md:table-cell">US Size (approx)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {INDIAN_RING_SIZES.map((s, i) => (
                                            <tr
                                                key={s.size}
                                                className="group hover:bg-amber-500/5 transition-colors cursor-pointer"
                                                onClick={() => setResult(s)}
                                            >
                                                <td className="py-3 px-4 font-bold text-white group-hover:text-amber-400 transition-colors">
                                                    Size {s.size}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-white/70">{s.mm} mm</td>
                                                <td className="py-3 px-4 font-mono text-white/70">{s.circumference} mm</td>
                                                <td className="py-3 px-4 text-white/30 hidden md:table-cell">
                                                    {(3 + i * 0.5).toFixed(1)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ================================ */}
                {/* RESULT CARD                       */}
                {/* ================================ */}
                <AnimatePresence>
                    {result && activeMethod !== 'chart' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-10 border border-amber-500/20 bg-amber-500/5 p-8 md:p-12 text-center space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] to-transparent pointer-events-none" />
                            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500/60">Your Recommended Size</p>
                            <div className="flex items-end justify-center gap-2">
                                <span className="text-7xl md:text-9xl font-serif font-light text-white">{result.size}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                                <div className="text-center">
                                    <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Inner Diameter</p>
                                    <p className="font-mono text-amber-200 text-sm">{result.mm} mm</p>
                                </div>
                                <div className="hidden sm:block w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Circumference</p>
                                    <p className="font-mono text-amber-200 text-sm">{result.circumference} mm</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-white/20 max-w-xs mx-auto">
                                If between two sizes, we recommend sizing up. Wider band styles may require going up half a size.
                            </p>
                            <Link
                                href="/collections?type=Rings"
                                className="inline-block mt-4 px-10 py-4 bg-amber-500 text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-amber-400 transition-colors"
                            >
                                Shop Rings in Size {result.size}
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ================================ */}
                {/* TIPS SECTION                      */}
                {/* ================================ */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: '🌡️', title: 'Temperature Matters', desc: 'Fingers swell in heat and shrink in cold. Measure at room temperature for the best fit.' },
                        { icon: '⏰', title: 'Time of Day', desc: 'Fingers are typically at their largest in the evening. Measure then for a comfortable fit.' },
                        { icon: '💍', title: 'Band Width', desc: 'Wider bands fit more snugly — if you choose a wide band, consider going up by half a size.' },
                    ].map((tip) => (
                        <div key={tip.title} className="p-6 border border-white/5 bg-white/[0.01] space-y-3">
                            <span className="text-2xl">{tip.icon}</span>
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-amber-400/80">{tip.title}</h3>
                            <p className="text-[11px] text-white/30 leading-relaxed">{tip.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-16 text-center space-y-4 py-12 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">Still unsure?</p>
                    <h2 className="text-2xl font-serif italic text-white/70">Visit Us for a Personal Fitting</h2>
                    <p className="text-xs text-white/30">Our artisans at the AURERXA boutique will ensure a perfect fit.</p>
                    <Link
                        href="/contact-us"
                        className="inline-block mt-4 px-10 py-4 border border-white/10 text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] hover:border-amber-500/30 hover:text-amber-400 transition-all"
                    >
                        Book an Appointment
                    </Link>
                </div>
            </section>
        </div>
    )
}
