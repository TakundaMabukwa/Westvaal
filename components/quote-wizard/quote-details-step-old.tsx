"use client"

import { useState } from "react"
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
import { Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react"
import { DtoPart, DtoCustomerDetails } from "@/types/quote"

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

export function QuoteDetailsStep({ vehicles, onChange, customerDetails, onNext, onPrevious }: QuoteDetailsStepProps) {
      quantity: 1,
      totalCost: "",
      discount: 0,
      discountRand: "",
      totalRental: "",
      accessories: "",
      accessoryQty: 1,
    },
  ])

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        product: "",
        quantity: 1,
        totalCost: "",
        discount: 0,
        discountRand: "",
        totalRental: "",
        accessories: "",
        accessoryQty: 1,
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-2">Quote Details</h3>
          <p className="text-sm text-muted-foreground">
            Configure pricing and accessories for selected vehicles
          </p>
        </div>
        <Button onClick={addItem} variant="outline" className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <Card key={item.id} className="bg-muted/30 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-foreground">
                  Vehicle {index + 1}
                </h4>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Product Row */}
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select
                    value={item.product}
                    onValueChange={(value) => updateItem(item.id, "product", value)}
                  >
                    <SelectTrigger className="bg-input border-border w-full">
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>

              {/* Cost Row */}
              <div className="grid gap-4 md:grid-cols-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-destructive">Total Cost *</Label>
                  <Input
                    placeholder="R 0.00"
                    value={item.totalCost}
                    onChange={(e) => updateItem(item.id, "totalCost", e.target.value)}
                    className="bg-input border-border"
                  />
                  {!item.totalCost && (
                    <p className="text-xs text-destructive">This field is required</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Discount %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0.00 %"
                    value={item.discount || ""}
                    onChange={(e) =>
                      updateItem(item.id, "discount", parseFloat(e.target.value) || 0)
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Rand</Label>
                  <Input
                    placeholder="R 0.00"
                    value={item.discountRand}
                    onChange={(e) => updateItem(item.id, "discountRand", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Rental/Month ex VAT</Label>
                  <Input
                    placeholder="R 0.00"
                    value={item.totalRental}
                    onChange={(e) => updateItem(item.id, "totalRental", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              {/* Accessories Row */}
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Accessories</Label>
                  <Select
                    value={item.accessories}
                    onValueChange={(value) => updateItem(item.id, "accessories", value)}
                  >
                    <SelectTrigger className="bg-input border-border w-full">
                      <SelectValue placeholder="Select accessories..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accessoryOptions.map((acc) => (
                        <SelectItem key={acc} value={acc}>
                          {acc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Accessory Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.accessoryQty}
                    onChange={(e) =>
                      updateItem(item.id, "accessoryQty", parseInt(e.target.value) || 1)
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={addItem} className="w-full gap-2 bg-transparent" variant="outline">
        <Plus className="h-4 w-4" />
        Add Accessories
      </Button>
    </div>
  )
}
