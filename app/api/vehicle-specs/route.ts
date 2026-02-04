import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all basic vehicle information with specifications for retail price
    const { data: vehicles, error } = await supabase
      .schema('westvaal')
      .from('basic_vehicle_information')
      .select(`
        *,
        specifications:specifications(
          retail
        )
      `)
      .order('make', { ascending: true })
      .order('model', { ascending: true })

    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
    }

    // Transform data to include retail price at root level
    const transformedVehicles = (vehicles || []).map(vehicle => ({
      ...vehicle,
      retail: vehicle.specifications?.retail || 0
    }))

    return NextResponse.json(transformedVehicles)

  } catch (error) {
    console.error('Error in vehicle specs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
