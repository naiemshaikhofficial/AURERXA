'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, RefreshCcw, CameraIcon, ZoomIn, Move, RotateCw, Download, Share2, Loader2, Sparkles } from 'lucide-react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'

/* 
 * VTO Implementation for AURERXA
 * Tech Stack: React, Three.js (R3F), MediaPipe FaceMesh (via CDN)
 */

interface VTOModalProps {
    isOpen: boolean
    onClose: () => void
    productImage: string
    productName: string
    productModel?: string // Path to .glb file
}

// --------------------------------------------------------
// 1. Scene Components
// --------------------------------------------------------

function EarringModel({ position, rotation, scale, modelPath }: any) {
    // Placeholder model if no specific model provided
    // In production, load actual .glb files
    // const { scene } = useGLTF(modelPath || '/models/earring_placeholder.glb') 
    // For now, we use a procedural mesh for demonstration

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <mesh>
                <sphereGeometry args={[0.02, 32, 32]} />
                <meshStandardMaterial
                    color="#F5B400"
                    roughness={0.1}
                    metalness={0.9}
                    envMapIntensity={2}
                />
            </mesh>
            <mesh position={[0, -0.04, 0]}>
                <sphereGeometry args={[0.015, 32, 32]} />
                <meshStandardMaterial
                    color="white"
                    roughness={0.1}
                    metalness={1}
                    envMapIntensity={3}
                />
            </mesh>
            {/* Drop */}
            <mesh position={[0, -0.08, 0]}>
                <coneGeometry args={[0.01, 0.05, 32]} />
                <meshStandardMaterial
                    color="#F5B400"
                    roughness={0.1}
                    metalness={1}
                />
            </mesh>

            {/* Glow Effect */}
            <pointLight distance={1} intensity={2} color="#F59E0B" decay={2} />
        </group>
    )
}

function ARScene({ faceLandmarks, productName, scale, manualAdjustments }: any) {
    const { camera } = useThree()

    // Smooth dampening refs
    const leftEarRef = useRef(new THREE.Vector3())
    const rightEarRef = useRef(new THREE.Vector3())
    const rotationRef = useRef(new THREE.Euler())

    useFrame((state, delta) => {
        if (!faceLandmarks) return

        // 1. Calculate Face Scale (Distance between temporal landmarks 234 & 454)
        const p1 = faceLandmarks[234]
        const p2 = faceLandmarks[454]
        const faceWidth = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))

        // Target scale is proportional to face width (calibrated value)
        const targetScale = faceWidth * 2.2 * scale

        // 2. Position Ear Landmarks
        const mapLandmark = (index: number) => {
            const point = faceLandmarks[index]
            const x = (point.x - 0.5) * 2
            const y = -(point.y - 0.5) * 2
            const z = -point.z * 5 // MediaPipe Z is relative to face center

            return new THREE.Vector3(x * 2.5, y * 1.5, z - 2.5)
        }

        const targetLeft = mapLandmark(177)
        const targetRight = mapLandmark(401)

        // 3. Smooth Dampening
        leftEarRef.current.lerp(targetLeft, 0.3)
        rightEarRef.current.lerp(targetRight, 0.3)

        // 4. Calculate Rotation (Roll/Tilt)
        const roll = Math.atan2(targetRight.y - targetLeft.y, targetRight.x - targetLeft.x)

        // Pitch approximation (Nose vs Ears)
        const nose = faceLandmarks[1] // Nose tip
        const pitch = (nose.y - (faceLandmarks[10].y + faceLandmarks[152].y) / 2) * 2

        rotationRef.current.set(pitch * 0.5, 0, roll)

        // Dynamic scaling
        state.scene.traverse((obj) => {
            if (obj.type === 'Group') {
                obj.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
            }
        })
    })

    const finalScale = [scale * 0.5, scale * 0.5, scale * 0.5]

    return (
        <>
            <ambientLight intensity={1.2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fff" />
            <pointLight position={[5, 5, 5]} intensity={1} color="#fbbf24" /> {/* Golden highlight */}

            {faceLandmarks && (
                <>
                    <EarringModel
                        position={[leftEarRef.current.x + manualAdjustments.x, leftEarRef.current.y + manualAdjustments.y, leftEarRef.current.z]}
                        rotation={[rotationRef.current.x, 0, rotationRef.current.z]}
                        scale={[1, 1, 1]} // Actual scale handled in useFrame
                    />
                    <EarringModel
                        position={[rightEarRef.current.x - manualAdjustments.x, rightEarRef.current.y + manualAdjustments.y, rightEarRef.current.z]}
                        rotation={[rotationRef.current.x, 0, rotationRef.current.z]}
                        scale={[1, 1, 1]}
                    />
                </>
            )}
        </>
    )
}


// --------------------------------------------------------
// 2. Main Component
// --------------------------------------------------------

