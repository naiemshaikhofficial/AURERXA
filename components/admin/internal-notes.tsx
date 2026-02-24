'use client'

import { useState, useEffect } from 'react'
import { addInternalNote, getInternalNotes } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Send, Flag, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface InternalNotesProps {
    entityType: 'order' | 'user' | 'product' | 'general'
    entityId: string
    className?: string
}

export function InternalNotes({ entityType, entityId, className }: InternalNotesProps) {
    const [notes, setNotes] = useState<any[]>([])
    const [content, setContent] = useState('')
    const [isFlagged, setIsFlagged] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadNotes()
    }, [entityId])

    const loadNotes = async () => {
        setLoading(true)
        const data = await getInternalNotes(entityType, entityId)
        setNotes(data)
        setLoading(false)
    }

    const handleSubmit = async () => {
        if (!content.trim()) return
        setSubmitting(true)
        const res = await addInternalNote(entityType, entityId, content, isFlagged)
        if (res.success) {
            setContent('')
            setIsFlagged(false)
            loadNotes()
        }
        setSubmitting(false)
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-medium text-white/80">Internal Notes <span className="text-xs text-white/30 ml-2">(Private)</span></h3>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-xl p-4 space-y-4">
                {/* Notes List */}
                <ScrollArea className="h-[200px] pr-4">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-white/20" /></div>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-8 text-xs text-white/20 italic">No notes yet. Start the conversation.</div>
                    ) : (
                        <div className="space-y-3">
                            {notes.map((note) => (
                                <div key={note.id} className={`p-3 rounded-lg border ${note.is_flagged ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-[10px] font-bold">
                                                {note.author?.avatar_url ? <img src={note.author.avatar_url} className="w-full h-full object-cover" /> : note.author?.full_name?.[0]}
                                            </div>
                                            <span className="text-xs font-medium text-white/60">{note.author?.full_name || 'Admin'}</span>
                                        </div>
                                        <span className="text-[10px] text-white/30">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                                    </div>
                                    <p className={`text-xs mt-2 leading-relaxed ${note.is_flagged ? 'text-red-200' : 'text-white/80'}`}>{note.content}</p>
                                    {note.is_flagged && <div className="flex items-center gap-1 mt-2 text-[10px] text-red-400"><Flag className="w-3 h-3 fill-current" /> Flagged for attention</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Input Area */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                    <Textarea
                        placeholder="Add a private note..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="bg-black/20 border-white/10 text-xs min-h-[60px] resize-none focus-visible:ring-[#D4AF37]/50"
                    />
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsFlagged(!isFlagged)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors ${isFlagged ? 'bg-red-500 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <Flag className={`w-3 h-3 ${isFlagged ? 'fill-current' : ''}`} />
                            {isFlagged ? 'Flagged' : 'Flag as important'}
                        </button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || submitting}
                            className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 h-7 text-xs px-3 rounded-lg"
                        >
                            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className="flex items-center gap-1">Send <Send className="w-3 h-3" /></div>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
