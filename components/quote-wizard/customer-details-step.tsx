"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, ArrowRight } from "lucide-react"
import { DtoCustomerDetails } from "@/types/quote"

interface CustomerDetailsStepProps {
  data: DtoCustomerDetails
  onChange: (data: DtoCustomerDetails) => void
  onNext?: () => void
}

// Mock client search function
const searchClients = (query: string) => [
  {
    id: "1",
    name: "3BM Engineering (PTY) LTD",
    registration: "2018/456789/07",
    vatNumber: "4987654321",
    address: "123 Industrial Road, Johannesburg, 2000",
    contactPerson: "John Smith",
    email: "john.smith@3bmengineering.co.za",
    phone: "+27 11 123 4567",
    kycStatus: true,
  },
  {
    id: "2", 
    name: "Fleet Solutions Inc",
    registration: "2020/123456/07",
    vatNumber: "1234567890",
    address: "456 Business Park, Cape Town, 8000", 
    contactPerson: "Sarah Johnson",
    email: "sarah.j@fleetsolutions.co.za",
    phone: "+27 21 987 6543",
    kycStatus: false,
  }
]

export function CustomerDetailsStep({ data, onChange, onNext }: CustomerDetailsStepProps) {
  // Ensure data has default values
  const customerData: DtoCustomerDetails = data || {
    quoteTo: "",
    companyName: "",
    emailAddress: "",
    contactNumber: ""
  }

  // If customer data is already filled (pre-filled from client), don't show as new client
  const hasExistingData = !!(customerData.companyName || customerData.quoteTo || customerData.emailAddress)
  const [isNewClient, setIsNewClient] = useState(!hasExistingData)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Update isNewClient when data changes (e.g., when pre-filled data arrives)
  useEffect(() => {
    const dataExists = !!(customerData.companyName || customerData.quoteTo || customerData.emailAddress)
    if (dataExists) {
      setIsNewClient(false) // Switch to existing client view when data is present
    }
  }, [customerData.companyName, customerData.quoteTo, customerData.emailAddress])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchClients(searchQuery)
      setSearchResults(results)
    }
  }

  const selectClient = (client: any) => {
    onChange({
      quoteTo: client.contactPerson,
      companyName: client.name,
      emailAddress: client.email,
      contactNumber: client.phone
    })
    setSearchResults([])
    setSearchQuery("")
  }

  const updateField = (field: keyof DtoCustomerDetails, value: string) => {
    onChange({
      ...customerData,
      [field]: value
    })
  }

  const isValid = customerData.quoteTo && customerData.companyName && customerData.emailAddress

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Customer Information</h3>
        <div className="flex gap-2">
          <Button
            variant={!isNewClient ? "default" : "outline"}
            size="sm"
            onClick={() => setIsNewClient(false)}
          >
            <Search className="h-4 w-4 mr-2" />
            Existing Client
          </Button>
          <Button
            variant={isNewClient ? "default" : "outline"}
            size="sm"
            onClick={() => setIsNewClient(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {!isNewClient && (
        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Search Existing Clients
            </h4>
            <div className="flex gap-2">
              <Input
                placeholder="Search by company name, contact person, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((client) => (
                  <div 
                    key={client.id}
                    className="p-3 border rounded cursor-pointer hover:bg-muted/50"
                    onClick={() => selectClient(client)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.contactPerson}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                      </div>
                      <Badge
                        variant={client.kycStatus ? "default" : "secondary"}
                        className={
                          client.kycStatus
                            ? "bg-primary/20 text-primary"
                            : "bg-destructive/20 text-destructive"
                        }
                      >
                        KYC: {client.kycStatus ? "Compliant" : "Non-Compliant"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Company Details
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={customerData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Enter company name"
                  className="bg-input border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Contact Information
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quoteTo">Contact Person</Label>
                <Input
                  id="quoteTo"
                  value={customerData.quoteTo}
                  onChange={(e) => updateField('quoteTo', e.target.value)}
                  placeholder="Enter contact person name"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={customerData.emailAddress}
                  onChange={(e) => updateField('emailAddress', e.target.value)}
                  placeholder="Enter email address"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Phone Number</Label>
                <Input
                  id="contactNumber"
                  value={customerData.contactNumber}
                  onChange={(e) => updateField('contactNumber', e.target.value)}
                  placeholder="Enter phone number"
                  className="bg-input border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {onNext && (
        <div className="flex justify-end">
          <Button 
            onClick={onNext}
            disabled={!isValid}
            className="min-w-32"
          >
            Next Step
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
