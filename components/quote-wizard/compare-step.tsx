"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import { DtoPart, DtoProduct } from "@/types/quote"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"

interface SearchCriteria {
  make: string
  model: string
  type: string
  features: string[]
}

interface CompareStepProps {
  searchCriteria: SearchCriteria
  selectedVehicles: DtoPart[]
  onSelectionChange: (vehicles: DtoPart[]) => void
  onNext?: () => void
  onPrevious?: () => void
}

// Mock vehicle data based on search criteria
const getMockVehicles = (criteria: SearchCriteria): DtoProduct[] => [
  {
    id: 1,
    mmCode: "F001",
    name: `${criteria.make} ${criteria.model} Base`,
    description: `${criteria.make} ${criteria.model} Base model with standard features`,
    cost: 320000,
    retail: 380000,
    maxDiscount: 8,
    isActive: true,
    basicVehicleInformation: {
      mmCode: "F001",
      make: criteria.make,
      model: criteria.model,
      type: criteria.type || "Pickup Double CAB"
    },
    specifications: {
      engine: {
        cc: 2000,
        kw: 125,
        nm: 385,
        cylinders: 4,
        fuelType: "Diesel"
      }
    } as any,
    finance: {
      period: 60,
      residualValue: 25,
      interestRate: 12.5
    } as any,
    warranty: {
      warrantyMonths: 36,
      warrantyKms: 120000,
      servicePlan: "5 Year/90000km Service Plan"
    } as any,
    additionalFeatures: {
      standardFeatures: ["Air Conditioning", "Power Steering", "Central Locking"],
      optionalFeatures: criteria.features || []
    } as any
  },
  {
    id: 2,
    mmCode: "F002", 
    name: `${criteria.make} ${criteria.model} XL`,
    description: `${criteria.make} ${criteria.model} XL model with enhanced features`,
    cost: 350000,
    retail: 420000,
    maxDiscount: 10,
    isActive: true,
    basicVehicleInformation: {
      mmCode: "F002",
      make: criteria.make,
      model: criteria.model,
      type: criteria.type || "Pickup Double CAB"
    },
    specifications: {
      engine: {
        cc: 2000,
        kw: 157,
        nm: 500,
        cylinders: 4,
        fuelType: "Diesel"
      }
    } as any,
    finance: {
      period: 60,
      residualValue: 28,
      interestRate: 12.5
    } as any,
    warranty: {
      warrantyMonths: 48,
      warrantyKms: 150000,
      servicePlan: "5 Year/90000km Service Plan"
    } as any,
    additionalFeatures: {
      standardFeatures: ["Air Conditioning", "Power Steering", "Central Locking", "Electric Windows", "Cruise Control"],
      optionalFeatures: criteria.features || []
    } as any
  },
  {
    id: 3,
    mmCode: "F003",
    name: `${criteria.make} ${criteria.model} XLT`,
    description: `${criteria.make} ${criteria.model} XLT premium model`,
    cost: 380000,
    retail: 460000,
    maxDiscount: 12,
    isActive: true,
    basicVehicleInformation: {
      mmCode: "F003",
      make: criteria.make,
      model: criteria.model,
      type: criteria.type || "Pickup Double CAB"
    },
    specifications: {
      engine: {
        cc: 2000,
        kw: 157,
        nm: 500,
        cylinders: 4,
        fuelType: "Diesel"
      }
    } as any,
    finance: {
      period: 60,
      residualValue: 30,
      interestRate: 12.5
    } as any,
    warranty: {
      warrantyMonths: 60,
      warrantyKms: 200000,
      servicePlan: "5 Year/90000km Service Plan"
    } as any,
    additionalFeatures: {
      standardFeatures: ["Air Conditioning", "Power Steering", "Central Locking", "Electric Windows", "Cruise Control", "Leather Seats", "Navigation"],
      optionalFeatures: criteria.features || []
    } as any
  }
]

