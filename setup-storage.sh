#!/bin/bash

# Supabase Setup Script for Quote Document Storage
echo "🚀 Setting up Supabase Storage for Quote Documents..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ No Supabase project found. Please run 'supabase init' first"
    exit 1
fi

echo "✅ Supabase project detected"

# Apply the storage setup
echo "📦 Creating storage bucket and policies..."
supabase db push --local

# Run the storage setup SQL
echo "🔐 Setting up storage bucket and policies..."
supabase db reset --local

# Apply migrations
echo "📝 Applying storage setup..."
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_setup_quote_storage.sql << 'EOF'
-- Create a storage bucket for quote documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-documents', 
  'quote-documents', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload quote documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'quote-documents');

-- Create policy to allow authenticated users to view quote documents
CREATE POLICY "Allow authenticated users to view quote documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'quote-documents');

-- Create policy to allow authenticated users to update quote documents
CREATE POLICY "Allow authenticated users to update quote documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'quote-documents')
  WITH CHECK (bucket_id = 'quote-documents');

-- Create policy to allow authenticated users to delete quote documents
CREATE POLICY "Allow authenticated users to delete quote documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'quote-documents');

-- Create a table to track quote document relationships
CREATE TABLE IF NOT EXISTS westvaal.quote_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id TEXT NOT NULL,
    stage_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quote_documents_quote_id ON westvaal.quote_documents(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_documents_stage ON westvaal.quote_documents(quote_id, stage_key);

-- RLS for quote_documents table
ALTER TABLE westvaal.quote_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage quote documents" ON westvaal.quote_documents
    FOR ALL TO authenticated
    USING (uploaded_by = auth.uid() OR auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE '%@westvaal%'));
EOF

echo "✅ Migration file created"

# Apply the migration
supabase db push --local

echo "🎉 Setup complete! Your quote document storage is ready."
echo ""
echo "Next steps:"
echo "1. Test file upload in your app"
echo "2. For production, run: supabase db push"
echo "3. Check your Supabase dashboard for the new bucket"