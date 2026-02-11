"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export interface VehicleSpecFormData {
  basic: {
    mm_code: string
    make: string
    model: string
    type: string
  }
  specifications: {
    cubic_capacity: number
    kilowatt: number
    newton_meter: number
    co2_emissions: number
    fuel_type_id: number
    fuel_consumption: number
    period: number
    kms_per_month: number
    total_kms: number
    retail: number
    fuel_type: string
  }
  finance: {
    finance_per_month: number
    rv: number
    rv_percentage: number
    total_finance: number
    resale: number
    maintenance: number
    tyres: number
    fuel: number
    insurance: number
    operating_cost_per_month: number
    operating_cost_per_kilometre: number
    total_cost_per_month: number
    total_cost_per_kilometre: number
    total_cost_overall: number
  }
  warranty: {
    warranty_months: number
    warranty_kilometers: number
    plan_type_id: number
    plan_months: number
    plan_kilometers: number
    plan_type: string
  }
  additionalFeatures: {
    has_abs: boolean
    has_airbags: boolean
    has_aircon: boolean
    has_alloy_wheels: boolean
    has_cruise_control: boolean
    has_diff_lock: boolean
    has_electric_windows: boolean
    has_low_ratio: boolean
    has_pdc: boolean
    has_power_steering: boolean
    has_sat_nav: boolean
    has_security: boolean
    has_traction: boolean
  }
}

export const defaultVehicleSpecFormData: VehicleSpecFormData = {
  basic: {
    mm_code: "",
    make: "",
    model: "",
    type: "",
  },
  specifications: {
    cubic_capacity: 0,
    kilowatt: 0,
    newton_meter: 0,
    co2_emissions: 0,
    fuel_type_id: 0,
    fuel_consumption: 0,
    period: 60,
    kms_per_month: 1500,
    total_kms: 90000,
    retail: 0,
    fuel_type: "",
  },
  finance: {
    finance_per_month: 0,
    rv: 0,
    rv_percentage: 0,
    total_finance: 0,
    resale: 0,
    maintenance: 0,
    tyres: 0,
    fuel: 0,
    insurance: 0,
    operating_cost_per_month: 0,
    operating_cost_per_kilometre: 0,
    total_cost_per_month: 0,
    total_cost_per_kilometre: 0,
    total_cost_overall: 0,
  },
  warranty: {
    warranty_months: 0,
    warranty_kilometers: 0,
    plan_type_id: 0,
    plan_months: 0,
    plan_kilometers: 0,
    plan_type: "",
  },
  additionalFeatures: {
    has_abs: false,
    has_airbags: false,
    has_aircon: false,
    has_alloy_wheels: false,
    has_cruise_control: false,
    has_diff_lock: false,
    has_electric_windows: false,
    has_low_ratio: false,
    has_pdc: false,
    has_power_steering: false,
    has_sat_nav: false,
    has_security: false,
    has_traction: false,
  },
}

interface VehicleSpecFormProps {
  initialData?: VehicleSpecFormData
  loading?: boolean
  submitLabel: string
  onSubmit: (data: VehicleSpecFormData) => void
  onCancel?: () => void
  disableMmCode?: boolean
}

