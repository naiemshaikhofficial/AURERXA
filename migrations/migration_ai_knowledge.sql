-- Migration: AI Support Knowledge Base (RAG)
-- Run this in Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create AI Knowledge Embeddings table
CREATE TABLE IF NOT EXISTS public.ai_knowledge_embeddings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text NOT NULL,
    embedding vector(1536), -- Designed for OpenAI text-embedding-3-small or ada-002
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Enhance Chat Sessions for AI Tracking
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS intent text,
ADD COLUMN IF NOT EXISTS ai_confidence float,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 4. Create AI Audit Logs for quality monitoring
CREATE TABLE IF NOT EXISTS public.ai_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES public.chat_sessions(id),
    query text,
    response text,
    context_used jsonb,
    tokens_used int,
    latency_ms int,
    created_at timestamptz DEFAULT now()
);

-- 5. Vector Similarity Search Function (RPC)
-- This allows the Next.js backend to query relevant knowledge chunks
CREATE OR REPLACE FUNCTION match_ai_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_knowledge_embeddings.id,
    ai_knowledge_embeddings.content,
    ai_knowledge_embeddings.metadata,
    1 - (ai_knowledge_embeddings.embedding <=> query_embedding) AS similarity
  FROM ai_knowledge_embeddings
  WHERE 1 - (ai_knowledge_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 6. Enable RLS for new tables
ALTER TABLE public.ai_knowledge_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. Policies (Admins only for knowledge management)
CREATE POLICY "Admins can manage knowledge" ON public.ai_knowledge_embeddings
FOR ALL USING (is_admin());

CREATE POLICY "Admins can view AI logs" ON public.ai_audit_logs
FOR SELECT USING (is_admin());

-- 8. Indexes for Vector Search
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_vector ON public.ai_knowledge_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
