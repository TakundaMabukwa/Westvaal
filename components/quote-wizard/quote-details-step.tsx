"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, ChevronsUpDown, Car } from "lucide-react"
import { DtoPart, DtoCustomerDetails, TradeInDetails, DtoAccessory } from "@/types/quote"
import { cn } from "@/lib/utils"

interface QuoteDetailsStepProps {
  vehicles: DtoPart[]
  onChange: (vehicles: DtoPart[]) => void
  customerDetails: DtoCustomerDetails
  tradeIn?: TradeInDetails
  onTradeInChange?: (tradeIn?: TradeInDetails) => void
  onNext?: () => void
  onPrevious?: () => void
}

interface VehicleOption {
  mmCode: string
  make: string
  model: string
  type: string
  retail: number
}

interface AccessoryOption {
  id: number
  mm_code: string | null
  name: string
  description: string | null
  cost: number
  retail: number
  max_discount: number
  is_active: boolean
}

const defaultTradeIn: TradeInDetails = {
  tradeInPrice: 0,
  settlement: 0,
  deposit: 0,
  cashback: 0,
  depositTowardsPurchase: 0,
  owner: {
    title: "",
    firstName: "",
    lastName: "",
    idNumber: "",
    contactNumber: "",
    email: "",
    companyName: "",
    unitDoorNo: "",
    complexName: "",
    streetHouseNo: "",
    streetName: "",
    suburb: "",
    city: "",
    province: "",
    postalCode: ""
  },
  vehicle: {
    manualVehicle: false,
    appraisalNo: "",
    meadMcGrouther: "",
    category: "",
    make: "",
    model: "",
    variant: "",
    year: "",
    colour: "",
    regNo: "",
    mileage: "",
    chassisNo: "",
    engineNo: "",
    purchasedFrom: "",
    financeCompany: "",
    insuranceCompany: "",
    policyNo: "",
    settlementExpDate: "",
    nextInstallmentDate: "",
    comments: "",
    mmRetailValue: 0,
    mmTradeValue: 0,
    mmCode: ""
  },
  offer: {
    offerByDealer: 0,
    standInPriceEstimated: 0,
    standInPrice: 0,
    lessSettlement: 0,
    balanceShortage: 0,
    shortfallRecovery: 0,
    customerContribution: 0,
    addOnA: 0,
    vatApplicable: false,
    surplusApplication: 0,
    lessCashBack: 0,
    lessDepositTowardsPurchase: 0,
    nettBalance: 0
  }
}

