import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get all documents for this quote
    const { data: documents, error } = await supabase
      .schema('westvaal')
      .from('quote_documents')
      .select('*')
      .eq('quote_id', id)
      .order('uploaded_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get document details first
    const { data: document, error: fetchError } = await supabase
      .schema('westvaal')
      .from('quote_documents')
      .select('*')
      .eq('id', documentId)
      .eq('quote_id', id)
      .single()
    
    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Delete from storage
    const filePath = document.file_url.split('/').pop()
    const { error: storageError } = await supabase.storage
      .from('quote-documents')
      .remove([`${id}/${document.stage_key}/${filePath}`])
    
    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue with database deletion even if storage fails
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .schema('westvaal')
      .from('quote_documents')
      .delete()
      .eq('id', documentId)
      .eq('quote_id', id)
    
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}