'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { updateProductDetails, addNewProduct, deleteProduct } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Trash2, Save, Image as ImageIcon, ExternalLink, Search, Package as PackageIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ImageUpload } from '@/components/admin/image-upload'
import supabaseLoader from '@/lib/supabase-loader'
import { getSubCategories } from '@/app/actions'
import { InternalNotes } from '@/components/admin/internal-notes'

export function ProductsClient({ initialProducts, total, initialCategories = [], adminRole }: { initialProducts: any[], total: number, initialCategories?: any[], adminRole?: string }) {
    const [products, setProducts] = useState(initialProducts)
    const [subCategories, setSubCategories] = useState<any[]>([])
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentSearch = searchParams.get('search') || ''
    const currentPage = Number(searchParams.get('page')) || 1
    const currentCategoryId = searchParams.get('categoryId') || 'all'
    const currentStockStatus = searchParams.get('stockStatus') || 'all'

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        if (key !== 'page') params.set('page', '1') // Reset page on filter change
        router.push(`${pathname}?${params.toString()}`)
    }

    useEffect(() => {
        const loadSubCategories = async () => {
            const subs = await getSubCategories()
            setSubCategories(subs)
        }
        loadSubCategories()
    }, [])

    useEffect(() => { setProducts(initialProducts) }, [initialProducts])

    const startEditing = (product: any) => {
        let rawImages = product.images;
        if (typeof rawImages === 'string' && rawImages.startsWith('{')) {
            rawImages = rawImages.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
        }
        setEditingProduct({
            ...product,
            images: Array.isArray(rawImages) ? rawImages : [],
            dimensions_unit: product.dimensions_unit || 'mm',
            featured: !!product.featured,
            bestseller: !!product.bestseller,
            gender: product.gender || 'Unisex',
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            weight_grams: product.weight_grams || 0,
            purity: product.purity || '',
            slug: product.slug || product.name.toLowerCase().replace(/ /g, '-'),
            sub_category_id: product.sub_category_id || null,
            tags: Array.isArray(product.tags) ? product.tags : [],
            material_type: product.material_type || null,
        })
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
                name: editingProduct.name,
                description: editingProduct.description,
                image_url: editingProduct.image_url,
                images: cleanedImages,
                dimensions_width: editingProduct.dimensions_width,
                dimensions_height: editingProduct.dimensions_height,
                dimensions_length: editingProduct.dimensions_length,
                dimensions_unit: editingProduct.dimensions_unit,
                video_url: editingProduct.video_url,
                price: editingProduct.price,
                stock: editingProduct.stock,
                category_id: editingProduct.category_id,
                featured: editingProduct.featured,
                bestseller: editingProduct.bestseller,
                weight_grams: editingProduct.weight_grams,
                purity: editingProduct.purity,
                gender: editingProduct.gender,
                sizes: editingProduct.sizes,
                slug: editingProduct.slug,
                sub_category_id: editingProduct.sub_category_id,
                tags: Array.isArray(editingProduct.tags) ? editingProduct.tags : [],
                material_type: editingProduct.material_type || null,
            })
        } else {
            result = await addNewProduct({
                name: editingProduct.name,
                price: editingProduct.price,
                image_url: editingProduct.image_url,
                images: cleanedImages,
                category_id: editingProduct.category_id,
                description: editingProduct.description || 'New artisanal release.',
                slug: editingProduct.slug || editingProduct.name.toLowerCase().replace(/ /g, '-'),
                video_url: editingProduct.video_url,
                dimensions_width: editingProduct.dimensions_width,
                dimensions_height: editingProduct.dimensions_height,
                dimensions_length: editingProduct.dimensions_length,
                dimensions_unit: editingProduct.dimensions_unit || 'mm',
                stock: editingProduct.stock || 0,
                featured: editingProduct.featured || false,
                bestseller: editingProduct.bestseller || false,
                weight_grams: editingProduct.weight_grams || 0,
                purity: editingProduct.purity || '',
                gender: editingProduct.gender || 'Unisex',
                sizes: editingProduct.sizes || [],
                sub_category_id: editingProduct.sub_category_id || null,
                tags: Array.isArray(editingProduct.tags) ? editingProduct.tags : [],
                material_type: editingProduct.material_type || null,
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
                        {(adminRole === 'main_admin' || adminRole === 'product_manager') && (
                            <Button
                                onClick={() => setEditingProduct({
                                    name: '',
                                    price: 0,
                                    image_url: '',
                                    images: [],
                                    category_id: products[0]?.category_id,
                                    stock: 0,
                                    description: '',
                                    dimensions_unit: 'mm',
                                    featured: false,
                                    bestseller: false,
                                    gender: 'Unisex',
                                    sizes: [],
                                    weight_grams: 0,
                                    purity: '',
                                    slug: '',
                                    sub_category_id: null,
                                    tags: []
                                })}
                                className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/80 text-xs px-4 h-10 rounded-xl"
                            >
                                <Plus className="w-4 h-4 mr-2" /> New Product
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            defaultValue={currentSearch}
                            onKeyDown={e => e.key === 'Enter' && updateFilters('search', e.currentTarget.value)}
                            onBlur={e => updateFilters('search', e.currentTarget.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30"
                        />
                    </div>

                    <Select value={currentCategoryId} onValueChange={val => updateFilters('categoryId', val)}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-white h-11">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                            <SelectItem value="all">All Categories</SelectItem>
                            {initialCategories.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={currentStockStatus} onValueChange={val => updateFilters('stockStatus', val)}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-white h-11">
                            <SelectValue placeholder="Stock Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                            <SelectItem value="all">All Stock Status</SelectItem>
                            <SelectItem value="in">In Stock (&gt;5)</SelectItem>
                            <SelectItem value="low">Low Stock (1-5)</SelectItem>
                            <SelectItem value="out">Out of Stock (0)</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-sm text-white/40">
                        <span className="hidden lg:inline text-[10px] uppercase font-bold tracking-widest">Price:</span>
                        <input
                            type="number"
                            placeholder="Min"
                            defaultValue={searchParams.get('minPrice') || ''}
                            onBlur={e => updateFilters('minPrice', e.target.value)}
                            className="w-16 bg-transparent text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-white/20"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            defaultValue={searchParams.get('maxPrice') || ''}
                            onBlur={e => updateFilters('maxPrice', e.target.value)}
                            className="w-16 bg-transparent text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-white/20"
                        />
                    </div>
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
                        {products.length === 0 ? (
                            <div className="text-center py-12 text-white/30">No products found</div>
                        ) : (
                            <>
                                {products.map((product) => (
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
                                                {product.sub_categories?.name && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37]">{product.sub_categories.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={() => startEditing(product)} className="px-3 py-1.5 text-xs text-[#D4AF37] bg-[#D4AF37]/10 rounded-lg hover:bg-[#D4AF37]/20 transition">Edit</button>
                                            <Link href={`/products/${product.slug}`} target="_blank" className="p-1.5 text-white/20 hover:text-white transition"><ExternalLink className="w-4 h-4" /></Link>
                                            {adminRole === 'main_admin' && (
                                                <button onClick={() => handleDelete(product)} disabled={deleting === product.id} className="p-1.5 text-white/20 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {total > 20 && (
                                    <div className="flex items-center justify-center gap-2 pt-6">
                                        {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => updateFilters('page', String(p))}
                                                className={`w-10 h-10 rounded-xl text-xs font-medium transition ${currentPage === p ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
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
                                    <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="bg-white/5 border-white/10 rounded-xl" placeholder="Product Name" />

                                    <Textarea
                                        value={editingProduct.description || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-xl min-h-[100px]"
                                        placeholder="Product Description"
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <Select
                                            value={editingProduct.category_id}
                                            onValueChange={(val) => setEditingProduct({ ...editingProduct, category_id: val })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-xs md:text-sm">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialCategories.map((cat: any) => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={editingProduct.sub_category_id || 'none'}
                                            onValueChange={(val) => setEditingProduct({ ...editingProduct, sub_category_id: val === 'none' ? null : val })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-xs md:text-sm">
                                                <SelectValue placeholder="Sub-category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Sub-category</SelectItem>
                                                {subCategories
                                                    .filter(sub => sub.category_id === editingProduct.category_id)
                                                    .map((sub: any) => (
                                                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/20 uppercase ml-1">Price (₹)</p>
                                            <Input
                                                type="number"
                                                value={editingProduct.price || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                                                className="bg-white/5 border-white/10 rounded-xl"
                                                placeholder="Price"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/20 uppercase ml-1">Stock</p>
                                            <Input
                                                type="number"
                                                value={editingProduct.stock || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                                                className="bg-white/5 border-white/10 rounded-xl"
                                                placeholder="Stock"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/20 uppercase ml-1">Gender</p>
                                            <Select
                                                value={editingProduct.gender || 'Unisex'}
                                                onValueChange={(val) => setEditingProduct({ ...editingProduct, gender: val })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-xs md:text-sm">
                                                    <SelectValue placeholder="Gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Unisex">Unisex</SelectItem>
                                                    <SelectItem value="Men">Men</SelectItem>
                                                    <SelectItem value="Women">Women</SelectItem>
                                                    <SelectItem value="Kids">Kids</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/20 uppercase ml-1">Weight (g)</p>
                                            <Input
                                                type="number"
                                                value={editingProduct.weight_grams || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, weight_grams: parseFloat(e.target.value) || 0 })}
                                                className="bg-white/5 border-white/10 rounded-xl"
                                                placeholder="Weight"
                                            />
                                        </div>
                                    </div>

                                    {/* Material Type */}
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/20 uppercase ml-1">Material Type</p>
                                        <Select
                                            value={editingProduct.material_type || 'none'}
                                            onValueChange={(val) => setEditingProduct({ ...editingProduct, material_type: val === 'none' ? null : val })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-xs md:text-sm">
                                                <SelectValue placeholder="Select Material" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Not Set</SelectItem>
                                                <SelectItem value="real_gold">🟡 22K Real Gold</SelectItem>
                                                <SelectItem value="gold_plated">🟠 Gold Plated</SelectItem>
                                                <SelectItem value="bentex">⚪ Fashion / Bentex</SelectItem>
                                                <SelectItem value="silver">🔵 Silver</SelectItem>
                                                <SelectItem value="diamond">💎 Diamond</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/20 uppercase ml-1">Purity</p>
                                            <Input
                                                value={editingProduct.purity || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, purity: e.target.value })}
                                                className="bg-white/5 border-white/10 rounded-xl"
                                                placeholder="e.g. 22K Gold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white/20 uppercase ml-1">Slug</p>
                                            <Input
                                                value={editingProduct.slug || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                                                className="bg-white/5 border-white/10 rounded-xl"
                                                placeholder="slug"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/20 uppercase ml-1">Available Sizes (Comma separated)</p>
                                        <Input
                                            value={Array.isArray(editingProduct.sizes) ? editingProduct.sizes.join(', ') : (editingProduct.sizes || '')}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                            className="bg-white/5 border-white/10 rounded-xl"
                                            placeholder="e.g. S, M, L"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/20 uppercase ml-1">Video (YT URL)</p>
                                        <Input
                                            value={editingProduct.video_url || ''}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, video_url: e.target.value })}
                                            className="bg-white/5 border-white/10 rounded-xl"
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-white/20 uppercase ml-1">Collections / Tags (Comma separated)</p>
                                        <Input
                                            value={Array.isArray(editingProduct.tags) ? editingProduct.tags.join(', ') : ''}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                            className="bg-white/5 border-white/10 rounded-xl"
                                            placeholder="e.g. Soulmate, Valentines, Hip Hop"
                                        />
                                    </div>

                                    <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Visibility</p>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingProduct({ ...editingProduct, featured: !editingProduct.featured })}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${editingProduct.featured ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-white/5 text-white/30 border-white/5'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${editingProduct.featured ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`} />
                                                    Featured
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingProduct({ ...editingProduct, bestseller: !editingProduct.bestseller })}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${editingProduct.bestseller ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-white/5 text-white/30 border-white/5'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${editingProduct.bestseller ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                                                    Bestseller
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Dimensions</label>
                                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                                {['mm', 'cm'].map((u) => (
                                                    <button
                                                        key={u}
                                                        type="button"
                                                        onClick={() => setEditingProduct({ ...editingProduct, dimensions_unit: u })}
                                                        className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${editingProduct.dimensions_unit === u ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-white/40 hover:text-white'}`}
                                                    >
                                                        {u.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-white/20 text-center uppercase">Length</p>
                                                <Input
                                                    type="number"
                                                    value={editingProduct.dimensions_length || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, dimensions_length: parseFloat(e.target.value) || 0 })}
                                                    className="bg-transparent border-white/5 rounded-lg text-center h-8 text-xs"
                                                    placeholder="L"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-white/20 text-center uppercase">Width</p>
                                                <Input
                                                    type="number"
                                                    value={editingProduct.dimensions_width || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, dimensions_width: parseFloat(e.target.value) || 0 })}
                                                    className="bg-transparent border-white/5 rounded-lg text-center h-8 text-xs"
                                                    placeholder="W"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-white/20 text-center uppercase">Height</p>
                                                <Input
                                                    type="number"
                                                    value={editingProduct.dimensions_height || ''}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, dimensions_height: parseFloat(e.target.value) || 0 })}
                                                    className="bg-transparent border-white/5 rounded-lg text-center h-8 text-xs"
                                                    placeholder="H"
                                                />
                                            </div>
                                        </div>
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
                                                    {adminRole === 'main_admin' && (
                                                        <button
                                                            onClick={() => removeImageField(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                            title="Remove Image"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
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
                                    {adminRole === 'main_admin' || adminRole === 'product_manager' ? (
                                        <Button onClick={handleSave} disabled={saving} className="w-full bg-[#D4AF37] text-black font-bold h-12 rounded-xl">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                <div className="flex items-center gap-2">
                                                    <Save className="w-4 h-4" /> Save Master Piece
                                                </div>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                                            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Read-Only Mode</p>
                                        </div>
                                    )}

                                    {/* Internal Notes for Product */}
                                    {editingProduct.id && (
                                        <div className="pt-4 border-t border-white/5">
                                            <InternalNotes entityType="product" entityId={editingProduct.id} />
                                        </div>
                                    )}

                                    {editingProduct.id && adminRole === 'main_admin' && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDelete(editingProduct)}
                                            disabled={saving}
                                            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete Product
                                        </Button>
                                    )}

                                    <Button variant="ghost" onClick={() => setEditingProduct(null)} className="w-full text-white/40">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#111111] border border-white/5 rounded-2xl p-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                                    <PackageIcon className="w-8 h-8 text-white/20" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium">Select a product to edit</h3>
                                    <p className="text-white/40 text-sm max-w-xs mx-auto">Click on any product from the list to update its details or create a new one.</p>
                                </div>
                                {(adminRole === 'main_admin' || adminRole === 'product_manager') && (
                                    <Button
                                        onClick={() => setEditingProduct({
                                            name: '',
                                            price: 0,
                                            image_url: '',
                                            images: [],
                                            category_id: products[0]?.category_id,
                                            stock: 0,
                                            description: '',
                                            dimensions_unit: 'mm',
                                            featured: false,
                                            bestseller: false,
                                            gender: 'Unisex',
                                            sizes: [],
                                            weight_grams: 0,
                                            purity: '',
                                            slug: '',
                                            sub_category_id: null,
                                            tags: []
                                        })}
                                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10"
                                    >
                                        Start Fresh Project
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
