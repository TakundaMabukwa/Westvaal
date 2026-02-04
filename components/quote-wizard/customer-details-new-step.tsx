"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function CustomerDetailsNewStep() {
  const [name, setName] = useState("")
  const [registration, setRegistration] = useState("")
  const [vat, setVat] = useState("")
  const [address, setAddress] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [kycStatus] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Customer Information</h3>
        <Badge
          variant={kycStatus ? "default" : "secondary"}
          className={kycStatus ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}
        >
          KYC: {kycStatus ? "Compliant" : "Non-Compliant"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Company Details</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration">Registration Number</Label>
                <Input id="registration" value={registration} onChange={(e) => setRegistration(e.target.value)} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat">VAT Number</Label>
                <Input id="vat" value={vat} onChange={(e) => setVat(e.target.value)} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-input border-border" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Contact Information</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input id="contact" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-input border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-input border-border" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
