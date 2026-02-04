"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Building, MapPin, Phone, Mail, Users, FileText, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { WestvaalClient, CompanyInformation, Address, ContactDetail, FleetSizeInformation } from "@/types/client"

export default function CreateClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [companyInfo, setCompanyInfo] = useState<Partial<CompanyInformation>>({
    name: "",
    registrationNumber: "",
    vatNumber: "",
    kycCompliant: false,
    entityType: "",
    dateFounded: "",
    description: ""
  })

  const [physicalAddress, setPhysicalAddress] = useState<Partial<Address>>({
    streetAddress: "",
    suburb: "",
    city: "",
    postalCode: "",
    province: "",
    country: "South Africa"
  })

  const [postalAddress, setPostalAddress] = useState<Partial<Address>>({
    streetAddress: "",
    suburb: "",
    city: "",
    postalCode: "",
    province: "",
    country: "South Africa"
  })

  const [contactDetails, setContactDetails] = useState<Partial<ContactDetail>>({
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    alternativeContactName: "",
    alternativeContactEmail: "",
    alternativeContactPhone: ""
  })

  const [fleets, setFleets] = useState<Partial<FleetSizeInformation>[]>([
    {
      vehicleType: "",
      currentQuantity: 0,
      plannedQuantity: 0,
      notes: ""
    }
  ])

  const [sameAsPhysical, setSameAsPhysical] = useState(false)

  // Add a new fleet entry
  const addFleet = () => {
    setFleets([...fleets, {
      vehicleType: "",
      currentQuantity: 0,
      plannedQuantity: 0,
      notes: ""
    }])
  }

  // Remove a fleet entry
  const removeFleet = (index: number) => {
    if (fleets.length > 1) {
      setFleets(fleets.filter((_, i) => i !== index))
    }
  }

  // Update a specific fleet entry
  const updateFleet = (index: number, field: keyof FleetSizeInformation, value: any) => {
    const updatedFleets = [...fleets]
    updatedFleets[index] = { ...updatedFleets[index], [field]: value }
    setFleets(updatedFleets)
  }

  // Copy physical address to postal address
  const handleSameAsPhysical = (checked: boolean) => {
    setSameAsPhysical(checked)
    if (checked) {
      setPostalAddress({ ...physicalAddress })
    } else {
      setPostalAddress({
        streetAddress: "",
        suburb: "",
        city: "",
        postalCode: "",
        province: "",
        country: "South Africa"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyInfo.name || !companyInfo.registrationNumber || !companyInfo.vatNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required company information fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const clientData: Partial<WestvaalClient> = {
        companyInformation: companyInfo as CompanyInformation,
        addresses: [
          { ...physicalAddress, addressType: "Physical" } as Address,
          { ...postalAddress, addressType: "Postal" } as Address
        ],
        contactDetails: [contactDetails as ContactDetail],
        fleetSizeInformation: fleets as FleetSizeInformation[],
        businessTypes: [],
        clientRegistration: {
          registrationDate: new Date().toISOString(),
          isActive: true
        }
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Client created successfully",
        })
        router.push('/clients')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create client')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create client",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Client</h1>
          <p className="text-muted-foreground">
            Add a new client to your database
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={companyInfo.name || ""}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  value={companyInfo.registrationNumber || ""}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  placeholder="e.g., 2020/123456/07"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vatNumber">VAT Number *</Label>
                <Input
                  id="vatNumber"
                  value={companyInfo.vatNumber || ""}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, vatNumber: e.target.value }))}
                  placeholder="e.g., 4123456789"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entityType">Entity Type</Label>
                <Input
                  id="entityType"
                  value={companyInfo.entityType || ""}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, entityType: e.target.value }))}
                  placeholder="e.g., Private Company, Close Corporation"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={companyInfo.description || ""}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the company's business"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryContactName">Primary Contact Name</Label>
                <Input
                  id="primaryContactName"
                  value={contactDetails.primaryContactName || ""}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, primaryContactName: e.target.value }))}
                  placeholder="Contact person name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContactEmail">Email</Label>
                <Input
                  id="primaryContactEmail"
                  type="email"
                  value={contactDetails.primaryContactEmail || ""}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, primaryContactEmail: e.target.value }))}
                  placeholder="contact@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContactPhone">Phone</Label>
                <Input
                  id="primaryContactPhone"
                  value={contactDetails.primaryContactPhone || ""}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, primaryContactPhone: e.target.value }))}
                  placeholder="+27 11 123 4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Physical Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="physicalStreet">Street Address</Label>
              <Input
                id="physicalStreet"
                value={physicalAddress.streetAddress || ""}
                onChange={(e) => setPhysicalAddress(prev => ({ ...prev, streetAddress: e.target.value }))}
                placeholder="Street number and name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="physicalSuburb">Suburb</Label>
                <Input
                  id="physicalSuburb"
                  value={physicalAddress.suburb || ""}
                  onChange={(e) => setPhysicalAddress(prev => ({ ...prev, suburb: e.target.value }))}
                  placeholder="Suburb"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physicalCity">City</Label>
                <Input
                  id="physicalCity"
                  value={physicalAddress.city || ""}
                  onChange={(e) => setPhysicalAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="physicalPostalCode">Postal Code</Label>
                <Input
                  id="physicalPostalCode"
                  value={physicalAddress.postalCode || ""}
                  onChange={(e) => setPhysicalAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physicalProvince">Province</Label>
                <Input
                  id="physicalProvince"
                  value={physicalAddress.province || ""}
                  onChange={(e) => setPhysicalAddress(prev => ({ ...prev, province: e.target.value }))}
                  placeholder="Gauteng"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Postal Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Postal Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sameAsPhysical"
                checked={sameAsPhysical}
                onChange={(e) => handleSameAsPhysical(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="sameAsPhysical">Same as physical address</Label>
            </div>
            
            {!sameAsPhysical && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="postalStreet">Street Address</Label>
                  <Input
                    id="postalStreet"
                    value={postalAddress.streetAddress || ""}
                    onChange={(e) => setPostalAddress(prev => ({ ...prev, streetAddress: e.target.value }))}
                    placeholder="Street number and name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalSuburb">Suburb</Label>
                    <Input
                      id="postalSuburb"
                      value={postalAddress.suburb || ""}
                      onChange={(e) => setPostalAddress(prev => ({ ...prev, suburb: e.target.value }))}
                      placeholder="Suburb"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCity">City</Label>
                    <Input
                      id="postalCity"
                      value={postalAddress.city || ""}
                      onChange={(e) => setPostalAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalPostalCode">Postal Code</Label>
                    <Input
                      id="postalPostalCode"
                      value={postalAddress.postalCode || ""}
                      onChange={(e) => setPostalAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalProvince">Province</Label>
                    <Input
                      id="postalProvince"
                      value={postalAddress.province || ""}
                      onChange={(e) => setPostalAddress(prev => ({ ...prev, province: e.target.value }))}
                      placeholder="Gauteng"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fleet Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Fleet Information
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addFleet}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fleet
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {fleets.map((fleet, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                {fleets.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeFleet(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
                <div className="space-y-2">
                  <Label htmlFor={`vehicleType-${index}`}>Vehicle Type</Label>
                  <Input
                    id={`vehicleType-${index}`}
                    value={fleet.vehicleType || ""}
                    onChange={(e) => updateFleet(index, 'vehicleType', e.target.value)}
                    placeholder="e.g., Sedans, SUVs, Trucks"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`currentQuantity-${index}`}>Current Fleet Size</Label>
                    <Input
                      id={`currentQuantity-${index}`}
                      type="number"
                      min="0"
                      value={fleet.currentQuantity || 0}
                      onChange={(e) => updateFleet(index, 'currentQuantity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`plannedQuantity-${index}`}>Planned Fleet Size</Label>
                    <Input
                      id={`plannedQuantity-${index}`}
                      type="number"
                      min="0"
                      value={fleet.plannedQuantity || 0}
                      onChange={(e) => updateFleet(index, 'plannedQuantity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`notes-${index}`}>Notes</Label>
                  <Textarea
                    id={`notes-${index}`}
                    value={fleet.notes || ""}
                    onChange={(e) => updateFleet(index, 'notes', e.target.value)}
                    placeholder="Additional notes about this fleet..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/clients">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </form>
    </div>
  )
}