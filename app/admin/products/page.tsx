'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getAdminProducts, updateProductDetails } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Trash2, Save, Image as ImageIcon, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        const data = await getAdminProducts()
        setProducts(data)
        setLoading(false)
    }

    const startEditing = (product: any) => {
        let rawImages = product.images;

        // Defensive check: If Supabase returns a Postgres array literal string "{url1,url2}"
        if (typeof rawImages === 'string' && rawImages.startsWith('{') && rawImages.endsWith('}')) {
            rawImages = rawImages.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
        }

        setEditingProduct({
            ...product,
            images: Array.isArray(rawImages) ? rawImages : []
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const addImageField = () => {
        setEditingProduct({
            ...editingProduct,
            images: [...editingProduct.images, '']
        })
    }

    const removeImageField = (index: number) => {
        const newImages = [...editingProduct.images]
        newImages.splice(index, 1)
        setEditingProduct({
            ...editingProduct,
            images: newImages
        })
    }

    const updateImageValue = (index: number, value: string) => {
        const newImages = [...editingProduct.images]
        newImages[index] = value
        setEditingProduct({
            ...editingProduct,
            images: newImages
        })
    }

    const handleSave = async () => {
        if (!editingProduct) return
        setSaving(true)
        // Clean up empty URLs
        const cleanedImages = editingProduct.images.filter((url: string) => url.trim() !== '')

        const result = await updateProductDetails(editingProduct.id, {
            image_url: editingProduct.image_url,
            images: cleanedImages,
            dimensions_width: editingProduct.dimensions_width,
            dimensions_height: editingProduct.dimensions_height,
            dimensions_length: editingProduct.dimensions_length
        })

        if (result.success) {
            setMessage({ type: 'success', text: 'Product images updated successfully' })
            await loadProducts()
            setEditingProduct(null)
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update' })
        }
        setSaving(false)
        setTimeout(() => setMessage(null), 3000)
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-gradient-gold mb-2 italic">Product Management</h1>
                        <p className="text-white/40 font-premium-sans text-[10px] tracking-[0.3em] uppercase">Configure Multi-Image Galleries</p>
                    </div>
                </div>

                {message && (
                    <div className={`mb-8 p-4 border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500' : 'border-red-500/50 bg-red-500/10 text-red-500'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-[10px] font-premium-sans tracking-[0.2em] uppercase">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Product List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-neutral-900/50 border border-white/5 p-4 hidden md:grid grid-cols-4 gap-4 text-[9px] font-premium-sans tracking-[0.2em] uppercase text-white/30">
                            <div className="col-span-2">Product Details</div>
                            <div>Category</div>
                            <div>Actions</div>
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-4 text-white/20">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-[10px] font-premium-sans tracking-widest uppercase">Fetching Vault...</span>
                            </div>
                        ) : (
                            products.map((product) => (
                                <div key={product.id} className="bg-neutral-900 border border-white/5 p-4 grid grid-cols-1 md:grid-cols-4 gap-6 items-center hover:border-amber-500/30 transition-all duration-500 group">
                                    <div className="col-span-2 flex items-center gap-4">
                                        <div className="relative w-16 h-16 bg-black border border-white/5 flex-shrink-0 overflow-hidden">
                                            <Image src={product.image_url} alt={product.name} fill className="object-cover p-2 transition-transform duration-700 group-hover:scale-110" sizes="64px" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-lg text-white group-hover:text-amber-500 transition-colors">{product.name}</h3>
                                            <p className="text-[10px] text-white/30 truncate max-w-[200px]">{product.slug}</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-premium-sans tracking-widest text-white/50 uppercase">
                                        {product.categories?.name}
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => startEditing(product)}
                                            className="text-[9px] font-premium-sans tracking-[0.2em] uppercase text-amber-500 hover:text-white transition-colors"
                                        >
                                            Edit Images
                                        </button>
                                        <Link
                                            href={`/products/${product.slug}`}
                                            target="_blank"
                                            className="text-white/20 hover:text-white transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right: Edit Panel */}
                    <div className="lg:sticky lg:top-32 h-fit space-y-6">
                        {editingProduct ? (
                            <div className="bg-neutral-900 border border-amber-500/30 p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <h2 className="font-serif text-2xl italic">Editor</h2>
                                    <p className="text-[10px] font-premium-sans tracking-[0.2em] text-white/40 uppercase">Editing: {editingProduct.name}</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Main Image */}
                                    <div className="space-y-3 font-premium-sans">
                                        <label className="text-[9px] text-amber-500/60 tracking-[0.2em] uppercase">Main Image URL</label>
                                        <div className="relative">
                                            <Input
                                                value={editingProduct.image_url}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                                                className="bg-black border-white/10 rounded-none h-12 text-xs focus:border-amber-500 transition-all font-sans"
                                                placeholder="e.g., /heritage-rings.jpg"
                                            />
                                            <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                                        </div>
                                    </div>

                                    {/* Dimensions */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-3 font-premium-sans">
                                            <label className="text-[8px] text-amber-500/60 tracking-[0.2em] uppercase text-center block">Width (mm)</label>
                                            <Input
                                                value={editingProduct.dimensions_width || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, dimensions_width: e.target.value })}
                                                className="bg-black border-white/10 rounded-none h-10 text-xs focus:border-amber-500 transition-all font-sans text-center"
                                                placeholder="12"
                                            />
                                        </div>
                                        <div className="space-y-3 font-premium-sans">
                                            <label className="text-[8px] text-amber-500/60 tracking-[0.2em] uppercase text-center block">Height (mm)</label>
                                            <Input
                                                value={editingProduct.dimensions_height || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, dimensions_height: e.target.value })}
                                                className="bg-black border-white/10 rounded-none h-10 text-xs focus:border-amber-500 transition-all font-sans text-center"
                                                placeholder="20"
                                            />
                                        </div>
                                        <div className="space-y-3 font-premium-sans">
                                            <label className="text-[8px] text-amber-500/60 tracking-[0.2em] uppercase text-center block">Length (mm)</label>
                                            <Input
                                                value={editingProduct.dimensions_length || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, dimensions_length: e.target.value })}
                                                className="bg-black border-white/10 rounded-none h-10 text-xs focus:border-amber-500 transition-all font-sans text-center"
                                                placeholder="15"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Images */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] font-premium-sans text-amber-500/60 tracking-[0.2em] uppercase">Additional Gallery Images</label>
                                            <button
                                                onClick={addImageField}
                                                className="text-[9px] font-premium-sans text-white/40 hover:text-amber-500 transition-colors uppercase flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add Image
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {editingProduct.images.map((url: string, index: number) => (
                                                <div key={index} className="flex gap-2 group/field">
                                                    <Input
                                                        value={url}
                                                        onChange={(e) => updateImageValue(index, e.target.value)}
                                                        className="bg-black border-white/10 rounded-none h-10 text-[10px] focus:border-amber-500 transition-all font-sans"
                                                        placeholder="Gallery image URL..."
                                                    />
                                                    <button
                                                        onClick={() => removeImageField(index)}
                                                        className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all rounded-none"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {editingProduct.images.length === 0 && (
                                                <p className="text-[10px] text-white/20 italic text-center py-4 border border-dashed border-white/5">No gallery images added</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex gap-4">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 bg-amber-500 text-black rounded-none h-12 uppercase font-premium-sans text-[10px] tracking-widest hover:bg-amber-400 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Vault</>}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setEditingProduct(null)}
                                        disabled={saving}
                                        className="rounded-none h-12 border-white/10 text-white/40 hover:bg-white/5 hover:text-white uppercase font-premium-sans text-[9px] tracking-widest"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-neutral-900 border border-white/5 p-12 text-center space-y-6">
                                <div className="mx-auto w-16 h-16 rounded-full border border-white/5 flex items-center justify-center text-white/10">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-serif text-xl">The Vault Editor</h3>
                                    <p className="text-xs text-white/30 leading-relaxed italic max-w-[200px] mx-auto font-serif">Select a masterpiece from the left to configure its visual journey.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
