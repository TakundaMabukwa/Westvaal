import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .schema('westvaal')
    .from('accessories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching accessories:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .schema('westvaal')
    .from('accessories')
    .insert([{
      mm_code: body.mmCode,
      name: body.name,
      description: body.description,
      cost: parseFloat(body.cost) || 0,
      retail: parseFloat(body.retail) || 0,
      max_discount: parseFloat(body.maxDiscount) || 0,
      is_active: true
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating accessory:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
