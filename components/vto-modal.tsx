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

        // --------------------------------------------------------
        // Landmark Mapping (MediaPipe -> Three.js World Space)
        // --------------------------------------------------------
        // Index 177: Left Ear Region (Tragus/Lobe approximation)
        // Index 401: Right Ear Region
        // MediaPipe coords are normalized [0,1]. We map to camera view plane.

        const mapLandmark = (index: number) => {
            const point = faceLandmarks[index]
            const x = (point.x - 0.5) * 2 // -1 to 1
            const y = -(point.y - 0.5) * 2 // -1 to 1 (inverted Y)

            // Unproject to world space at a fixed depth
            // We approximate depth based on face width or Z coord if available
            const depth = -Math.abs(point.z * 5) - 3 // Adjust depth multiplier

            // Simple projection for 2D video overlay effectively
            const vector = new THREE.Vector3(x * 2.5, y * 1.5, -2) // Manual calibration needed for perfect alignment
            // vector.unproject(camera) // Typically needed for true 3D

            return vector
        }

        const targetLeft = mapLandmark(177)
        const targetRight = mapLandmark(401)

        // Smoothing (Linear Interpolation)
        leftEarRef.current.lerp(targetLeft, 0.2)
        rightEarRef.current.lerp(targetRight, 0.2)

        // Calculate Head Rotation
        // Using face mesh normals or key points (nose tip vs ears)
        // Simple 2D rotation for now based on ear height diff
        const angle = Math.atan2(targetRight.y - targetLeft.y, targetRight.x - targetLeft.x)
        rotationRef.current.z = angle
    })

    const finalScale = [scale * 0.5, scale * 0.5, scale * 0.5]

    return (
        <>
            <ambientLight intensity={1.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
            <Environment preset="city" />

            {faceLandmarks && (
                <>
                    <EarringModel
                        position={[leftEarRef.current.x + manualAdjustments.x, leftEarRef.current.y + manualAdjustments.y, leftEarRef.current.z]}
                        rotation={[0, 0, rotationRef.current.z]}
                        scale={finalScale}
                    />
                    <EarringModel
                        position={[rightEarRef.current.x - manualAdjustments.x, rightEarRef.current.y + manualAdjustments.y, rightEarRef.current.z]}
                        rotation={[0, 0, rotationRef.current.z]}
                        scale={finalScale}
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

    // Manual adjustments
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (!isOpen) {
            stopCamera()
            return
        }

        let camera: any = null
        let faceMesh: any = null

        const initAR = async () => {
            try {
                // 1. Load MediaPipe Scripts dynamically
                setDebugMsg('Loading Vision Models...')
                if (!window.FaceMesh) {
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js')
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js')
                    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
                }

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
                    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                        setFaceLandmarks(results.multiFaceLandmarks[0])
                        setLoading(false)
                        setDebugMsg('')
                    }
                });

                // 3. Start Camera
                if (videoRef.current) {
                    const Camera = (window as any).Camera
                    camera = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (videoRef.current) {
                                await faceMesh.send({ image: videoRef.current });
                            }
                        },
                        width: 1280,
                        height: 720
                    });
                    await camera.start();
                }

            } catch (error) {
                console.error('AR Init Error:', error)
                setDebugMsg('Failed to create AR session. Please check permissions.')
            }
        }

        initAR()

        return () => {
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
                        <div className="p-8 border-t border-white/5 bg-neutral-950 relative z-20">
                            <div className="flex flex-wrap gap-8 items-center justify-center">
                                {/* Size Control */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[8px] text-white/20 uppercase font-bold tracking-[0.2em]">Earring Size</span>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
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
                                        min="-0.5"
                                        max="0.5"
                                        step="0.01"
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
                                        min="-0.5"
                                        max="0.5"
                                        step="0.01"
                                        value={position.y}
                                        onChange={(e) => setPosition(p => ({ ...p, y: parseFloat(e.target.value) }))}
                                        className="w-32 accent-amber-500 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

