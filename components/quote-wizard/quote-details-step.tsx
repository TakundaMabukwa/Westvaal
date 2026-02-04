"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { DtoPart, DtoCustomerDetails, DtoProduct } from "@/types/quote"
import { cn } from "@/lib/utils"

interface QuoteDetailsStepProps {
  vehicles: DtoPart[]
  onChange: (vehicles: DtoPart[]) => void
  customerDetails: DtoCustomerDetails
  onNext?: () => void
  onPrevious?: () => void
}

const accessoryOptions = [
  "Towbar",
  "Canopy", 
  "Rubberizing",
  "Side Steps",
  "Roll Bar",
  "Nudge Bar",
  "Cargo Net",
  "Seat Covers",
]

interface VehicleOption {
  mmCode: string
  make: string
  model: string
  type: string
  retail: number
}

export function QuoteDetailsStep({ vehicles, onChange, customerDetails, onNext, onPrevious }: QuoteDetailsStepProps) {
  const [newVehicle, setNewVehicle] = useState({
    mmCode: "",
    name: "",
    retailPrice: 0,
    quantity: 1,
    discount: 0
  })
  
  const [availableVehicles, setAvailableVehicles] = useState<VehicleOption[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchAvailableVehicles()
  }, [])

  const fetchAvailableVehicles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehicle-specs')
      if (response.ok) {
        const data = await response.json()
        // Map all vehicles without restrictive filtering
        setAvailableVehicles(data.map((v: any) => ({
            mmCode: v.mm_code || v.mmCode || '',
            make: v.make || 'Unknown',
            model: v.model || 'Unknown',
            type: v.type || '',
            retail: v.retail || 0
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleSelect = (mmCode: string) => {
    const selected = availableVehicles.find(v => v.mmCode === mmCode)
    if (selected) {
      setNewVehicle({
        mmCode: selected.mmCode,
        name: `${selected.make} ${selected.model} ${selected.type}`.trim(),
        retailPrice: selected.retail,
        quantity: 1,
        discount: 0
      })
      setOpen(false)
    }
  }

  const filteredVehicles = availableVehicles.filter(v => {
    if (!searchTerm) return true // Show all if no search term
    const search = searchTerm.toLowerCase()
    const mmCode = (v.mmCode || '').toLowerCase()
    const make = (v.make || '').toLowerCase()
    const model = (v.model || '').toLowerCase()
    const type = (v.type || '').toLowerCase()
    return mmCode.includes(search) ||
           make.includes(search) ||
           model.includes(search) ||
           type.includes(search)
  })

  const addManualVehicle = () => {
    if (!newVehicle.name || newVehicle.retailPrice <= 0) return

    const price = newVehicle.retailPrice * (1 - newVehicle.discount / 100)
    
    const vehicle: DtoPart = {
      quantity: newVehicle.quantity,
      masterPrice: newVehicle.retailPrice,
      masterDiscount: newVehicle.discount,
      price: price,
      accessories: [],
      product: {
        id: Date.now(), // Temporary ID
        mmCode: newVehicle.mmCode || `MANUAL-${Date.now()}`,
        name: newVehicle.name,
        description: newVehicle.name,
        cost: newVehicle.retailPrice * 0.85,
        retail: newVehicle.retailPrice,
        maxDiscount: 15,
        isActive: true,
        basicVehicleInformation: {
          mmCode: newVehicle.mmCode || `MANUAL-${Date.now()}`,
          make: "Manual Entry",
          model: newVehicle.name,
          type: "Manual"
        },
        specifications: null,
        finance: null,
        warranty: null,
        additionalFeatures: null
      }
    }

    onChange([...vehicles, vehicle])
    
    // Reset form
    setNewVehicle({
      mmCode: "",
      name: "",
      retailPrice: 0,
      quantity: 1,
      discount: 0
    })
  }

  const removeVehicle = (vehicleId: number) => {
    onChange(vehicles.filter(v => v.product.id !== vehicleId))
  }
  
  const updateVehicleQuantity = (vehicleId: number, quantity: number) => {
    const updatedVehicles = vehicles.map(vehicle => 
      vehicle.product.id === vehicleId 
        ? { ...vehicle, quantity: Math.max(1, quantity) }
        : vehicle
    )
    onChange(updatedVehicles)
  }

  const updateVehicleDiscount = (vehicleId: number, discount: number) => {
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.product.id === vehicleId) {
        const clampedDiscount = Math.min(discount, vehicle.product.maxDiscount)
        const newPrice = vehicle.masterPrice * (1 - clampedDiscount / 100)
        return { 
          ...vehicle, 
          masterDiscount: clampedDiscount,
          price: newPrice
        }
      }
      return vehicle
    })
    onChange(updatedVehicles)
  }

  const isValid = vehicles.length === 0 || vehicles.every(v => v.quantity > 0 && v.price > 0)
  const totalValue = vehicles.reduce((sum, vehicle) => sum + (vehicle.price * vehicle.quantity), 0)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Quote Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Add vehicles and configure pricing
        </p>
      </div>

      {/* Manual Vehicle Entry Form */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-2">
              <Label>Search by MM Code or Vehicle Name</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-input border-border"
                  >
                    {newVehicle.mmCode
                      ? `${newVehicle.mmCode} - ${newVehicle.name}`
                      : loading ? "Loading vehicles..." : "Select a vehicle..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search by MM Code, Make, or Model..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No vehicles found.</CommandEmpty>
                      <CommandGroup>
                        {filteredVehicles.slice(0, 50).map((vehicle) => (
                          <CommandItem
                            key={vehicle.mmCode}
                            value={vehicle.mmCode}
                            onSelect={() => handleVehicleSelect(vehicle.mmCode)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                newVehicle.mmCode === vehicle.mmCode ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="flex-1">
                              {vehicle.mmCode} - {vehicle.make} {vehicle.model} {vehicle.type}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              R {vehicle.retail.toLocaleString()}
                            </span>
                          </CommandItem>
                        ))}
                        {filteredVehicles.length > 50 && (
                          <div className="p-2 text-xs text-muted-foreground text-center border-t">
                            Showing first 50 results. Refine your search for more.
                          </div>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleName">Vehicle Name *</Label>
              <Input
                id="vehicleName"
                value={newVehicle.name}
                onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                placeholder="e.g., Toyota Hilux 2.8"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail Price *</Label>
              <Input
                id="retailPrice"
                type="number"
                min="0"
                step="1000"
                value={newVehicle.retailPrice || ""}
                onChange={(e) => setNewVehicle({ ...newVehicle, retailPrice: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 450000"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newVehicle.quantity}
                onChange={(e) => setNewVehicle({ ...newVehicle, quantity: parseInt(e.target.value) || 1 })}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount %</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={newVehicle.discount}
                onChange={(e) => setNewVehicle({ ...newVehicle, discount: parseFloat(e.target.value) || 0 })}
                className="bg-input border-border"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addManualVehicle}
                disabled={!newVehicle.name || newVehicle.retailPrice <= 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {vehicles.length > 0 && (
          <h4 className="font-medium text-foreground">Added Vehicles</h4>
        )}
        {vehicles.map((vehicle) => (
          <Card key={vehicle.product.id} className="bg-muted/30 border-border">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-foreground">
                    {vehicle.product.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    MM Code: {vehicle.product.mmCode}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVehicle(vehicle.product.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${vehicle.product.id}`}>Quantity</Label>
                      <Input
                        id={`quantity-${vehicle.product.id}`}
                        type="number"
                        min="1"
                        value={vehicle.quantity}
                        onChange={(e) => updateVehicleQuantity(vehicle.product.id, parseInt(e.target.value) || 1)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`discount-${vehicle.product.id}`}>Discount %</Label>
                      <Input
                        id={`discount-${vehicle.product.id}`}
                        type="number"
                        min="0"
                        max={vehicle.product.maxDiscount}
                        value={vehicle.masterDiscount}
                        onChange={(e) => updateVehicleDiscount(vehicle.product.id, parseFloat(e.target.value) || 0)}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Retail Price</div>
                      <div className="font-medium">R {vehicle.masterPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Unit Price</div>
                      <div className="font-medium">R {vehicle.price.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Value</div>
                      <div className="font-medium">R {(vehicle.price * vehicle.quantity).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Max Discount</div>
                      <div className="font-medium">{vehicle.product.maxDiscount}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Accessories</Label>
                    <Select>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Add accessories..." />
                      </SelectTrigger>
                      <SelectContent>
                        {accessoryOptions.map((accessory) => (
                          <SelectItem key={accessory} value={accessory}>
                            {accessory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quote Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-foreground">Quote Summary</h4>
              <p className="text-sm text-muted-foreground">
                {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} • Total quantity: {vehicles.reduce((sum, v) => sum + v.quantity, 0)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                R {totalValue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Value
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
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
            className="ml-auto"
          >
            Continue to Email
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}