export default function VehicleSpecForm({
  initialData,
  loading,
  submitLabel,
  onSubmit,
  onCancel,
  disableMmCode,
}: VehicleSpecFormProps) {
  const [formData, setFormData] = useState<VehicleSpecFormData>(initialData || defaultVehicleSpecFormData)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const updateSection = (section: keyof VehicleSpecFormData, key: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const features = [
    { key: "has_abs", label: "ABS" },
    { key: "has_airbags", label: "Airbags" },
    { key: "has_aircon", label: "Aircon" },
    { key: "has_alloy_wheels", label: "Alloy Wheels" },
    { key: "has_cruise_control", label: "Cruise Control" },
    { key: "has_diff_lock", label: "Diff Lock" },
    { key: "has_electric_windows", label: "Electric Windows" },
    { key: "has_low_ratio", label: "Low Ratio" },
    { key: "has_pdc", label: "PDC" },
    { key: "has_power_steering", label: "Power Steering" },
    { key: "has_sat_nav", label: "Sat Nav" },
    { key: "has_security", label: "Security" },
    { key: "has_traction", label: "Traction" },
  ]

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Basic Information</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-muted-foreground">M&M Code *</label>
            <Input
              value={formData.basic.mm_code}
              disabled={disableMmCode}
              onChange={(e) => updateSection("basic", "mm_code", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Make *</label>
            <Input value={formData.basic.make} onChange={(e) => updateSection("basic", "make", e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Model *</label>
            <Input value={formData.basic.model} onChange={(e) => updateSection("basic", "model", e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Type *</label>
            <Input value={formData.basic.type} onChange={(e) => updateSection("basic", "type", e.target.value)} required />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">Specifications</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <InputField label="Cubic Capacity" value={formData.specifications.cubic_capacity} onChange={(v) => updateSection("specifications", "cubic_capacity", v)} />
          <InputField label="Kilowatt" value={formData.specifications.kilowatt} onChange={(v) => updateSection("specifications", "kilowatt", v)} />
          <InputField label="Newton Meter" value={formData.specifications.newton_meter} onChange={(v) => updateSection("specifications", "newton_meter", v)} />
          <InputField label="CO2 Emissions" value={formData.specifications.co2_emissions} onChange={(v) => updateSection("specifications", "co2_emissions", v)} />
          <InputField label="Fuel Type ID" value={formData.specifications.fuel_type_id} onChange={(v) => updateSection("specifications", "fuel_type_id", v)} />
          <InputField label="Fuel Consumption" value={formData.specifications.fuel_consumption} onChange={(v) => updateSection("specifications", "fuel_consumption", v)} />
          <InputField label="Period" value={formData.specifications.period} onChange={(v) => updateSection("specifications", "period", v)} />
          <InputField label="Kms / Month" value={formData.specifications.kms_per_month} onChange={(v) => updateSection("specifications", "kms_per_month", v)} />
          <InputField label="Total Kms" value={formData.specifications.total_kms} onChange={(v) => updateSection("specifications", "total_kms", v)} />
          <InputField label="Retail" value={formData.specifications.retail} onChange={(v) => updateSection("specifications", "retail", v)} />
          <div>
            <label className="text-sm text-muted-foreground">Fuel Type</label>
            <Input value={formData.specifications.fuel_type} onChange={(e) => updateSection("specifications", "fuel_type", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">Finance</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <InputField label="Finance / Month" value={formData.finance.finance_per_month} onChange={(v) => updateSection("finance", "finance_per_month", v)} />
          <InputField label="RV" value={formData.finance.rv} onChange={(v) => updateSection("finance", "rv", v)} />
          <InputField label="RV %" value={formData.finance.rv_percentage} onChange={(v) => updateSection("finance", "rv_percentage", v)} />
          <InputField label="Total Finance" value={formData.finance.total_finance} onChange={(v) => updateSection("finance", "total_finance", v)} />
          <InputField label="Resale" value={formData.finance.resale} onChange={(v) => updateSection("finance", "resale", v)} />
          <InputField label="Maintenance" value={formData.finance.maintenance} onChange={(v) => updateSection("finance", "maintenance", v)} />
          <InputField label="Tyres" value={formData.finance.tyres} onChange={(v) => updateSection("finance", "tyres", v)} />
          <InputField label="Fuel" value={formData.finance.fuel} onChange={(v) => updateSection("finance", "fuel", v)} />
          <InputField label="Insurance" value={formData.finance.insurance} onChange={(v) => updateSection("finance", "insurance", v)} />
          <InputField label="Operating Cost / Month" value={formData.finance.operating_cost_per_month} onChange={(v) => updateSection("finance", "operating_cost_per_month", v)} />
          <InputField label="Operating Cost / Km" value={formData.finance.operating_cost_per_kilometre} onChange={(v) => updateSection("finance", "operating_cost_per_kilometre", v)} />
          <InputField label="Total Cost / Month" value={formData.finance.total_cost_per_month} onChange={(v) => updateSection("finance", "total_cost_per_month", v)} />
          <InputField label="Total Cost / Km" value={formData.finance.total_cost_per_kilometre} onChange={(v) => updateSection("finance", "total_cost_per_kilometre", v)} />
          <InputField label="Total Cost Overall" value={formData.finance.total_cost_overall} onChange={(v) => updateSection("finance", "total_cost_overall", v)} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">Warranty</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <InputField label="Warranty Months" value={formData.warranty.warranty_months} onChange={(v) => updateSection("warranty", "warranty_months", v)} />
          <InputField label="Warranty Kilometers" value={formData.warranty.warranty_kilometers} onChange={(v) => updateSection("warranty", "warranty_kilometers", v)} />
          <InputField label="Plan Type ID" value={formData.warranty.plan_type_id} onChange={(v) => updateSection("warranty", "plan_type_id", v)} />
          <InputField label="Plan Months" value={formData.warranty.plan_months} onChange={(v) => updateSection("warranty", "plan_months", v)} />
          <InputField label="Plan Kilometers" value={formData.warranty.plan_kilometers} onChange={(v) => updateSection("warranty", "plan_kilometers", v)} />
          <div>
            <label className="text-sm text-muted-foreground">Plan Type</label>
            <Input value={formData.warranty.plan_type} onChange={(e) => updateSection("warranty", "plan_type", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">Additional Features</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.key} className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">{feature.label}</span>
              <Switch
                checked={Boolean(formData.additionalFeatures[feature.key as keyof VehicleSpecFormData["additionalFeatures"]])}
                onCheckedChange={(checked) => updateSection("additionalFeatures", feature.key, checked)}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  )
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (next: number) => void
}) {
  return (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <Input type="number" step="any" value={value} onChange={(e) => onChange(Number(e.target.value || 0))} />
    </div>
  )
}