export function VTOModal({ isOpen, onClose, productImage, productName }: VTOModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [faceLandmarks, setFaceLandmarks] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [debugMsg, setDebugMsg] = useState('Initializing AR Engine...')

    const [showAdjust, setShowAdjust] = useState(false)
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (!isOpen) {
            stopCamera()
            return
        }

        let camera: any = null
        let faceMesh: any = null
        let isActive = true

        const initAR = async () => {
            try {
                // 1. Load MediaPipe Scripts dynamically
                setDebugMsg('Loading Vision Models...')
                if (!(window as any).FaceMesh) {
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js')
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js')
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
                }

                if (!isActive) return

                // 2. Initialize FaceMesh
                setDebugMsg('Starting Camera...')
                const FaceMesh = (window as any).FaceMesh
                faceMesh = new FaceMesh({
                    locateFile: (file: string) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                    }
                });

                faceMesh.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                faceMesh.onResults((results: any) => {
                    if (!isActive) return
                    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                        setFaceLandmarks(results.multiFaceLandmarks[0])
                        setDebugMsg('')
                    } else {
                        setFaceLandmarks(null)
                    }
                });

                // 3. Start Camera
                if (videoRef.current) {
                    const Camera = (window as any).Camera
                    camera = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (videoRef.current && isActive && faceMesh) {
                                try {
                                    await faceMesh.send({ image: videoRef.current });
                                } catch (err) {
                                    console.warn('FaceMesh send error (ignored):', err)
                                }
                            }
                        },
                        width: 640,
                        height: 480
                    });
                    await camera.start();
                    if (isActive) {
                        setLoading(false)
                        setDebugMsg('')
                    }
                }

            } catch (error) {
                console.error('AR Init Error:', error)
                if (isActive) setDebugMsg('Failed to create AR session. Please check permissions.')
            }
        }

        initAR()

        return () => {
            isActive = false
            if (camera) camera.stop()
            if (faceMesh) faceMesh.close()
            stopCamera()
        }
    }, [isOpen])

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }

    const loadScript = (src: string) => {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve(true)
                return
            }
            const script = document.createElement('script')
            script.src = src
            script.onload = () => resolve(true)
            script.onerror = () => reject(new Error(`Failed to load ${src}`))
            document.body.appendChild(script)
        })
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
                    <div className="relative w-full h-full max-w-5xl bg-neutral-950 border border-white/5 flex flex-col shadow-2xl rounded-2xl overflow-hidden">

                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-neutral-950 relative z-20">
                            <div className="space-y-1">
                                <span className="text-amber-200/60 text-[9px] tracking-[0.3em] font-bold uppercase block">Virtual Mirror</span>
                                <h2 className="text-white font-serif text-xl italic tracking-wide">{productName}</h2>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* AR Viewport */}
                        <div className="relative flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden">
                            {/* Camera Feed */}
                            <video
                                ref={videoRef}
                                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                                playsInline
                                muted
                            />

                            {/* Three.js Overlay */}
                            <div className="absolute inset-0 pointer-events-none z-10">
                                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                                    <ARScene
                                        faceLandmarks={faceLandmarks}
                                        productName={productName}
                                        scale={scale}
                                        manualAdjustments={position}
                                    />
                                </Canvas>

                                {/* Scanning Line Effect */}
                                <AnimatePresence>
                                    {!loading && !faceLandmarks && (
                                        <motion.div
                                            initial={{ top: '-10%' }}
                                            animate={{ top: '110%' }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20"
                                        />
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                    <p className="text-white/60 text-xs tracking-widest uppercase">{debugMsg}</p>
                                </div>
                            )}

                            {/* Success Hint */}
                            {!loading && (
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-neutral-950/50 backdrop-blur-md border border-white/5 text-[9px] text-white/60 uppercase tracking-[0.2em] pointer-events-none animate-in fade-in slide-in-from-top-4">
                                    <Sparkles className="w-3 h-3 inline mr-2 text-amber-400" />
                                    Face Detected • Move Head Slowly
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="p-6 border-t border-white/5 bg-neutral-950/80 backdrop-blur-md relative z-20">
                            <div className="flex flex-col items-center gap-6">
                                {!showAdjust ? (
                                    <button
                                        onClick={() => setShowAdjust(true)}
                                        className="px-8 py-3 bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full flex items-center gap-2"
                                    >
                                        <RefreshCcw className="w-3 h-3" />
                                        Fine-Tune Placement
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-wrap gap-8 items-center justify-center w-full"
                                    >
                                        {/* Size Control */}
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-[8px] text-white/20 uppercase font-bold tracking-[0.2em]">Earring Scale</span>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.01"
                                                value={scale}
                                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                                className="w-32 accent-amber-500 cursor-pointer"
                                            />
                                        </div>

                                        {/* X-Offset */}
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-[8px] text-white/20 uppercase font-bold tracking-[0.2em]">Adjust Width</span>
                                            <input
                                                type="range"
                                                min="-0.2"
                                                max="0.2"
                                                step="0.005"
                                                value={position.x}
                                                onChange={(e) => setPosition(p => ({ ...p, x: parseFloat(e.target.value) }))}
                                                className="w-32 accent-amber-500 cursor-pointer"
                                            />
                                        </div>

                                        {/* Y-Offset */}
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-[8px] text-white/20 uppercase font-bold tracking-[0.2em]">Adjust Height</span>
                                            <input
                                                type="range"
                                                min="-0.2"
                                                max="0.2"
                                                step="0.005"
                                                value={position.y}
                                                onChange={(e) => setPosition(p => ({ ...p, y: parseFloat(e.target.value) }))}
                                                className="w-32 accent-amber-500 cursor-pointer"
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                setShowAdjust(false)
                                                setScale(1)
                                                setPosition({ x: 0, y: 0 })
                                            }}
                                            className="text-[8px] text-amber-500/50 uppercase tracking-widest hover:text-amber-500 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

