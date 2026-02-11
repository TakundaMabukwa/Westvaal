import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { WestvaalQuote } from '@/types/quote'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const id = Number(params.id)

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid quote id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .schema('westvaal')
      .from('quote_json')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const id = Number(params.id)
    const quote: WestvaalQuote = await request.json()

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid quote id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .schema('westvaal')
      .from('quote_json')
      .update({
        json: JSON.stringify(quote),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}
