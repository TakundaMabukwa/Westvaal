"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import VehicleSpecForm, {
  defaultVehicleSpecFormData,
  VehicleSpecFormData,
} from "@/components/vehicle-specs/spec-form"
import { toast } from "@/hooks/use-toast"

export default function EditVehicleSpecPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<VehicleSpecFormData>(defaultVehicleSpecFormData)

  useEffect(() => {
    fetchSpec()
  }, [id])

  const fetchSpec = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vehicle-specs/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch specification")
      }

      const data = await response.json()
      const specifications = Array.isArray(data.specifications) ? data.specifications[0] : data.specifications
      const finance = Array.isArray(data.finance) ? data.finance[0] : data.finance
      const warranty = Array.isArray(data.warranty) ? data.warranty[0] : data.warranty
      const additionalFeatures = Array.isArray(data.additional_features) ? data.additional_features[0] : data.additional_features

      setFormData({
        basic: {
          mm_code: data.mm_code || "",
          make: data.make || "",
          model: data.model || "",
          type: data.type || "",
        },
        specifications: {
          cubic_capacity: specifications?.cubic_capacity || 0,
          kilowatt: specifications?.kilowatt || 0,
          newton_meter: specifications?.newton_meter || 0,
          co2_emissions: specifications?.co2_emissions || 0,
          fuel_type_id: specifications?.fuel_type_id || 0,
          fuel_consumption: specifications?.fuel_consumption || 0,
          period: specifications?.period || 0,
          kms_per_month: specifications?.kms_per_month || 0,
          total_kms: specifications?.total_kms || 0,
          retail: specifications?.retail || 0,
          fuel_type: specifications?.fuel_type || "",
        },
        finance: {
          finance_per_month: finance?.finance_per_month || 0,
          rv: finance?.rv || 0,
          rv_percentage: finance?.rv_percentage || 0,
          total_finance: finance?.total_finance || 0,
          resale: finance?.resale || 0,
          maintenance: finance?.maintenance || 0,
          tyres: finance?.tyres || 0,
          fuel: finance?.fuel || 0,
          insurance: finance?.insurance || 0,
          operating_cost_per_month: finance?.operating_cost_per_month || 0,
          operating_cost_per_kilometre: finance?.operating_cost_per_kilometre || 0,
          total_cost_per_month: finance?.total_cost_per_month || 0,
          total_cost_per_kilometre: finance?.total_cost_per_kilometre || 0,
          total_cost_overall: finance?.total_cost_overall || 0,
        },
        warranty: {
          warranty_months: warranty?.warranty_months || 0,
          warranty_kilometers: warranty?.warranty_kilometers || 0,
          plan_type_id: warranty?.plan_type_id || 0,
          plan_months: warranty?.plan_months || 0,
          plan_kilometers: warranty?.plan_kilometers || 0,
          plan_type: warranty?.plan_type || "",
        },
        additionalFeatures: {
          has_abs: additionalFeatures?.has_abs || false,
          has_airbags: additionalFeatures?.has_airbags || false,
          has_aircon: additionalFeatures?.has_aircon || false,
          has_alloy_wheels: additionalFeatures?.has_alloy_wheels || false,
          has_cruise_control: additionalFeatures?.has_cruise_control || false,
          has_diff_lock: additionalFeatures?.has_diff_lock || false,
          has_electric_windows: additionalFeatures?.has_electric_windows || false,
          has_low_ratio: additionalFeatures?.has_low_ratio || false,
          has_pdc: additionalFeatures?.has_pdc || false,
          has_power_steering: additionalFeatures?.has_power_steering || false,
          has_sat_nav: additionalFeatures?.has_sat_nav || false,
          has_security: additionalFeatures?.has_security || false,
          has_traction: additionalFeatures?.has_traction || false,
        },
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load specification",
        variant: "destructive",
      })
      router.push("/vehicle-specifications")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (payload: VehicleSpecFormData) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/vehicle-specs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || "Failed to update specification")
      }

      toast({
        title: "Success",
        description: "Vehicle specification updated",
      })
      router.push("/vehicle-specifications")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update specification",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Edit Vehicle Specification</h1>
          <p className="text-sm text-muted-foreground">M&M Code: {id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Specification Details</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleSpecForm
            initialData={formData}
            disableMmCode
            submitLabel="Save Changes"
            loading={saving}
            onSubmit={handleUpdate}
            onCancel={() => router.push("/vehicle-specifications")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
