import { createClient } from '@supabase/supabase-js'

// Note: Ensure OPENAI_API_KEY is in your .env.local
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Generates a vector embedding for a given text using OpenAI.
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
    if (!OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is missing. Skipping embedding generation.")
        return null
    }

    try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                input: text.replace(/\n/g, ' '),
                model: 'text-embedding-3-small'
            })
        })

        const data = await response.json()
        return data.data[0].embedding
    } catch (error) {
        console.error("Error generating embedding:", error)
        return null
    }
}

/**
 * Upserts a knowledge chunk into the database with its embedding.
 */
export async function upsertKnowledge(content: string, metadata: any = {}) {
    const embedding = await generateEmbedding(content)
    if (!embedding) return { success: false, error: 'Failed to generate embedding' }

    const { error } = await supabase
        .from('ai_knowledge_embeddings')
        .upsert({
            content,
            embedding,
            metadata
        }, { onConflict: 'content' }) // Simple deduplication based on content

    if (error) {
        console.error("Error upserting knowledge:", error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

/**
 * Main ingestion function to process predefined FAQs and Products.
 */
export async function runFullIngestion() {
    const knowledge = [
        // FAQs (Extracted from app/faq/page.tsx)
        { content: "Custom jewelry orders at AURERXA take 24-48h for a feasibility report and quote.", metadata: { category: "Ordering", source: "FAQ" } },
        { content: "Orders can only be cancelled within 6 hours of placement.", metadata: { category: "Policies", source: "FAQ" } },
        { content: "Free Insured Shipping is offered on orders above ₹50,000.", metadata: { category: "Shipping", source: "FAQ" } },
        { content: "A continuous, uncut unboxing video is MANDATORY for all damage claims.", metadata: { category: "Security", source: "FAQ" } },
        { content: "Gold jewelry (14K-24K) is BIS Hallmarked with a unique HUID for verification.", metadata: { category: "Quality", source: "FAQ" } },
        { content: "AURERXA has a Strict No-Refund Policy. Returns only for manufacturing defects within 24h.", metadata: { category: "Policies", source: "FAQ" } },
        { content: "Our physical boutique is at Captain Lakshmi Chowk, Rangargalli, Sangamner, MS 422605.", metadata: { category: "Location", source: "FAQ" } },

        // Brand Knowledge
        { content: "AURERXA stands for heritage-inspired high-end jewelry with a 50-year legacy.", metadata: { category: "Brand" } },
        { content: "AURXY is the AI Heritage Consultant designed to assist collectors with expertise.", metadata: { category: "Brand" } }
    ]

    console.log(`Starting ingestion of ${knowledge.length} items...`)
    let successCount = 0

    for (const item of knowledge) {
        const res = await upsertKnowledge(item.content, item.metadata)
        if (res.success) successCount++
    }

    console.log(`Ingestion complete! Successfully ingested ${successCount}/${knowledge.length} items.`)
    return { successCount, total: knowledge.length }
}
