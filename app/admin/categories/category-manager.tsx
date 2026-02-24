'use client'

import React, { useState, useEffect } from 'react'
import { getCategories, getSubCategories, addSubCategory, updateSubCategory, deleteSubCategory } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Edit2, Loader2, ChevronRight, Tags } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CategoryManager() {
    const [categories, setCategories] = useState<any[]>([])
    const [subCategories, setSubCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<any>(null)
    const [isAddingSub, setIsAddingSub] = useState(false)
    const [editingSub, setEditingSub] = useState<any>(null)
    const [newSubName, setNewSubName] = useState('')
    const [processing, setProcessing] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const loadData = async () => {
            const cats = await getCategories()
            const subs = await getSubCategories()
            setCategories(cats)
            setSubCategories(subs)
            setLoading(false)
        }
        loadData()
    }, [])

    const handleAddSub = async () => {
        if (!newSubName || !selectedCategory) return
        setProcessing(true)
        const slug = newSubName.toLowerCase().replace(/ /g, '-')
        const res = await addSubCategory({
            name: newSubName,
            slug,
            category_id: selectedCategory.id
        })
        if (res.success) {
            setSubCategories([...subCategories, (res as any).data])
            setNewSubName('')
            setIsAddingSub(false)
            router.refresh()
        }
        setProcessing(false)
    }

    const handleUpdateSub = async () => {
        if (!editingSub || !newSubName) return
        setProcessing(true)
        const res = await updateSubCategory(editingSub.id, { name: newSubName })
        if (res.success) {
            setSubCategories(subCategories.map(s => s.id === editingSub.id ? { ...s, name: newSubName } : s))
            setEditingSub(null)
            setNewSubName('')
            router.refresh()
        }
        setProcessing(false)
    }

    const handleDeleteSub = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete sub-category "${name}"?`)) return
        setProcessing(true)
        const res = await deleteSubCategory(id)
        if (res.success) {
            setSubCategories(subCategories.filter(s => s.id !== id))
            router.refresh()
        }
        setProcessing(false)
    }

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Category Registry</h1>
                <p className="text-white/40 text-sm mt-1">Manage main categories and their artisanal sub-classifications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Categories Section */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">Main Categories</h2>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedCategory?.id === cat.id ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#111111] border-white/5 text-white/60 hover:border-white/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    <span className="font-medium">{cat.name}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory?.id === cat.id ? 'translate-x-1' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sub-categories Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Sub-classifications</h2>
                        {selectedCategory && (
                            <Button
                                onClick={() => { setIsAddingSub(true); setEditingSub(null); setNewSubName('') }}
                                variant="ghost"
                                className="h-7 text-[10px] text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 px-2 rounded-lg"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Sub
                            </Button>
                        )}
                    </div>

                    {!selectedCategory ? (
                        <div className="bg-[#111111] border border-dashed border-white/10 rounded-2xl p-12 text-center space-y-3">
                            <Tags className="w-8 h-8 text-white/10 mx-auto" />
                            <p className="text-sm text-white/40">Select a category on the left to manage its sub-classifications.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(isAddingSub || editingSub) && (
                                <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-xl p-4 animate-in slide-in-from-top duration-300">
                                    <div className="flex items-center gap-3">
                                        <Input
                                            value={newSubName}
                                            onChange={(e) => setNewSubName(e.target.value)}
                                            placeholder="Sub-category Name (e.g. Rings)"
                                            className="bg-black/40 border-white/5 h-10 text-sm"
                                            autoFocus
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={editingSub ? handleUpdateSub : handleAddSub}
                                                disabled={processing}
                                                className="bg-[#D4AF37] text-black h-10 px-4 text-xs font-bold"
                                            >
                                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                                            </Button>
                                            <Button
                                                onClick={() => { setIsAddingSub(false); setEditingSub(null); setNewSubName('') }}
                                                variant="ghost"
                                                className="h-10 text-white/40 text-xs"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {subCategories.filter(s => s.category_id === selectedCategory.id).length === 0 && !isAddingSub && (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-xs text-white/20 uppercase tracking-widest">No sub-categories yet</p>
                                </div>
                            )}

                            {subCategories.filter(s => s.category_id === selectedCategory.id).map((sub) => (
                                <div key={sub.id} className="group bg-[#111111] border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white/5 rounded-lg">
                                            <Tags className="w-3.5 h-3.5 text-white/30" />
                                        </div>
                                        <span className="text-sm text-white/80 font-medium">{sub.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditingSub(sub); setNewSubName(sub.name); setIsAddingSub(false) }}
                                            className="p-2 text-white/20 hover:text-[#D4AF37] transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSub(sub.id, sub.name)}
                                            className="p-2 text-white/20 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
