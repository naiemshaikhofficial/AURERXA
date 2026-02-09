'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, RefreshCcw, CameraIcon, ZoomIn, Move, RotateCw, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VTOModalProps {
    isOpen: boolean
    onClose: () => void
    productImage: string
    productName: string
}

export function VTOModal({ isOpen, onClose, productImage, productName }: VTOModalProps) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

    // Overlay state
    const [scale, setScale] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (isOpen) {
            startCamera()
        } else {
            stopCamera()
        }
        return () => stopCamera()
    }, [isOpen, facingMode])

    const startCamera = async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
            })
            setStream(newStream)
            if (videoRef.current) {
                videoRef.current.srcObject = newStream
            }
            setHasPermission(true)
        } catch (err) {
            console.error('Error accessing camera:', err)
            setHasPermission(false)
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }

    const flipCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    }

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // In a real implementation, we would want to draw the overlay here too
        // For now, we'll just show a success message or provide a download
        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `AURERXA_TryOn_${productName}.png`
        link.href = dataUrl
        link.click()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-neutral-950/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-8"
                >
                    <div className="relative w-full h-full max-w-5xl bg-neutral-950 border border-white/5 flex flex-col shadow-2xl">

                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-neutral-950 relative z-20">
                            <div className="space-y-1">
                                <span className="text-amber-200/60 text-[9px] tracking-[0.3em] font-bold uppercase block">Virtual Mirror</span>
                                <h2 className="text-white font-serif text-xl italic tracking-wide">{productName}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-all group"
                            >
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </div>

                        {/* Viewport */}
                        <div className="relative flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden">
                            {hasPermission === false ? (
                                <div className="text-center p-10 space-y-6">
                                    <Camera className="w-12 h-12 text-white/10 mx-auto" />
                                    <p className="text-white/40 font-light tracking-wide text-sm">Camera access is required for Virtual Try-On.</p>
                                    <button
                                        onClick={startCamera}
                                        className="bg-white text-neutral-950 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors"
                                    >
                                        Enable Camera
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                                    />

                                    {/* Interactive Jewelry Overlay */}
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <motion.div
                                            drag
                                            dragElastic={0}
                                            dragMomentum={false}
                                            onDragEnd={(e, info) => setPosition({ x: info.point.x, y: info.point.y })}
                                            style={{ x: position.x, y: position.y, scale, rotate: rotation }}
                                            className="pointer-events-auto cursor-move relative touch-none"
                                        >
                                            <img
                                                src={productImage}
                                                alt="Try On Jewelry"
                                                className="w-48 h-auto drop-shadow-2xl select-none"
                                                draggable={false}
                                            />
                                            <div className="absolute inset-0 border border-white/0 hover:border-white/20 transition-colors" />
                                        </motion.div>
                                    </div>

                                    {/* Hint */}
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-neutral-950/50 backdrop-blur-md border border-white/5 text-[9px] text-white/60 uppercase tracking-[0.2em] pointer-events-none">
                                        Drag to Position • Use Controls to adjust
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="p-8 border-t border-white/5 bg-neutral-950 relative z-20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                                {/* Manual Adjustments */}
                                <div className="flex items-center gap-8 justify-center md:justify-start">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="text-[8px] text-white/20 uppercase font-bold tracking-[0.2em]">Scale</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="text-white/40 hover:text-white transition-colors"><ZoomIn className="w-4 h-4 scale-x-[-1]" /></button>
                                            <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="text-white/40 hover:text-white transition-colors"><ZoomIn className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-white/5" />
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="text-[8px] text-white/20 uppercase font-bold tracking-[0.2em]">Rotate</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setRotation(r => r - 15)} className="text-white/40 hover:text-white transition-colors"><RotateCw className="w-4 h-4 scale-x-[-1]" /></button>
                                            <button onClick={() => setRotation(r => r + 15)} className="text-white/40 hover:text-white transition-colors"><RotateCw className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Action Buttons */}
                                <div className="flex items-center justify-center gap-8">
                                    <button
                                        onClick={flipCamera}
                                        className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                                    >
                                        <RefreshCcw className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={capturePhoto}
                                        className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-neutral-950 hover:bg-neutral-200 transition-all active:scale-95"
                                    >
                                        <CameraIcon className="w-6 h-6" />
                                    </button>

                                    <button
                                        onClick={() => { setScale(1); setRotation(0); setPosition({ x: 0, y: 0 }) }}
                                        className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                                    >
                                        <Move className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Secondary Actions */}
                                <div className="flex items-center gap-4 justify-center md:justify-end">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white hover:text-neutral-950 transition-all text-white/40 text-[9px] uppercase font-bold tracking-[0.2em]">
                                        <Download className="w-3 h-3" /> <span className="hidden sm:inline">Save Look</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white hover:text-neutral-950 transition-all text-white/40 text-[9px] uppercase font-bold tracking-[0.2em]">
                                        <Share2 className="w-3 h-3" /> <span className="hidden sm:inline">Share</span>
                                    </button>
                                </div>

                            </div>
                        </div>

                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
