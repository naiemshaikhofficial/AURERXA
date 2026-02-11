'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, Loader2, Copy, Check, Image as ImageIcon } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { uploadToSupabase } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'

interface ImageUploadProps {
    onUploadComplete: (url: string) => void
    initialUrl?: string
    label?: string
}

export function ImageUpload({ onUploadComplete, initialUrl, label = "Upload Image" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(initialUrl || null)
    const [copied, setCopied] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file")
            return
        }

        try {
            setUploading(true)
            console.log("ImageUpload: Starting process for file:", file.name, file.size)

            // 1. Compression
            const options = {
                maxSizeMB: 0.2,         // Max 200KB (Optimized for speed)
                maxWidthOrHeight: 1920, // Maintain Full HD resolution
                useWebWorker: false,    // Disable web worker for better stability in some environments
            }

            toast.info("Refining image quality...")
            console.log("ImageUpload: Compressing with options:", options)
            const compressedFile = await imageCompression(file, options)
            console.log("ImageUpload: Compression complete. New size:", (compressedFile.size / 1024).toFixed(2), "KB")

            // 2. Upload to Supabase
            toast.info("Connecting to secure storage...")
            console.log("ImageUpload: Uploading to Supabase...")
            const { success, url, error } = await uploadToSupabase(compressedFile)

            if (success && url) {
                console.log("ImageUpload: Success! URL:", url)
                setPreview(url)
                onUploadComplete(url)
                toast.success("Image uploaded successfully!")
            } else {
                console.error("ImageUpload: Upload failed with error:", error)
                toast.error(error || "Upload failed. Please check your connection.")
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        } catch (error: any) {
            console.error("ImageUpload: Unexpected error during processing:", error)
            toast.error("Failed to process image: " + (error.message || "Unknown error"))
            if (fileInputRef.current) fileInputRef.current.value = ''
        } finally {
            setUploading(false)
        }
    }

    const copyToClipboard = () => {
        if (!preview) return
        navigator.clipboard.writeText(preview)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    const clearImage = () => {
        setPreview(null)
        onUploadComplete('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="space-y-2">
            {label && <label className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</label>}

            <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 aspect-video flex flex-col items-center justify-center transition-all hover:border-[#D4AF37]/50">
                {preview ? (
                    <>
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="bg-[#111] border-white/10 hover:border-[#D4AF37] text-white"
                                onClick={copyToClipboard}
                            >
                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? "Copied" : "Copy Link"}
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-9 w-9"
                                onClick={clearImage}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full h-full flex flex-col items-center justify-center gap-3 p-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-white/80">Click to upload</p>
                            <p className="text-xs text-white/40 mt-1">PNG, JPG or WEBP (Max 300KB compressed)</p>
                        </div>
                    </button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
    )
}
