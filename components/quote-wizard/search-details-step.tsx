"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchCriteria {
  make: string
  model: string
  type: string
  features: string[]
}

interface SearchDetailsStepProps {
  data: SearchCriteria
  onChange: (data: SearchCriteria) => void
  onNext?: () => void
  onPrevious?: () => void
}

const features = [
  "4x4",
  "4x2", 
  "Automatic",
  "Manual",
  "Leather Seats",
  "Navigation",
  "Sunroof",
  "Towbar",
]

export function SearchDetailsStep({ data, onChange, onNext, onPrevious }: SearchDetailsStepProps) {
  const [makes, setMakes] = useState<string[]>([])
  const [modelsByMake, setModelsByMake] = useState<Record<string, string[]>>({})
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVehicleData()
  }, [])

  const fetchVehicleData = async () => {
    try {
      const response = await fetch('/api/vehicle-search')
      if (response.ok) {
        const data = await response.json()
        setMakes(data.makes)
        setModelsByMake(data.modelsByMake)
        setTypes(data.types)
      }
    } catch (error) {
      console.error('Error fetching vehicle data:', error)
    } finally {
      setLoading(false)
    }
  }
  const updateField = (field: keyof SearchCriteria, value: string | string[]) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const handleMakeChange = (make: string) => {
    onChange({
      ...data,
      make,
      model: "" // Reset model when make changes
    })
  }

  const addFeature = (feature: string) => {
    if (!data.features.includes(feature)) {
      updateField('features', [...data.features, feature])
    }
  }

  const removeFeature = (feature: string) => {
    updateField('features', data.features.filter(f => f !== feature))
  }

  const isValid = data.make && data.model

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Vehicle Search Criteria
        </h3>
        <p className="text-sm text-muted-foreground">
          Select the vehicle specifications to find matching options
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Select value={data.make} onValueChange={handleMakeChange} disabled={loading}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder={loading ? "Loading makes..." : "Select vehicle make"} />
              </SelectTrigger>
              <SelectContent>
                {makes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select 
              value={data.model} 
              onValueChange={(value) => updateField('model', value)}
              disabled={!data.make || loading}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select vehicle model" />
              </SelectTrigger>
              <SelectContent>
                {data.make && modelsByMake[data.make]?.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Vehicle Type</Label>
            <Select value={data.type} onValueChange={(value) => updateField('type', value)} disabled={loading}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Features & Options</Label>
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature) => (
                <Button
                  key={feature}
                  variant={data.features.includes(feature) ? "default" : "outline"}
                  size="sm"
                  onClick={() => 
                    data.features.includes(feature) 
                      ? removeFeature(feature)
                      : addFeature(feature)
                  }
                  className="justify-start h-8"
                >
                  {feature}
                </Button>
              ))}
            </div>
          </div>

          {data.features.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Features</Label>
              <div className="flex flex-wrap gap-1">
                {data.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="gap-1">
                    {feature}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFeature(feature)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        {onPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        )}
        {onNext && (
          <Button 
            onClick={onNext}
            disabled={!isValid}
            className="ml-auto"
          >
            Search Vehicles
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
