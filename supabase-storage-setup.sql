-- ========================================
-- Supabase Storage Setup for Quote Documents
-- Run this in your Supabase SQL Editor
-- ========================================

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-documents', 
  'quote-documents', 
  true, 
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Allow authenticated users to upload quote documents'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload quote documents" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'quote-documents');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Allow authenticated users to view quote documents'
  ) THEN
    CREATE POLICY "Allow authenticated users to view quote documents" ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'quote-documents');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Allow authenticated users to update quote documents'
  ) THEN
    CREATE POLICY "Allow authenticated users to update quote documents" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'quote-documents')
      WITH CHECK (bucket_id = 'quote-documents');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Allow authenticated users to delete quote documents'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete quote documents" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'quote-documents');
  END IF;
END $$;

-- 3. Create document tracking table
CREATE TABLE IF NOT EXISTS westvaal.quote_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id TEXT NOT NULL,
    stage_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 3b. Create workflow data tracking table for bank references and stage details
CREATE TABLE IF NOT EXISTS westvaal.quote_workflow_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id TEXT NOT NULL,
    stage_key TEXT NOT NULL,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    bank_reference_number TEXT,
    job_card_url TEXT,
    expected_delivery_date DATE,
    oem_reference TEXT,
    license_plate TEXT,
    registration_number TEXT,
    registration_doc_url TEXT,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(quote_id, stage_key)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_documents_quote_id ON westvaal.quote_documents(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_documents_stage ON westvaal.quote_documents(quote_id, stage_key);
CREATE INDEX IF NOT EXISTS idx_quote_documents_user ON westvaal.quote_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_quote_workflow_data_quote_id ON westvaal.quote_workflow_data(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_workflow_data_stage ON westvaal.quote_workflow_data(quote_id, stage_key);

-- 4b. Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'quote_workflow_data_quote_id_stage_key_key'
    AND conrelid = 'westvaal.quote_workflow_data'::regclass
  ) THEN
    ALTER TABLE westvaal.quote_workflow_data 
    ADD CONSTRAINT quote_workflow_data_quote_id_stage_key_key UNIQUE(quote_id, stage_key);
  END IF;
END $$;

-- 5. Enable Row Level Security
ALTER TABLE westvaal.quote_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE westvaal.quote_workflow_data ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for document access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'quote_documents' 
    AND policyname = 'Users can view all quote documents'
  ) THEN
    CREATE POLICY "Users can view all quote documents" ON westvaal.quote_documents
        FOR SELECT TO authenticated
        USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'quote_documents' 
    AND policyname = 'Users can upload quote documents'
  ) THEN
    CREATE POLICY "Users can upload quote documents" ON westvaal.quote_documents
        FOR INSERT TO authenticated
        WITH CHECK (uploaded_by = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'quote_documents' 
    AND policyname = 'Users can update their own documents'
  ) THEN
    CREATE POLICY "Users can update their own documents" ON westvaal.quote_documents
        FOR UPDATE TO authenticated
        USING (uploaded_by = auth.uid())
        WITH CHECK (uploaded_by = auth.uid());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'quote_documents' 
    AND policyname = 'Users can delete their own documents'
  ) THEN
    CREATE POLICY "Users can delete their own documents" ON westvaal.quote_documents
        FOR DELETE TO authenticated
        USING (uploaded_by = auth.uid());
  END IF;
END $$;

-- 6b. Create RLS policies for workflow data access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'quote_workflow_data' 
    AND policyname = 'Users can view all workflow data'
  ) THEN
    CREATE POLICY "Users can view all workflow data" ON westvaal.quote_workflow_data
        FOR SELECT TO authenticated
        USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'quote_workflow_data' 
    AND policyname = 'Users can insert workflow data'
  ) THEN
    CREATE POLICY "Users can insert workflow data" ON westvaal.quote_workflow_data
        FOR INSERT TO authenticated
        WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'quote_workflow_data' 
    AND policyname = 'Users can update workflow data'
  ) THEN
    CREATE POLICY "Users can update workflow data" ON westvaal.quote_workflow_data
        FOR UPDATE TO authenticated
        USING (true)
        WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'westvaal' AND tablename = 'quote_workflow_data' 
    AND policyname = 'Users can delete workflow data'
  ) THEN
    CREATE POLICY "Users can delete workflow data" ON westvaal.quote_workflow_data
        FOR DELETE TO authenticated
        USING (true);
  END IF;
END $$;

-- 7. Grant permissions to authenticated users
GRANT ALL ON westvaal.quote_documents TO authenticated;
GRANT ALL ON westvaal.quote_workflow_data TO authenticated;
GRANT USAGE ON SCHEMA westvaal TO authenticated;

-- 8. Add columns for approveQuote stage (if they don't exist)
DO $$
BEGIN
  -- Add approved_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'westvaal' 
    AND table_name = 'quote_workflow_data' 
    AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE westvaal.quote_workflow_data ADD COLUMN approved_by TEXT;
  END IF;
  
  -- Add approved_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'westvaal' 
    AND table_name = 'quote_workflow_data' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE westvaal.quote_workflow_data ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;