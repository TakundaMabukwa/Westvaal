import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ mmCode: string }> }
) {
  try {
    const { mmCode } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .schema('westvaal')
      .from('basic_vehicle_information')
      .select(`
        *,
        specifications(*),
        finance(*),
        warranty(*),
        additional_features(*)
      `)
      .eq('mm_code', mmCode)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching vehicle spec:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ mmCode: string }> }
) {
  try {
    const { mmCode } = await params
    const supabase = await createClient()
    const body = await request.json()
    const { basic, specifications, finance, warranty, additionalFeatures } = body || {}

    const { error: basicError } = await supabase
      .schema('westvaal')
      .from('basic_vehicle_information')
      .update({
        make: basic?.make,
        model: basic?.model,
        type: basic?.type,
      })
      .eq('mm_code', mmCode)

    if (basicError) {
      return NextResponse.json({ error: basicError.message }, { status: 500 })
    }

    const { error: specError } = await supabase
      .schema('westvaal')
      .from('specifications')
      .update({
        cubic_capacity: specifications?.cubic_capacity ?? 0,
        kilowatt: specifications?.kilowatt ?? 0,
        newton_meter: specifications?.newton_meter ?? 0,
        co2_emissions: specifications?.co2_emissions ?? 0,
        fuel_type_id: specifications?.fuel_type_id ?? 0,
        fuel_consumption: specifications?.fuel_consumption ?? 0,
        period: specifications?.period ?? 0,
        kms_per_month: specifications?.kms_per_month ?? 0,
        total_kms: specifications?.total_kms ?? 0,
        retail: specifications?.retail ?? 0,
        fuel_type: specifications?.fuel_type ?? '',
      })
      .eq('mm_code', mmCode)

    if (specError) {
      return NextResponse.json({ error: specError.message }, { status: 500 })
    }

    const { error: financeError } = await supabase
      .schema('westvaal')
      .from('finance')
      .update({
        finance_per_month: finance?.finance_per_month ?? 0,
        rv: finance?.rv ?? 0,
        rv_percentage: finance?.rv_percentage ?? 0,
        total_finance: finance?.total_finance ?? 0,
        resale: finance?.resale ?? 0,
        maintenance: finance?.maintenance ?? 0,
        tyres: finance?.tyres ?? 0,
        fuel: finance?.fuel ?? 0,
        insurance: finance?.insurance ?? 0,
        operating_cost_per_month: finance?.operating_cost_per_month ?? 0,
        operating_cost_per_kilometre: finance?.operating_cost_per_kilometre ?? 0,
        total_cost_per_month: finance?.total_cost_per_month ?? 0,
        total_cost_per_kilometre: finance?.total_cost_per_kilometre ?? 0,
        total_cost_overall: finance?.total_cost_overall ?? 0,
      })
      .eq('mm_code', mmCode)

    if (financeError) {
      return NextResponse.json({ error: financeError.message }, { status: 500 })
    }

    const { error: warrantyError } = await supabase
      .schema('westvaal')
      .from('warranty')
      .update({
        warranty_months: warranty?.warranty_months ?? 0,
        warranty_kilometers: warranty?.warranty_kilometers ?? 0,
        plan_type_id: warranty?.plan_type_id ?? 0,
        plan_months: warranty?.plan_months ?? 0,
        plan_kilometers: warranty?.plan_kilometers ?? 0,
        plan_type: warranty?.plan_type ?? '',
      })
      .eq('mm_code', mmCode)

    if (warrantyError) {
      return NextResponse.json({ error: warrantyError.message }, { status: 500 })
    }

    const { error: featuresError } = await supabase
      .schema('westvaal')
      .from('additional_features')
      .update({
        has_abs: additionalFeatures?.has_abs ?? false,
        has_airbags: additionalFeatures?.has_airbags ?? false,
        has_aircon: additionalFeatures?.has_aircon ?? false,
        has_alloy_wheels: additionalFeatures?.has_alloy_wheels ?? false,
        has_cruise_control: additionalFeatures?.has_cruise_control ?? false,
        has_diff_lock: additionalFeatures?.has_diff_lock ?? false,
        has_electric_windows: additionalFeatures?.has_electric_windows ?? false,
        has_low_ratio: additionalFeatures?.has_low_ratio ?? false,
        has_pdc: additionalFeatures?.has_pdc ?? false,
        has_power_steering: additionalFeatures?.has_power_steering ?? false,
        has_sat_nav: additionalFeatures?.has_sat_nav ?? false,
        has_security: additionalFeatures?.has_security ?? false,
        has_traction: additionalFeatures?.has_traction ?? false,
      })
      .eq('mm_code', mmCode)

    if (featuresError) {
      return NextResponse.json({ error: featuresError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating vehicle spec:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
