-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Felleskatalogen drug chunks for RAG
CREATE TABLE IF NOT EXISTS felleskatalogen_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name TEXT NOT NULL,
  atc_code TEXT,
  section TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  source_url TEXT,
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosine similarity index for fast nearest-neighbor search
CREATE INDEX ON felleskatalogen_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Text search index for drug name lookup
CREATE INDEX ON felleskatalogen_chunks (drug_name);

-- RPC function for semantic search
CREATE OR REPLACE FUNCTION search_felleskatalogen(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  drug_name TEXT,
  atc_code TEXT,
  section TEXT,
  content TEXT,
  source_url TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fc.id,
    fc.drug_name,
    fc.atc_code,
    fc.section,
    fc.content,
    fc.source_url,
    1 - (fc.embedding <=> query_embedding) AS similarity
  FROM felleskatalogen_chunks fc
  ORDER BY fc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
