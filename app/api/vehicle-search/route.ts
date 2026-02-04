import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  // Fetch unique makes
  const { data: makesData, error: makesError } = await supabase
    .schema('westvaal')
    .from('basic_vehicle_information')
    .select('make')
    .order('make', { ascending: true })

  if (makesError) {
    console.error('Error fetching makes:', makesError)
    return NextResponse.json({ error: makesError.message }, { status: 500 })
  }

  // Get unique makes
  const makes = [...new Set(makesData.map(v => v.make))]

  // Fetch all vehicles for models grouping
  const { data: vehiclesData, error: vehiclesError } = await supabase
    .schema('westvaal')
    .from('basic_vehicle_information')
    .select('make, model, type')
    .order('make', { ascending: true })
    .order('model', { ascending: true })

  if (vehiclesError) {
    console.error('Error fetching vehicles:', vehiclesError)
    return NextResponse.json({ error: vehiclesError.message }, { status: 500 })
  }

  // Group models by make
  const modelsByMake: Record<string, string[]> = {}
  vehiclesData.forEach(v => {
    if (!modelsByMake[v.make]) {
      modelsByMake[v.make] = []
    }
    if (!modelsByMake[v.make].includes(v.model)) {
      modelsByMake[v.make].push(v.model)
    }
  })

  // Get unique types
  const types = [...new Set(vehiclesData.map(v => v.type))]

  return NextResponse.json({
    makes,
    modelsByMake,
    types
  })
}
