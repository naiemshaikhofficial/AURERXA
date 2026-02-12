'use client'

import { useState, useEffect } from 'react'
import { updateProductDetails, addNewProduct, deleteProduct } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Trash2, Save, Image as ImageIcon, ExternalLink, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ImageUpload } from '@/components/admin/image-upload'
import supabaseLoader from '@/lib/supabase-loader'
import { useRouter } from 'next/navigation'

export function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [search, setSearch] = useState('')
    const [deleting, setDeleting] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => { setProducts(initialProducts) }, [initialProducts])

    const startEditing = (product: any) => {
        let rawImages = product.images;
        if (typeof rawImages === 'string' && rawImages.startsWith('{')) {
            rawImages = rawImages.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
        }
        setEditingProduct({ ...product, images: Array.isArray(rawImages) ? rawImages : [] })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const addImageField = () => setEditingProduct({ ...editingProduct, images: [...editingProduct.images, ''] })
    const removeImageField = (index: number) => {
        const newImages = [...editingProduct.images]
        newImages.splice(index, 1)
        setEditingProduct({ ...editingProduct, images: newImages })
    }

    const handleSave = async () => {
        if (!editingProduct || !confirm('Save changes?')) return
        setSaving(true)
        const cleanedImages = Array.isArray(editingProduct.images) ? editingProduct.images.filter((url: string) => url.trim() !== '') : []

        let result;
        if (editingProduct.id) {
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
            setMessage({ type: 'success', text: 'Saved successfully' })
            setEditingProduct(null)
            router.refresh()
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed' })
        }
        setSaving(false)
        setTimeout(() => setMessage(null), 3000)
    }

    const handleDelete = async (product: any) => {
        if (!confirm(`Delete "${product.name}"?`)) return
        setDeleting(product.id)
        const res = await deleteProduct(product.id)
        if (res.success) {
            setMessage({ type: 'success', text: 'Deleted' })
            if (editingProduct?.id === product.id) setEditingProduct(null)
            router.refresh()
        } else {
            setMessage({ type: 'error', text: res.error })
        }
        setDeleting(null)
        setTimeout(() => setMessage(null), 3000)
    }

    const filteredProducts = search
        ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
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
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12 text-white/30">No products found</div>
                        ) : (
                            filteredProducts.map((product) => (
                                <div key={product.id} className={`bg-[#111111] border rounded-xl p-4 flex items-center gap-4 hover:border-[#D4AF37]/20 transition group ${deleting === product.id ? 'opacity-50' : 'border-white/5'}`}>
                                    <div className="relative w-14 h-14 bg-black rounded-lg border border-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {(product.image_url || (product.images && product.images[0])) ? (
                                            <Image src={product.image_url || product.images[0]} alt={product.name} fill className="object-cover p-1" sizes="56px" loader={supabaseLoader} />
                                        ) : <ImageIcon className="w-6 h-6 text-white/20" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium truncate group-hover:text-[#D4AF37] transition-colors">{product.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-[#D4AF37] font-medium">{formatCurrency(product.price || 0)}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${(product.stock || 0) <= 5 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/40'}`}>Stock: {product.stock ?? 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => startEditing(product)} className="px-3 py-1.5 text-xs text-[#D4AF37] bg-[#D4AF37]/10 rounded-lg hover:bg-[#D4AF37]/20 transition">Edit</button>
                                        <Link href={`/products/${product.slug}`} target="_blank" className="p-1.5 text-white/20 hover:text-white transition"><ExternalLink className="w-4 h-4" /></Link>
                                        <button onClick={() => handleDelete(product)} disabled={deleting === product.id} className="p-1.5 text-white/20 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right: Edit Panel */}
                    <div className="lg:sticky lg:top-32 h-fit space-y-6">
                        {editingProduct ? (
                            <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-2xl p-6 space-y-6 animate-in slide-in-from-right duration-300">
                                <div>
                                    <h2 className="text-lg font-semibold">{editingProduct.id ? 'Edit Product' : 'New Product'}</h2>
                                    <p className="text-xs text-white/40 mt-0.5">{editingProduct.name || 'Unnamed'}</p>
                                </div>
                                <div className="space-y-4">
                                    <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="bg-white/5 border-white/10 rounded-xl" placeholder="Name" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 rounded-xl" placeholder="Price" />
                                        <Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} className="bg-white/5 border-white/10 rounded-xl" placeholder="Stock" />
                                    </div>
                                    <ImageUpload label="Main Image" initialUrl={editingProduct.image_url} onUploadComplete={(url) => setEditingProduct({ ...editingProduct, image_url: url })} />

                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Additional Images</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {editingProduct.images?.map((url: string, index: number) => (
                                                <div key={index} className="relative group">
                                                    <ImageUpload
                                                        initialUrl={url}
                                                        onUploadComplete={(newUrl) => {
                                                            const newImages = [...editingProduct.images]
                                                            newImages[index] = newUrl
                                                            setEditingProduct({ ...editingProduct, images: newImages })
                                                        }}
                                                        className="aspect-square"
                                                    />
                                                    <button
                                                        onClick={() => removeImageField(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                        title="Remove Image"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addImageField}
                                                className="aspect-square border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition gap-2"
                                            >
                                                <Plus className="w-6 h-6" />
                                                <span className="text-xs">Add Image</span>
                                            </button>
                                        </div>
                                    </div>
                                    <Button onClick={handleSave} disabled={saving} className="w-full bg-[#D4AF37] text-black">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setEditingProduct(null)} className="w-full">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center space-y-4">
                                <div className="mx-auto w-14 h-14 rounded-full border border-white/5 flex items-center justify-center text-white/10"><ImageIcon className="w-7 h-7" /></div>
                                <div><h3 className="text-lg font-semibold">Product Editor</h3><p className="text-xs text-white/30 mt-1">Select a product to edit</p></div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
