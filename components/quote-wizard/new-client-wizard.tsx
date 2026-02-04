"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Eye, Plus, ArrowLeft } from "lucide-react"
import { CustomerDetailsNewStep } from "@/components/quote-wizard/customer-details-new-step"
import { SearchDetailsStep } from "@/components/quote-wizard/search-details-step"
import { CompareStep } from "@/components/quote-wizard/compare-step"
import { QuoteDetailsStep } from "@/components/quote-wizard/quote-details-step"
import { EmailStep } from "@/components/quote-wizard/email-step"

const steps = [
  { id: "customer", label: "Customer Details", number: 1 },
  { id: "search", label: "Search Details", number: 2 },
  { id: "compare", label: "Compare", number: 3 },
  { id: "quote", label: "Quote Details", number: 4 },
  { id: "email", label: "Email", number: 5 },
]

export function NewClientWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState<"view" | "create">("create")

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/quoting">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Create Quote</h1>
          <p className="text-sm text-muted-foreground">Create a quote for a new client</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-center gap-4 border-b border-border pb-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "view" | "create")}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="view" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </TabsTrigger>
                <TabsTrigger value="create" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-300"
                style={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="relative flex flex-col items-center cursor-pointer"
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      index <= currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`mt-2 text-xs whitespace-nowrap ${
                      index <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 0 && <CustomerDetailsNewStep />}
            {currentStep === 1 && <SearchDetailsStep />}
            {currentStep === 2 && <CompareStep />}
            {currentStep === 3 && <QuoteDetailsStep />}
            {currentStep === 4 && <EmailStep />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button onClick={goToNextStep} disabled={currentStep === steps.length - 1}>
              {currentStep === steps.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