export function CompareStep({ searchCriteria, selectedVehicles, onSelectionChange, onNext, onPrevious }: CompareStepProps) {
  const [vehicles, setVehicles] = useState<DtoProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>(
    selectedVehicles.map(v => v.product.id)
  )

  useEffect(() => {
    if (searchCriteria.make) {
      fetchVehicles()
    }
  }, [searchCriteria.make])

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/vehicle-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: searchCriteria.make,
          model: searchCriteria.model, // Optional - for display purposes
          type: searchCriteria.type     // Optional - for display purposes
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
        
        if (data.length === 0) {
          toast({
            title: "No vehicles found",
            description: "No vehicles match your search criteria",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch vehicles",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast({
        title: "Error",
        description: "Failed to connect to vehicle search API",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleVehicleSelection = (vehicleId: number, selected: boolean) => {
    if (selected) {
      setSelectedVehicleIds(prev => [...prev, vehicleId])
      const vehicle = vehicles.find(v => v.id === vehicleId)
      if (vehicle) {
        const newPart: DtoPart = {
          quantity: 1,
          masterPrice: vehicle.retail,
          masterDiscount: 5,
          price: vehicle.retail * 0.95,
          accessories: [],
          product: vehicle
        }
        onSelectionChange([...selectedVehicles, newPart])
      }
    } else {
      setSelectedVehicleIds(prev => prev.filter(id => id !== vehicleId))
      onSelectionChange(selectedVehicles.filter(v => v.product.id !== vehicleId))
    }
  }

  // Vehicle selection is optional, user can proceed without selecting vehicles
  const isValid = true

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Compare Vehicles
          </h3>
          <p className="text-sm text-muted-foreground">
            Loading vehicles...
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Compare Vehicles
        </h3>
        <p className="text-sm text-muted-foreground">
          {vehicles.length > 0 
            ? `Compare vehicles from ${searchCriteria.make} - showing all ${vehicles.length} available models`
            : `No vehicles found for ${searchCriteria.make}`
          }
        </p>
        
        <div className="flex gap-2 mt-3">
          <Badge variant="outline">{searchCriteria.make}</Badge>
          {searchCriteria.model && <Badge variant="secondary">Searching for: {searchCriteria.model}</Badge>}
          {searchCriteria.type && <Badge variant="secondary">{searchCriteria.type}</Badge>}
          {searchCriteria.features.map(feature => (
            <Badge key={feature} variant="secondary">{feature}</Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className={`cursor-pointer transition-all ${
            selectedVehicleIds.includes(vehicle.id) 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:shadow-md'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{vehicle.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    MM Code: {vehicle.mmCode}
                  </p>
                </div>
                <Checkbox
                  checked={selectedVehicleIds.includes(vehicle.id)}
                  onCheckedChange={(checked) => 
                    toggleVehicleSelection(vehicle.id, checked as boolean)
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Retail Price</div>
                  <div className="font-medium">R {vehicle.retail.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Max Discount</div>
                  <div className="font-medium">{vehicle.maxDiscount}%</div>
                </div>
              </div>

              {vehicle.specifications && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Engine</div>
                  <div className="text-sm">
                    {vehicle.specifications.cubicCapacity || 'N/A'}cc, {vehicle.specifications.kilowatt || 'N/A'}kW
                  </div>
                </div>
              )}

              {vehicle.additionalFeatures && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Features</div>
                  <div className="flex flex-wrap gap-1">
                    {vehicle.additionalFeatures.hasAbs && <Badge variant="secondary" className="text-xs">ABS</Badge>}
                    {vehicle.additionalFeatures.hasAirbags && <Badge variant="secondary" className="text-xs">Airbags</Badge>}
                    {vehicle.additionalFeatures.hasAircon && <Badge variant="secondary" className="text-xs">A/C</Badge>}
                    {vehicle.additionalFeatures.hasPowerSteering && <Badge variant="secondary" className="text-xs">P/S</Badge>}
                    {!vehicle.additionalFeatures.hasAbs && !vehicle.additionalFeatures.hasAirbags && !vehicle.additionalFeatures.hasAircon && (
                      <span className="text-xs text-muted-foreground">No features data</span>
                    )}
                  </div>
                </div>
              )}

              {vehicle.warranty && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Warranty</div>
                  <div className="text-sm">
                    {vehicle.warranty.warrantyMonths || 'N/A'} months / {vehicle.warranty.warrantyKilometers?.toLocaleString() || 'N/A'} km
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedVehicles.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Selected Vehicles ({selectedVehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedVehicles.map((part) => (
                <div key={part.product.id} className="flex justify-between items-center py-2">
                  <div>
                    <div className="font-medium">{part.product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      MM Code: {part.product.mmCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">R {part.price.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      ({part.masterDiscount}% discount)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center gap-4 pt-4 border-t">
        {onPrevious && (
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        )}
        <div className="flex-1" />
        {selectedVehicles.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No vehicles selected (optional)
          </p>
        )}
        {onNext && (
          <Button 
            onClick={onNext}
            size="lg"
          >
            Next: Quote Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Mock data interfaces and vehicle data
interface Vehicle {
  mmCode: string
  make: string
  model: string
  type: string
  cc: number
  kw: number
  nm: number
  co2: number
  fuel: string
  consumption: number
  period: number
  kmsPM: number
  totalKms: number
  retail: number
  finPM: number
  rv: number
  rvPercent: number
  totalFin: number
  resale: number
  maint: number
  tyres: number
  fuelCost: number
  insurance: number
  opCostPM: number
  opCPK: number
  totalCostPM: number
  totalCPK: number
  tco: number
  warMths: number
  warKms: number
  smPlan: string
  planMths: number
  planKms: number
  aircon: boolean
  airbags: boolean
  alloyWheels: boolean
  abs: boolean
  cruise: boolean
  diffLock: boolean
  elecWindows: boolean
  lowRatio: boolean
  pdc: boolean
  powerSteer: boolean
  satNav: boolean
  security: boolean
  traction: boolean
}

const vehicles: Vehicle[] = [
  {
    mmCode: "220-35-150",
    make: "Ford",
    model: "Ranger 2.0 SiT Double Cab Base 4X2",
    type: "Pickup Double CAB",
    cc: 2000,
    kw: 125,
    nm: 405,
    co2: 181,
    fuel: "Diesel",
    consumption: 6.9,
    period: 60,
    kmsPM: 2500,
    totalKms: 150000,
    retail: 510700,
    finPM: 11295,
    rv: 0,
    rvPercent: 0,
    totalFin: 677749,
    resale: 224708,
    maint: 62940,
    tyres: 61525,
    fuelCost: 281587,
    insurance: 114907,
    opCostPM: 8682,
    opCPK: 347,
    totalCostPM: 16233,
    totalCPK: 649,
    tco: 974000,
    warMths: 48,
    warKms: 120000,
    smPlan: "None",
    planMths: 0,
    planKms: 0,
    aircon: true,
    airbags: true,
    alloyWheels: false,
    abs: true,
    cruise: false,
    diffLock: false,
    elecWindows: true,
    lowRatio: false,
    pdc: false,
    powerSteer: true,
    satNav: false,
    security: true,
    traction: true,
  },
  {
    mmCode: "280-16-076",
    make: "Isuzu",
    model: "D-Max 1.9 DDI Double Cab HR L A/T",
    type: "Pickup Double CAB",
    cc: 1900,
    kw: 110,
    nm: 350,
    co2: 0,
    fuel: "Diesel",
    consumption: 7.1,
    period: 60,
    kmsPM: 2500,
    totalKms: 150000,
    retail: 546200,
    finPM: 12081,
    rv: 0,
    rvPercent: 0,
    totalFin: 724861,
    resale: 245790,
    maint: 47600,
    tyres: 68229,
    fuelCost: 289749,
    insurance: 122895,
    opCostPM: 8807,
    opCPK: 352,
    totalCostPM: 16792,
    totalCPK: 671,
    tco: 1007544,
    warMths: 60,
    warKms: 120000,
    smPlan: "Service Plan",
    planMths: 60,
    planKms: 90000,
    aircon: true,
    airbags: false,
    alloyWheels: true,
    abs: true,
    cruise: false,
    diffLock: false,
    elecWindows: true,
    lowRatio: false,
    pdc: false,
    powerSteer: true,
    satNav: false,
    security: true,
    traction: true,
  },
  {
    mmCode: "220-35-300",
    make: "Ford",
    model: "Ranger 2.0 SiT Double Cab XL 4X2",
    type: "Pickup Double CAB",
    cc: 2000,
    kw: 125,
    nm: 405,
    co2: 181,
    fuel: "Diesel",
    consumption: 6.9,
    period: 60,
    kmsPM: 2500,
    totalKms: 150000,
    retail: 556800,
    finPM: 12315,
    rv: 0,
    rvPercent: 0,
    totalFin: 738928,
    resale: 239424,
    maint: 62995,
    tyres: 61525,
    fuelCost: 281587,
    insurance: 125279,
    opCostPM: 8856,
    opCPK: 354,
    totalCostPM: 17181,
    totalCPK: 687,
    tco: 1030890,
    warMths: 48,
    warKms: 120000,
    smPlan: "None",
    planMths: 0,
    planKms: 0,
    aircon: true,
    airbags: true,
    alloyWheels: false,
    abs: true,
    cruise: true,
    diffLock: true,
    elecWindows: true,
    lowRatio: false,
    pdc: false,
    powerSteer: true,
    satNav: false,
    security: true,
    traction: true,
  },
  {
    mmCode: "280-16-092",
    make: "Isuzu",
    model: "D-Max 1.9 DDI Double Cab HR LS",
    type: "Pickup Double CAB",
    cc: 1900,
    kw: 110,
    nm: 350,
    co2: 0,
    fuel: "Diesel",
    consumption: 7.1,
    period: 60,
    kmsPM: 2500,
    totalKms: 150000,
    retail: 567800,
    finPM: 12558,
    rv: 0,
    rvPercent: 0,
    totalFin: 753526,
    resale: 255510,
    maint: 47626,
    tyres: 68229,
    fuelCost: 289749,
    insurance: 127754,
    opCostPM: 8889,
    opCPK: 355,
    totalCostPM: 17189,
    totalCPK: 687,
    tco: 1031374,
    warMths: 60,
    warKms: 120000,
    smPlan: "Service Plan",
    planMths: 60,
    planKms: 90000,
    aircon: true,
    airbags: false,
    alloyWheels: true,
    abs: true,
    cruise: false,
    diffLock: false,
    elecWindows: false,
    lowRatio: false,
    pdc: false,
    powerSteer: true,
    satNav: false,
    security: true,
    traction: false,
  },
  {
    mmCode: "220-35-162",
    make: "Ford",
    model: "Ranger 2.0 SiT Double Cab Base 4X4",
    type: "Pickup Double CAB",
    cc: 2000,
    kw: 125,
    nm: 405,
    co2: 187,
    fuel: "Diesel",
    consumption: 7.1,
    period: 60,
    kmsPM: 2500,
    totalKms: 150000,
    retail: 555400,
    finPM: 12284,
    rv: 0,
    rvPercent: 0,
    totalFin: 737071,
    resale: 244376,
    maint: 65961,
    tyres: 61525,
    fuelCost: 289749,
    insurance: 124965,
    opCostPM: 9035,
    opCPK: 361,
    totalCostPM: 17248,
    totalCPK: 689,
    tco: 1034895,
    warMths: 48,
    warKms: 120000,
    smPlan: "None",
    planMths: 0,
    planKms: 0,
    aircon: true,
    airbags: true,
    alloyWheels: false,
    abs: true,
    cruise: false,
    diffLock: false,
    elecWindows: false,
    lowRatio: false,
    pdc: false,
    powerSteer: true,
    satNav: false,
    security: true,
    traction: false,
  },
  {
    mmCode: "220-35-307",
    make: "Ford",
    model: "Ranger 2.0 SiT Double Cab XL 4X4",
    type: "Pickup Double CAB",
    cc: 2000,
    kw: 125,
    nm: 405,
    co2: 197,
    fuel: "Diesel",
    consumption: 7.5,
    period: 60,
    kmsPM: 2500,
    totalKms: 150000,
    retail: 580500,
    finPM: 12839,
    rv: 0,
    rvPercent: 0,
    totalFin: 770381,
    resale: 249615,
    maint: 63023,
    tyres: 61525,
    fuelCost: 306073,
    insurance: 130612,
    opCostPM: 9353,
    opCPK: 374,
    totalCostPM: 18033,
    totalCPK: 721,
    tco: 1081999,
    warMths: 48,
    warKms: 120000,
    smPlan: "None",
    planMths: 0,
    planKms: 0,
    aircon: true,
    airbags: true,
    alloyWheels: false,
    abs: true,
    cruise: true,
    diffLock: true,
    elecWindows: false,
    lowRatio: false,
    pdc: false,
    powerSteer: true,
    satNav: false,
    security: true,
    traction: true,
  },
]

function FeatureCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="h-5 w-5 text-green-500 mx-auto" />
  ) : (
    <X className="h-5 w-5 text-red-500 mx-auto" />
  )
}
