import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { make, model, type } = body

  try {
    // Build query - primarily filter by make to show all vehicles of that brand
    let query = supabase
      .schema('westvaal')
      .from('basic_vehicle_information')
      .select(`
        *,
        specifications(*),
        finance(*),
        warranty(*),
        additional_features(*)
      `)

    // Must have make
    if (make) {
      query = query.eq('make', make)
    } else {
      // If no make provided, return empty
      return NextResponse.json([])
    }

    // Model and type are optional - if provided, show those first, then others
    const { data: vehicles, error } = await query.order('model', { ascending: true })

    if (error) {
      console.error('Error fetching vehicles:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match DtoProduct structure
    const products = vehicles.map((v, index) => {
      // Get the first specification record (should only be one per mm_code)
      const spec = Array.isArray(v.specifications) ? v.specifications[0] : v.specifications
      const fin = Array.isArray(v.finance) ? v.finance[0] : v.finance
      const war = Array.isArray(v.warranty) ? v.warranty[0] : v.warranty
      const feat = Array.isArray(v.additional_features) ? v.additional_features[0] : v.additional_features

      const retailPrice = spec?.retail || 0
      
      return {
        id: index + 1,
        mmCode: v.mm_code,
        name: `${v.make} ${v.model}`,
        description: `${v.make} ${v.model} - ${v.type}`,
        cost: retailPrice ? retailPrice * 0.85 : 0,
        retail: retailPrice,
        maxDiscount: 10,
        isActive: true,
        basicVehicleInformation: {
          mmCode: v.mm_code,
          make: v.make,
          model: v.model,
          type: v.type
        },
        specifications: spec ? {
          mmCode: spec.mm_code,
          cubicCapacity: spec.cubic_capacity,
          kilowatt: spec.kilowatt,
          newtonMeter: spec.newton_meter,
          co2Emissions: spec.co2_emissions,
          fuelTypeId: spec.fuel_type_id,
          fuelConsumption: spec.fuel_consumption,
          period: spec.period,
          kmsPerMonth: spec.kms_per_month,
          totalKms: spec.total_kms,
          retail: spec.retail,
          fuelType: spec.fuel_type
        } : null,
        finance: fin ? {
          mmCode: fin.mm_code,
          financePerMonth: fin.finance_per_month,
          rv: fin.rv,
          rvPercentage: fin.rv_percentage,
          totalFinance: fin.total_finance,
          resale: fin.resale,
          maintenance: fin.maintenance,
          tyres: fin.tyres,
          fuel: fin.fuel,
          insurance: fin.insurance,
          operatingCostPerMonth: fin.operating_cost_per_month,
          operatingCostPerKilometre: fin.operating_cost_per_kilometre,
          totalCostPerMonth: fin.total_cost_per_month,
          totalCostPerKilometre: fin.total_cost_per_kilometre,
          totalCostOverall: fin.total_cost_overall
        } : null,
        warranty: war ? {
          mmCode: war.mm_code,
          warrantyMonths: war.warranty_months,
          warrantyKilometers: war.warranty_kilometers,
          planTypeId: war.plan_type_id,
          planMonths: war.plan_months,
          planKilometers: war.plan_kilometers,
          planType: war.plan_type
        } : null,
        additionalFeatures: feat ? {
          mmCode: feat.mm_code,
          hasAbs: feat.has_abs,
          hasAirbags: feat.has_airbags,
          hasAircon: feat.has_aircon,
          hasAlloyWheels: feat.has_alloy_wheels,
          hasCruiseControl: feat.has_cruise_control,
          hasDiffLock: feat.has_diff_lock,
          hasElectricWindows: feat.has_electric_windows,
          hasLowRatio: feat.has_low_ratio,
          hasPdc: feat.has_pdc,
          hasPowerSteering: feat.has_power_steering,
          hasSatNav: feat.has_sat_nav,
          hasSecurity: feat.has_security,
          hasTraction: feat.has_traction
        } : null
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error in vehicle compare search:', error)
    return NextResponse.json({ error: 'Failed to search vehicles' }, { status: 500 })
  }
}
