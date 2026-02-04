import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { WestvaalQuote, QuoteStatus } from '@/types/quote'

// PUT - Update quote status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, bankRef } = await request.json()
    const supabase = await createClient()

    // Validate status
    if (status && !Object.values(QuoteStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 })
    }
    
    // Get current quote
    const { data: currentQuote, error: fetchError } = await supabase
      .schema('westvaal')
      .from('quote_json')
      .select('json')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    // Parse and update the quote
    const quote: WestvaalQuote = JSON.parse(currentQuote.json)
    if (status) quote.status = status
    if (bankRef) quote.bankRef = bankRef
    
    // Update in database
    const { data, error } = await supabase
      .schema('westvaal')
      .from('quote_json')
      .update({ 
        json: JSON.stringify(quote)
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quote status' }, { status: 500 })
  }
}