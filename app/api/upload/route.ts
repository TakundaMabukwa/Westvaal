import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File
    const quoteId = formData.get('quoteId') as string
    const stageKey = formData.get('stageKey') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!quoteId || !stageKey) {
      return NextResponse.json(
        { error: 'Quote ID and stage key are required' },
        { status: 400 }
      )
    }

    // Create a unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${quoteId}/${stageKey}/${timestamp}.${fileExt}`

    // Convert File to ArrayBuffer and then to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('quote-documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('quote-documents')
      .getPublicUrl(fileName)

    // Save document metadata to database for tracking
    const { error: dbError } = await supabase
      .schema('westvaal')
      .from('quote_documents')
      .insert({
        quote_id: quoteId,
        stage_key: stageKey,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type
      })

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Don't fail the request if we can't save metadata, but log it
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      metadata: {
        size: file.size,
        type: file.type,
        uploadPath: fileName
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    )
  }
}