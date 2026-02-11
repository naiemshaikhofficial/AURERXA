'use client'

import { useState, useEffect } from 'react'
import { getAdminProducts, updateProductDetails, addNewProduct, deleteProduct } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Trash2, Save, Image as ImageIcon, ExternalLink, Search, Package, DollarSign } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [search, setSearch] = useState('')
    const [deleting, setDeleting] = useState<string | null>(null)

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
        if (!confirm('Are you sure you want to save these changes?')) return
        setSaving(true)
        // Clean up empty URLs
        const cleanedImages = Array.isArray(editingProduct.images)
            ? editingProduct.images.filter((url: string) => url.trim() !== '')
            : []

        let result;
        if (editingProduct.id) {
            // Update existing
            result = await updateProductDetails(editingProduct.id, {
                image_url: editingProduct.image_url,
                images: cleanedImages,
                dimensions_width: editingProduct.dimensions_width,
                dimensions_height: editingProduct.dimensions_height,
                dimensions_length: editingProduct.dimensions_length,
                video_url: editingProduct.video_url,
                price: editingProduct.price,
                stock: editingProduct.stock,
            })
        } else {
            // New product
            result = await addNewProduct({
                name: editingProduct.name,
                price: editingProduct.price,
                image_url: editingProduct.image_url,
                images: cleanedImages,
                category_id: editingProduct.category_id,
                description: editingProduct.description || 'New artisanal release.',
                slug: editingProduct.name.toLowerCase().replace(/ /g, '-'),
                video_url: editingProduct.video_url,
                stock: editingProduct.stock || 0,
            })
        }

        if (result.success) {
            setMessage({ type: 'success', text: editingProduct.id ? 'Product updated successfully' : 'New masterpiece added & notification sent!' })
            await loadProducts()
            setEditingProduct(null)
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to save' })
        }
        setSaving(false)
        setTimeout(() => setMessage(null), 3000)
    }

    const handleDelete = async (product: any) => {
        if (!confirm(`Are you sure you want to PERMANENTLY DELETE "${product.name}"? This cannot be undone.`)) return
        setDeleting(product.id)
        const res = await deleteProduct(product.id)
        if (res.success) {
            setMessage({ type: 'success', text: `"${product.name}" deleted successfully.` })
            if (editingProduct?.id === product.id) setEditingProduct(null)
            await loadProducts()
        } else {
            setMessage({ type: 'error', text: res.error || 'Failed to delete' })
        }
        setDeleting(null)
        setTimeout(() => setMessage(null), 3000)
    }

    const filteredProducts = search
        ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase()) || p.categories?.name?.toLowerCase().includes(search.toLowerCase()))
        : products

    const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)

    return (
        <div className="selection:bg-amber-500/30">
            <main>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Product Management</h1>
                        <p className="text-white/40 text-sm mt-1">{products.length} products • {products.filter(p => (p.stock || 0) <= 5).length} low stock</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={async () => {
                                const { broadcastNotification } = await import('@/app/actions')
                                const res = await broadcastNotification('AURERXA Luxury Alert', 'Discover our newest arrivals in the Royal Collection.', '/collections')
                                if (res.success) alert('Broadcast sent to ' + (res as any).count + ' devices!')
                            }}
                            className="border-white/10 text-white/40 hover:text-white text-xs px-4 h-10 rounded-xl"
                        >
                            Test Broadcast
                        </Button>
                        <Button
                            onClick={() => setEditingProduct({ name: '', price: 0, image_url: '', images: [], category_id: products[0]?.category_id, stock: 0, description: '' })}
                            className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/80 text-xs px-4 h-10 rounded-xl"
                        >
                            <Plus className="w-4 h-4 mr-2" /> New Product
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30"
                    />
                </div>

                {message && (
                    <div className={`mb-6 p-4 border rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-sm">{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Product List */}
                    <div className="lg:col-span-2 space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12 text-white/30">No products found</div>
                        ) : (
                            filteredProducts.map((product) => (
                                <div key={product.id} className={`bg-[#111111] border rounded-xl p-4 flex items-center gap-4 hover:border-[#D4AF37]/20 transition group ${deleting === product.id ? 'opacity-50' : 'border-white/5'}`}>
                                    {/* Image */}
                                    <div className="relative w-14 h-14 bg-black rounded-lg border border-white/5 flex-shrink-0 overflow-hidden">
                                        <Image src={product.image_url} alt={product.name} fill className="object-cover p-1" sizes="56px" unoptimized />
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium truncate group-hover:text-[#D4AF37] transition-colors">{product.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-[#D4AF37] font-medium">{formatCurrency(product.price || 0)}</span>
                                            <span className="text-[10px] text-white/30 uppercase">{product.categories?.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${(product.stock || 0) <= 5 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/40'}`}>
                                                Stock: {product.stock ?? 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => startEditing(product)}
                                            className="px-3 py-1.5 text-xs text-[#D4AF37] bg-[#D4AF37]/10 rounded-lg hover:bg-[#D4AF37]/20 transition"
                                        >
                                            Edit
                                        </button>
                                        <Link
                                            href={`/products/${product.slug}`}
                                            target="_blank"
                                            className="p-1.5 text-white/20 hover:text-white transition"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            disabled={deleting === product.id}
                                            className="p-1.5 text-white/20 hover:text-red-400 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right: Edit Panel */}
                    <div className="lg:sticky lg:top-32 h-fit space-y-6">
                        {editingProduct ? (
                            <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-2xl p-6 space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">{editingProduct.id ? 'Edit Product' : 'New Product'}</h2>
                                    <p className="text-xs text-white/40 mt-0.5">{editingProduct.name || 'Unnamed'}</p>
                                </div>

                                <div className="space-y-5">
                                    {/* Name & Price */}
                                    {!editingProduct.id && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-wider">Name</label>
                                            <Input
                                                value={editingProduct.name}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                className="bg-white/5 border-white/10 rounded-xl h-10 text-sm focus:border-[#D4AF37]/30"
                                                placeholder="Product name"
                                            />
                                        </div>
                                    )}

                                    {/* Price & Stock */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-wider">Price (₹)</label>
                                            <Input
                                                type="number"
                                                value={editingProduct.price || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                                                className="bg-white/5 border-white/10 rounded-xl h-10 text-sm focus:border-[#D4AF37]/30"
                                                placeholder="Price"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-wider">Stock</label>
                                            <Input
                                                type="number"
                                                value={editingProduct.stock ?? ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                                                className="bg-white/5 border-white/10 rounded-xl h-10 text-sm focus:border-[#D4AF37]/30"
                                                placeholder="Stock"
                                            />
                                        </div>
                                    </div>

                                    {/* Main Image */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Main Image URL</label>
                                        <Input
                                            value={editingProduct.image_url}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                                            className="bg-white/5 border-white/10 rounded-xl h-10 text-sm focus:border-[#D4AF37]/30"
                                            placeholder="/image.jpg"
                                        />
                                    </div>

                                    {/* Video URL */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Video URL</label>
                                        <Input
                                            value={editingProduct.video_url || ''}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, video_url: e.target.value })}
                                            className="bg-white/5 border-white/10 rounded-xl h-10 text-sm focus:border-[#D4AF37]/30"
                                            placeholder="https://youtu.be/..."
                                        />
                                    </div>

                                    {/* Dimensions */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-wider text-center block">Width</label>
                                            <Input
                                                value={editingProduct.dimensions_width || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, dimensions_width: e.target.value })}
                                                className="bg-white/5 border-white/10 rounded-xl h-9 text-sm text-center focus:border-[#D4AF37]/30"
                                                placeholder="mm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-wider text-center block">Height</label>
                                            <Input
                                                value={editingProduct.dimensions_height || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, dimensions_height: e.target.value })}
                                                className="bg-white/5 border-white/10 rounded-xl h-9 text-sm text-center focus:border-[#D4AF37]/30"
                                                placeholder="mm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-white/40 uppercase tracking-wider text-center block">Length</label>
                                            <Input
                                                value={editingProduct.dimensions_length || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, dimensions_length: e.target.value })}
                                                className="bg-white/5 border-white/10 rounded-xl h-9 text-sm text-center focus:border-[#D4AF37]/30"
                                                placeholder="mm"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Images */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] text-white/40 uppercase tracking-wider">Gallery Images</label>
                                            <button onClick={addImageField} className="text-xs text-[#D4AF37] hover:text-[#D4AF37]/80 transition flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Add
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                            {editingProduct.images.map((url: string, index: number) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        value={url}
                                                        onChange={(e) => updateImageValue(index, e.target.value)}
                                                        className="bg-white/5 border-white/10 rounded-xl h-9 text-xs focus:border-[#D4AF37]/30"
                                                        placeholder="Image URL..."
                                                    />
                                                    <button
                                                        onClick={() => removeImageField(index)}
                                                        className="w-9 h-9 flex items-center justify-center bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {editingProduct.images.length === 0 && (
                                                <p className="text-xs text-white/20 text-center py-4 border border-dashed border-white/5 rounded-xl">No gallery images</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex gap-3">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 bg-[#D4AF37] text-black rounded-xl h-10 text-sm hover:bg-[#D4AF37]/80 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save</>}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setEditingProduct(null)}
                                        disabled={saving}
                                        className="rounded-xl h-10 border-white/10 text-white/40 hover:bg-white/5 text-sm"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center space-y-4">
                                <div className="mx-auto w-14 h-14 rounded-full border border-white/5 flex items-center justify-center text-white/10">
                                    <ImageIcon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Product Editor</h3>
                                    <p className="text-xs text-white/30 mt-1">Select a product to edit</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