export function QuoteDetailsStep({ vehicles, onChange, customerDetails, tradeIn, onTradeInChange, onNext, onPrevious }: QuoteDetailsStepProps) {
  const [newVehicle, setNewVehicle] = useState({
    mmCode: "",
    name: "",
    retailPrice: 0,
    quantity: 1,
    discount: 0
  })
  
  const [tradeInOpen, setTradeInOpen] = useState(false)
  const [hasTradeIn, setHasTradeIn] = useState(!!tradeIn)
  const [tradeInData, setTradeInData] = useState<TradeInDetails>(tradeIn || defaultTradeIn)
  
  const [availableVehicles, setAvailableVehicles] = useState<VehicleOption[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [availableAccessories, setAvailableAccessories] = useState<AccessoryOption[]>([])
  const [accessoryLoading, setAccessoryLoading] = useState(false)
  const [accessoryOpenId, setAccessoryOpenId] = useState<number | null>(null)
  const [accessorySearch, setAccessorySearch] = useState("")

  useEffect(() => {
    fetchAvailableVehicles()
  }, [])

  useEffect(() => {
    fetchAvailableAccessories()
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

  const buildAccessoryProduct = (accessory: AccessoryOption) => ({
    id: accessory.id,
    mmCode: accessory.mm_code || `ACC-${accessory.id}`,
    name: accessory.name,
    description: accessory.description || accessory.name,
    cost: accessory.cost || 0,
    retail: accessory.retail || 0,
    maxDiscount: accessory.max_discount || 0,
    isActive: accessory.is_active,
    basicVehicleInformation: {
      mmCode: accessory.mm_code || `ACC-${accessory.id}`,
      make: "Accessory",
      model: accessory.name,
      type: "Accessory"
    },
    specifications: null,
    finance: null,
    warranty: null,
    additionalFeatures: null
  })

  const toggleAccessory = (vehicleId: number, accessory: AccessoryOption) => {
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.product.id !== vehicleId) return vehicle
      const existing = vehicle.accessories?.find(a => a.product.id === accessory.id)
      if (existing) {
        return {
          ...vehicle,
          accessories: vehicle.accessories.filter(a => a.product.id !== accessory.id)
        }
      }
      const newAccessory: DtoAccessory = {
        quantity: 1,
        masterPrice: accessory.retail || 0,
        masterDiscount: 0,
        price: accessory.retail || 0,
        product: buildAccessoryProduct(accessory)
      }
      return {
        ...vehicle,
        accessories: [...(vehicle.accessories || []), newAccessory]
      }
    })
    onChange(updatedVehicles)
  }

  const updateAccessoryQuantity = (vehicleId: number, accessoryId: number, quantity: number) => {
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.product.id !== vehicleId) return vehicle
      const accessories = (vehicle.accessories || []).map(acc => {
        if (acc.product.id !== accessoryId) return acc
        return { ...acc, quantity: Math.max(1, quantity) }
      })
      return { ...vehicle, accessories }
    })
    onChange(updatedVehicles)
  }

  const updateTradeIn = (field: keyof TradeInDetails, value: number) => {
    const updated = { ...tradeInData, [field]: value }
    setTradeInData(updated)
    onTradeInChange?.(updated)
  }

  const fetchAvailableAccessories = async () => {
    try {
      setAccessoryLoading(true)
      const response = await fetch('/api/accessories')
      if (response.ok) {
        const data = await response.json()
        setAvailableAccessories(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching accessories:', error)
    } finally {
      setAccessoryLoading(false)
    }
  }

  const updateTradeInOwner = (field: keyof NonNullable<TradeInDetails["owner"]>, value: string) => {
    const updated = {
      ...tradeInData,
      owner: { ...tradeInData.owner, [field]: value }
    }
    setTradeInData(updated)
    onTradeInChange?.(updated)
  }

  const updateTradeInVehicle = (field: keyof NonNullable<TradeInDetails["vehicle"]>, value: string | boolean | number) => {
    const updated = {
      ...tradeInData,
      vehicle: { ...tradeInData.vehicle, [field]: value }
    }
    setTradeInData(updated)
    onTradeInChange?.(updated)
  }

  const updateTradeInOffer = (field: keyof NonNullable<TradeInDetails["offer"]>, value: number | boolean) => {
    const updated = {
      ...tradeInData,
      offer: { ...tradeInData.offer, [field]: value }
    }
    setTradeInData(updated)
    onTradeInChange?.(updated)
  }

  const calculateTradeIn = () => {
    const { tradeInPrice, settlement, deposit } = tradeInData
    const netTradeIn = tradeInPrice - settlement
    const cashback = Math.max(0, netTradeIn - deposit)
    const depositTowardsPurchase = Math.min(netTradeIn, deposit)
    
    const calculated = {
      ...tradeInData,
      cashback,
      depositTowardsPurchase
    }
    if (calculated.offer) {
      const offerByDealer = calculated.offer.offerByDealer ?? tradeInPrice
      const lessSettlement = calculated.offer.lessSettlement ?? settlement
      const customerContribution = calculated.offer.customerContribution ?? deposit
      const balanceShortage = offerByDealer - lessSettlement
      const surplusApplication = calculated.offer.surplusApplication ?? 0
      const lessCashBack = calculated.offer.lessCashBack ?? cashback
      const lessDepositTowardsPurchase = calculated.offer.lessDepositTowardsPurchase ?? depositTowardsPurchase
      const nettBalance = balanceShortage + surplusApplication - lessCashBack - lessDepositTowardsPurchase
      calculated.offer = {
        ...calculated.offer,
        offerByDealer,
        lessSettlement,
        customerContribution,
        balanceShortage,
        lessCashBack,
        lessDepositTowardsPurchase,
        nettBalance
      }
    }
    setTradeInData(calculated)
    onTradeInChange?.(calculated)
  }

  const isValid = vehicles.length === 0 || vehicles.every(v => v.quantity > 0 && v.price > 0)
  const totalValue = vehicles.reduce((sum, vehicle) => {
    const vehicleTotal = vehicle.price * vehicle.quantity
    const accessoriesTotal = (vehicle.accessories || []).reduce((accSum, acc) => accSum + (acc.price * acc.quantity), 0)
    return sum + vehicleTotal + accessoriesTotal
  }, 0)
  const tradeInOffset = hasTradeIn ? (tradeInData.depositTowardsPurchase || 0) : 0
  const netAfterTradeIn = Math.max(0, totalValue - tradeInOffset)

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

      {/* Trade-In Section */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Car className="h-4 w-4" />
                Trade-In Vehicle
              </h4>
              <p className="text-sm text-muted-foreground">
                Capture trade-in details and settlement breakdown
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setTradeInOpen(true)}>
                {hasTradeIn ? "Edit Trade-In" : "Add Trade-In"}
              </Button>
              {hasTradeIn && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setHasTradeIn(false)
                    setTradeInData(defaultTradeIn)
                    onTradeInChange?.(undefined)
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {hasTradeIn && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground">Offer by Dealer</div>
                <div className="text-lg font-semibold">R {(tradeInData.offer?.offerByDealer ?? tradeInData.tradeInPrice).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground">Less Settlement</div>
                <div className="text-lg font-semibold">R {(tradeInData.offer?.lessSettlement ?? tradeInData.settlement).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground">Nett Balance</div>
                <div className="text-lg font-semibold">R {(tradeInData.offer?.nettBalance ?? 0).toLocaleString()}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Drawer open={tradeInOpen} onOpenChange={setTradeInOpen}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader>
            <DrawerTitle>Trade-In Vehicle</DrawerTitle>
            <DrawerDescription>Complete the trade-in form for this quote.</DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-6 overflow-y-auto">
            <div className="grid gap-6">
              <div className="rounded-lg border border-border bg-background p-4">
                <h5 className="font-medium text-foreground mb-4">Owner Details</h5>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={tradeInData.owner?.title || ""} onChange={(e) => updateTradeInOwner("title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Firstname</Label>
                    <Input value={tradeInData.owner?.firstName || ""} onChange={(e) => updateTradeInOwner("firstName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Lastname</Label>
                    <Input value={tradeInData.owner?.lastName || ""} onChange={(e) => updateTradeInOwner("lastName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>ID Number</Label>
                    <Input value={tradeInData.owner?.idNumber || ""} onChange={(e) => updateTradeInOwner("idNumber", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact No.</Label>
                    <Input value={tradeInData.owner?.contactNumber || ""} onChange={(e) => updateTradeInOwner("contactNumber", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={tradeInData.owner?.email || ""} onChange={(e) => updateTradeInOwner("email", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Company Name</Label>
                    <Input value={tradeInData.owner?.companyName || ""} onChange={(e) => updateTradeInOwner("companyName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit / Door No</Label>
                    <Input value={tradeInData.owner?.unitDoorNo || ""} onChange={(e) => updateTradeInOwner("unitDoorNo", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Complex / Building</Label>
                    <Input value={tradeInData.owner?.complexName || ""} onChange={(e) => updateTradeInOwner("complexName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Street / House No</Label>
                    <Input value={tradeInData.owner?.streetHouseNo || ""} onChange={(e) => updateTradeInOwner("streetHouseNo", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Street Name</Label>
                    <Input value={tradeInData.owner?.streetName || ""} onChange={(e) => updateTradeInOwner("streetName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Suburb / Block</Label>
                    <Input value={tradeInData.owner?.suburb || ""} onChange={(e) => updateTradeInOwner("suburb", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={tradeInData.owner?.city || ""} onChange={(e) => updateTradeInOwner("city", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Input value={tradeInData.owner?.province || ""} onChange={(e) => updateTradeInOwner("province", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input value={tradeInData.owner?.postalCode || ""} onChange={(e) => updateTradeInOwner("postalCode", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <h5 className="font-medium text-foreground mb-4">Vehicle Details</h5>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2 md:col-span-3">
                    <Checkbox
                      checked={!!tradeInData.vehicle?.manualVehicle}
                      onCheckedChange={(v) => updateTradeInVehicle("manualVehicle", Boolean(v))}
                    />
                    <Label>Manual Vehicle</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Appraisal No</Label>
                    <Input value={tradeInData.vehicle?.appraisalNo || ""} onChange={(e) => updateTradeInVehicle("appraisalNo", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mead &amp; McGrouther</Label>
                    <Input value={tradeInData.vehicle?.meadMcGrouther || ""} onChange={(e) => updateTradeInVehicle("meadMcGrouther", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={tradeInData.vehicle?.category || ""} onValueChange={(v) => updateTradeInVehicle("category", v)}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Passenger Cars">Passenger Cars</SelectItem>
                        <SelectItem value="Light Commercial">Light Commercial</SelectItem>
                        <SelectItem value="Medium Commercial">Medium Commercial</SelectItem>
                        <SelectItem value="Heavy Commercial">Heavy Commercial</SelectItem>
                        <SelectItem value="Bus">Bus</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Tractor or Agricultural">Tractor or Agricultural</SelectItem>
                        <SelectItem value="Speciality">Speciality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Make</Label>
                    <Input value={tradeInData.vehicle?.make || ""} onChange={(e) => updateTradeInVehicle("make", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input value={tradeInData.vehicle?.model || ""} onChange={(e) => updateTradeInVehicle("model", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Variant</Label>
                    <Input value={tradeInData.vehicle?.variant || ""} onChange={(e) => updateTradeInVehicle("variant", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input value={tradeInData.vehicle?.year || ""} onChange={(e) => updateTradeInVehicle("year", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Colour</Label>
                    <Input value={tradeInData.vehicle?.colour || ""} onChange={(e) => updateTradeInVehicle("colour", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reg No</Label>
                    <Input value={tradeInData.vehicle?.regNo || ""} onChange={(e) => updateTradeInVehicle("regNo", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mileage</Label>
                    <Input value={tradeInData.vehicle?.mileage || ""} onChange={(e) => updateTradeInVehicle("mileage", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Chassis No</Label>
                    <Input value={tradeInData.vehicle?.chassisNo || ""} onChange={(e) => updateTradeInVehicle("chassisNo", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Engine No</Label>
                    <Input value={tradeInData.vehicle?.engineNo || ""} onChange={(e) => updateTradeInVehicle("engineNo", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchased From</Label>
                    <Input value={tradeInData.vehicle?.purchasedFrom || ""} onChange={(e) => updateTradeInVehicle("purchasedFrom", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Finance Company</Label>
                    <Input value={tradeInData.vehicle?.financeCompany || ""} onChange={(e) => updateTradeInVehicle("financeCompany", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Company</Label>
                    <Input value={tradeInData.vehicle?.insuranceCompany || ""} onChange={(e) => updateTradeInVehicle("insuranceCompany", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Policy No</Label>
                    <Input value={tradeInData.vehicle?.policyNo || ""} onChange={(e) => updateTradeInVehicle("policyNo", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Settlement exp date</Label>
                    <Input type="date" value={tradeInData.vehicle?.settlementExpDate || ""} onChange={(e) => updateTradeInVehicle("settlementExpDate", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date next installment</Label>
                    <Input type="date" value={tradeInData.vehicle?.nextInstallmentDate || ""} onChange={(e) => updateTradeInVehicle("nextInstallmentDate", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Comments</Label>
                    <Textarea value={tradeInData.vehicle?.comments || ""} onChange={(e) => updateTradeInVehicle("comments", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>M&amp;M Retail Value</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.vehicle?.mmRetailValue || ""} onChange={(e) => updateTradeInVehicle("mmRetailValue", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>M&amp;M Trade Value</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.vehicle?.mmTradeValue || ""} onChange={(e) => updateTradeInVehicle("mmTradeValue", parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <h5 className="font-medium text-foreground mb-4">Offer &amp; Settlement</h5>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Offer by Dealer (Stand-in + O/A)</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.offerByDealer || ""} onChange={(e) => updateTradeInOffer("offerByDealer", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Stand-in Price (Estimated)</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.standInPriceEstimated || ""} onChange={(e) => updateTradeInOffer("standInPriceEstimated", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Stand-in Price</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.standInPrice || ""} onChange={(e) => updateTradeInOffer("standInPrice", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Less Settlement</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.lessSettlement ?? tradeInData.settlement} onChange={(e) => updateTradeInOffer("lessSettlement", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Balance / Shortage</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.balanceShortage || ""} onChange={(e) => updateTradeInOffer("balanceShortage", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Shortfall Recovery</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.shortfallRecovery || ""} onChange={(e) => updateTradeInOffer("shortfallRecovery", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Add Customer Contribution (Deposit)</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.customerContribution ?? tradeInData.deposit} onChange={(e) => updateTradeInOffer("customerContribution", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Add O/A</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.addOnA || ""} onChange={(e) => updateTradeInOffer("addOnA", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="flex items-center gap-3 md:col-span-1">
                    <Switch checked={!!tradeInData.offer?.vatApplicable} onCheckedChange={(v) => updateTradeInOffer("vatApplicable", v)} />
                    <Label>Is the supply a taxable supply for VAT purposes?</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Surplus Application</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.surplusApplication || ""} onChange={(e) => updateTradeInOffer("surplusApplication", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Less Cash Back</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.lessCashBack ?? tradeInData.cashback} onChange={(e) => updateTradeInOffer("lessCashBack", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Less Deposit towards Purchase</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.lessDepositTowardsPurchase ?? tradeInData.depositTowardsPurchase} onChange={(e) => updateTradeInOffer("lessDepositTowardsPurchase", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nett Balance</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.offer?.nettBalance || ""} onChange={(e) => updateTradeInOffer("nettBalance", parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <h5 className="font-medium text-foreground mb-4">Quick Calculation</h5>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Trade-In Price</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.tradeInPrice || ""} onChange={(e) => updateTradeIn("tradeInPrice", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Settlement Amount</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.settlement || ""} onChange={(e) => updateTradeIn("settlement", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit</Label>
                    <Input type="number" min="0" step="1000" value={tradeInData.deposit || ""} onChange={(e) => updateTradeIn("deposit", parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <Button onClick={calculateTradeIn} variant="secondary" className="mt-4 w-full">
                  Calculate Trade-In
                </Button>
                <div className="mt-4 grid gap-4 md:grid-cols-2 rounded-lg border border-border bg-muted/50 p-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Cashback</div>
                    <div className="text-lg font-semibold text-foreground">
                      R {tradeInData.cashback.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Deposit Towards Purchase</div>
                    <div className="text-lg font-semibold text-foreground">
                      R {tradeInData.depositTowardsPurchase.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border">
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setTradeInOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setHasTradeIn(true)
                  onTradeInChange?.(tradeInData)
                  setTradeInOpen(false)
                }}
              >
                Save Trade-In
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
                    <Popover
                      open={accessoryOpenId === vehicle.product.id}
                      onOpenChange={(isOpen) => {
                        setAccessorySearch("")
                        setAccessoryOpenId(isOpen ? vehicle.product.id : null)
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between bg-input border-border"
                        >
                          {accessoryLoading ? "Loading accessories..." : "Add accessories..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[520px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search accessories..."
                            value={accessorySearch}
                            onValueChange={setAccessorySearch}
                          />
                          <CommandList>
                            <CommandEmpty>No accessories found.</CommandEmpty>
                            <CommandGroup>
                              {availableAccessories
                                .filter((acc) => {
                                  if (!accessorySearch) return true
                                  const search = accessorySearch.toLowerCase()
                                  return (
                                    acc.name.toLowerCase().includes(search) ||
                                    (acc.description || "").toLowerCase().includes(search) ||
                                    (acc.mm_code || "").toLowerCase().includes(search)
                                  )
                                })
                                .slice(0, 60)
                                .map((acc) => {
                                  const selected = vehicle.accessories?.some(a => a.product.id === acc.id)
                                  return (
                                    <CommandItem
                                      key={acc.id}
                                      value={`${acc.id}`}
                                      onSelect={() => toggleAccessory(vehicle.product.id, acc)}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                                      <span className="flex-1">
                                        {acc.name}
                                      </span>
                                      <span className="text-muted-foreground ml-2">
                                        R {Number(acc.retail || 0).toLocaleString()}
                                      </span>
                                    </CommandItem>
                                  )
                                })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {vehicle.accessories?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {vehicle.accessories.map((acc) => (
                          <div key={acc.product.id} className="flex items-center justify-between rounded-md border border-border bg-background p-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">
                                {acc.product.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                R {acc.price.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={acc.quantity}
                                onChange={(e) => updateAccessoryQuantity(vehicle.product.id, acc.product.id, parseInt(e.target.value) || 1)}
                                className="w-20 bg-input border-border"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleAccessory(vehicle.product.id, {
                                  id: acc.product.id,
                                  mm_code: acc.product.mmCode || null,
                                  name: acc.product.name,
                                  description: acc.product.description || null,
                                  cost: acc.product.cost,
                                  retail: acc.product.retail,
                                  max_discount: acc.product.maxDiscount,
                                  is_active: acc.product.isActive
                                })}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
              {hasTradeIn && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Net After Trade-In: <span className="font-medium text-foreground">R {netAfterTradeIn.toLocaleString()}</span>
                </div>
              )}
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
