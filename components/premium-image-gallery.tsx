'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PremiumImageGalleryProps {
    images: string[]
    productName: string
    selectedImage: number
    onImageChange: (index: number) => void
}

export function PremiumImageGallery({ images, productName, selectedImage, onImageChange }: PremiumImageGalleryProps) {
    // Zoom state
    const [zoomLevel, setZoomLevel] = useState(1)
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showZoomHint, setShowZoomHint] = useState(true)

    // Refs
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)
    const lastTapRef = useRef<number>(0)
    const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null)
    const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

    const MIN_ZOOM = 1
    const MAX_ZOOM = 4
    const ZOOM_STEP = 0.5

    // Reset zoom when image changes
    useEffect(() => {
        setZoomLevel(1)
        setPanPosition({ x: 0, y: 0 })
    }, [selectedImage])

    // Hide zoom hint after a few seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowZoomHint(false), 4000)
        return () => clearTimeout(timer)
    }, [])

    // Handle zoom with bounds
    const handleZoom = useCallback((newZoom: number, centerX?: number, centerY?: number) => {
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom))

        if (clampedZoom === 1) {
            setPanPosition({ x: 0, y: 0 })
        } else if (centerX !== undefined && centerY !== undefined && containerRef.current) {
            // Zoom towards cursor/touch point
            const rect = containerRef.current.getBoundingClientRect()
            const x = (centerX - rect.left) / rect.width
            const y = (centerY - rect.top) / rect.height

            setPanPosition(prev => ({
                x: prev.x + (0.5 - x) * (clampedZoom - zoomLevel) * 100,
                y: prev.y + (0.5 - y) * (clampedZoom - zoomLevel) * 100
            }))
        }

        setZoomLevel(clampedZoom)
    }, [zoomLevel])

    // Reset zoom
    const resetZoom = useCallback(() => {
        setZoomLevel(1)
        setPanPosition({ x: 0, y: 0 })
    }, [])

    // PC: Scroll wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
        handleZoom(zoomLevel + delta, e.clientX, e.clientY)
    }, [zoomLevel, handleZoom])

    // Mobile: Double tap to toggle zoom
    const handleDoubleTap = useCallback((e: React.TouchEvent) => {
        const now = Date.now()
        const DOUBLE_TAP_DELAY = 300

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            e.preventDefault()
            const touch = e.touches[0] || e.changedTouches[0]
            if (zoomLevel > 1) {
                resetZoom()
            } else {
                handleZoom(2.5, touch.clientX, touch.clientY)
            }
        }
        lastTapRef.current = now
    }, [zoomLevel, handleZoom, resetZoom])

    // Mobile: Pinch to zoom
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            pinchStartRef.current = { distance, zoom: zoomLevel }
        } else if (e.touches.length === 1 && zoomLevel > 1) {
            setIsDragging(true)
            dragStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                panX: panPosition.x,
                panY: panPosition.y
            }
        }
        handleDoubleTap(e)
    }, [zoomLevel, panPosition, handleDoubleTap])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && pinchStartRef.current) {
            e.preventDefault()
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            const scale = distance / pinchStartRef.current.distance
            const newZoom = pinchStartRef.current.zoom * scale

            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2

            handleZoom(newZoom, centerX, centerY)
        } else if (e.touches.length === 1 && isDragging && dragStartRef.current && zoomLevel > 1) {
            e.preventDefault()
            const deltaX = e.touches[0].clientX - dragStartRef.current.x
            const deltaY = e.touches[0].clientY - dragStartRef.current.y

            // Limit pan based on zoom level
            const maxPan = (zoomLevel - 1) * 50
            setPanPosition({
                x: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panX + deltaX / zoomLevel)),
                y: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panY + deltaY / zoomLevel))
            })
        }
    }, [isDragging, zoomLevel, handleZoom])

    const handleTouchEnd = useCallback(() => {
        pinchStartRef.current = null
        dragStartRef.current = null
        setIsDragging(false)
    }, [])

    // PC: Mouse drag to pan
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoomLevel > 1) {
            setIsDragging(true)
            dragStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                panX: panPosition.x,
                panY: panPosition.y
            }
        }
    }, [zoomLevel, panPosition])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && dragStartRef.current && zoomLevel > 1) {
            const deltaX = e.clientX - dragStartRef.current.x
            const deltaY = e.clientY - dragStartRef.current.y

            const maxPan = (zoomLevel - 1) * 50
            setPanPosition({
                x: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panX + deltaX / zoomLevel)),
                y: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.panY + deltaY / zoomLevel))
            })
        }
    }, [isDragging, zoomLevel])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        dragStartRef.current = null
    }, [])

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev)
        if (!isFullscreen) {
            setZoomLevel(1)
            setPanPosition({ x: 0, y: 0 })
        }
    }, [isFullscreen])

    const GalleryContent = () => (
        <>
            {/* Main Image Container */}
            <div
                ref={containerRef}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`relative w-full bg-neutral-900 border border-white/5 overflow-hidden touch-none select-none ${isFullscreen ? 'h-[80vh]' : 'h-[50vh] lg:h-auto lg:flex-1'
                    } ${zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'} ${isDragging ? 'cursor-grabbing' : ''}`}
            >
                <motion.div
                    ref={imageRef}
                    className="relative w-full h-full"
                    animate={{
                        scale: zoomLevel,
                        x: panPosition.x,
                        y: panPosition.y
                    }}
                    transition={{
                        type: isDragging ? 'tween' : 'spring',
                        stiffness: 300,
                        damping: 30,
                        duration: isDragging ? 0 : 0.3
                    }}
                >
                    <Image
                        src={images[selectedImage]}
                        alt={productName}
                        fill
                        className="object-contain p-8 lg:p-16 pointer-events-none"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized
                        draggable={false}
                    />
                </motion.div>

                {/* Zoom Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-2xl"
                    >
                        <button
                            onClick={() => handleZoom(zoomLevel - ZOOM_STEP)}
                            disabled={zoomLevel <= MIN_ZOOM}
                            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-amber-500 disabled:opacity-30 disabled:hover:text-white/30 transition-all rounded-full hover:bg-white/5"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>

                        <div className="w-20 h-1 bg-white/10 rounded-full mx-2 relative overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                                animate={{ width: `${((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%` }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        </div>

                        <button
                            onClick={() => handleZoom(zoomLevel + ZOOM_STEP)}
                            disabled={zoomLevel >= MAX_ZOOM}
                            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-amber-500 disabled:opacity-30 disabled:hover:text-white/30 transition-all rounded-full hover:bg-white/5"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>

                        <div className="w-[1px] h-6 bg-white/10 mx-1" />

                        <button
                            onClick={resetZoom}
                            disabled={zoomLevel === 1}
                            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-amber-500 disabled:opacity-30 transition-all rounded-full hover:bg-white/5"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-amber-500 transition-all rounded-full hover:bg-white/5"
                        >
                            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </motion.div>
                </div>

                {/* Zoom Percentage */}
                <AnimatePresence>
                    {zoomLevel > 1 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-6 left-6 bg-black/80 backdrop-blur-xl border border-amber-500/30 px-4 py-2 rounded-full text-amber-500 text-sm font-bold tracking-wider"
                        >
                            {Math.round(zoomLevel * 100)}%
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Zoom Hint - Mobile */}
                <AnimatePresence>
                    {showZoomHint && zoomLevel === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 text-white/60 text-xs tracking-wider"
                        >
                            <ZoomIn className="w-4 h-4 text-amber-500" />
                            <span className="hidden md:inline">Scroll to zoom • Drag to pan</span>
                            <span className="md:hidden">Pinch to zoom • Double-tap</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-white/60 text-xs tracking-widest">
                        {selectedImage + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
                >
                    {images.map((img, i) => (
                        <motion.button
                            key={i}
                            onClick={() => onImageChange(i)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative w-20 h-20 flex-shrink-0 border-2 transition-all duration-500 overflow-hidden rounded-lg ${selectedImage === i
                                ? 'border-amber-500 ring-2 ring-amber-500/30 ring-offset-4 ring-offset-black'
                                : 'border-white/10 grayscale hover:grayscale-0 hover:border-white/30'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${productName} view ${i + 1}`}
                                fill
                                className={`object-cover transition-transform duration-500 ${selectedImage === i ? 'scale-110' : 'scale-100'}`}
                                sizes="80px"
                                unoptimized
                            />
                            {selectedImage === i && (
                                <motion.div
                                    layoutId="thumbnail-highlight"
                                    className="absolute inset-0 bg-amber-500/10"
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </>
    )

    return (
        <>
            {/* Normal View */}
            {!isFullscreen && (
                <div className="w-full lg:w-[55%] lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 p-6 flex flex-col gap-6">
                    <GalleryContent />
                </div>
            )}

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                    >
                        <button
                            onClick={toggleFullscreen}
                            className="absolute top-6 right-6 w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-all z-50"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-full max-w-6xl flex flex-col gap-6">
                            <GalleryContent />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
