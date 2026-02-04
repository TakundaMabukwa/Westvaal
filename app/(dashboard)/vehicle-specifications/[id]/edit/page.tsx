"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"

export default function EditVehicleSpecPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the async params passed by Next.js in a client component
  const { id } = use(params as Promise<{ id: string }>)
  const [step, setStep] = useState(0)

  const goNext = () => setStep((s) => Math.min(s + 1, 3))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const router = useRouter()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Edit Vehicle Specification</h1>
            <p className="text-sm text-muted-foreground">M&amp;M ID: {id}</p>
          </div>
        </div>
      </div>

      <Tabs value="details">
        <TabsList className="bg-muted/50 rounded-md">
          <TabsTrigger value="details" className="gap-2">
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="bg-card border-border shadow rounded-lg">
            <CardContent className="p-5">
          <div className="mb-3">
              <div className="flex items-center gap-4 flex-wrap">
                {["Basic Information", "Specifications", "Financials", "Warranty"].map((label, idx) => (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium ${
                        idx <= step ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className={`text-sm ${idx <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</div>
                  </div>
                ))}
              </div>
          </div>

          <div className="min-h-[180px]">
            <div key={step} className="transition-opacity duration-250 ease-in-out">
              {step === 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Make *</label>
                      <Input value="Ford" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Model *</label>
                      <Input value="Ranger 2.0 SiT Double Cab Base 4X2" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Type *</label>
                      <Input value="Pickup Double CAB" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">M&amp;M Code</label>
                      <Input value="220-35-150" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Specifications</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">cc *</label>
                      <Input value="2000" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">kW *</label>
                      <Input value="125" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Nm *</label>
                      <Input value="405" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">CO2 *</label>
                      <Input value="181" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Fuel Type *</label>
                      <Input value="Diesel" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">L/100 *</label>
                      <Input value="6.9" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Period *</label>
                      <Input value="60" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Kms PM *</label>
                      <Input value="2500" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Financials</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Fin PM *</label>
                      <Input value="11295" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">RV *</label>
                      <Input value="0" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">RV % *</label>
                      <Input value="0.00 %" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Total Fin *</label>
                      <Input value="677749" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Warranty</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">War Mths *</label>
                      <Input value="48" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">War Kms *</label>
                      <Input value="120000" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Plan Type *</label>
                      <Input value="None" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Plan Mths *</label>
                      <Input value="0" readOnly className="mt-2 bg-muted/10 h-9 rounded-md text-sm px-3" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" onClick={goBack} disabled={step === 0}>Back</Button>
            <Button onClick={goNext}>{step === 3 ? "Save" : "Next"}</Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
