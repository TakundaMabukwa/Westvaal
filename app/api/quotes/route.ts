import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { WestvaalQuote, QuoteJson, QuoteStatus } from '@/types/quote'

// GET all quotes
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .schema('westvaal')
      .from('quote_json')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

// POST - Save new quote
export async function POST(request: NextRequest) {
  try {
    const quote: WestvaalQuote = await request.json()
    const supabase = await createClient()
    
    // Set default status if not provided
    if (!quote.status) {
      quote.status = QuoteStatus.DRAFT
    }
    
    const { data, error } = await supabase
      .schema('westvaal')
      .from('quote_json')
      .insert({ 
        json: JSON.stringify(quote)
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save quote' }, { status: 500 })
  }
}
