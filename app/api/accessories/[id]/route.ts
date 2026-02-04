import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .schema('westvaal')
    .from('accessories')
    .update({
      mm_code: body.mmCode,
      name: body.name,
      description: body.description,
      cost: parseFloat(body.cost) || 0,
      retail: parseFloat(body.retail) || 0,
      max_discount: parseFloat(body.maxDiscount) || 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating accessory:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const supabase = await createClient()

  const { error } = await supabase
    .schema('westvaal')
    .from('accessories')
    .delete()
    .eq('id', params.id)

  if (error) {
    console.error('Error deleting accessory:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
