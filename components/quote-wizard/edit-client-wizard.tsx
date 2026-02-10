"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Eye, Plus, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomerDetailsStep } from "@/components/quote-wizard/customer-details-step"
import { SearchDetailsStep } from "@/components/quote-wizard/search-details-step"
import { CompareStep } from "@/components/quote-wizard/compare-step"
import { QuoteDetailsStep } from "@/components/quote-wizard/quote-details-step"
import { EmailStep } from "@/components/quote-wizard/email-step"
import { WestvaalQuote, DtoCustomerDetails, DtoPart, DtoEmail } from "@/types/quote"

const steps = [
  { id: "customer", label: "Customer Details", number: 1 },
  { id: "search", label: "Search Details", number: 2 },
  { id: "compare", label: "Compare", number: 3 },
  { id: "quote", label: "Quote Details", number: 4 },
  { id: "email", label: "Email", number: 5 },
]

interface EditClientWizardProps {
  clientId?: string
  initialData?: Partial<WestvaalQuote>
  onChange?: (data: Partial<WestvaalQuote>) => void
  onSubmit?: () => void
}

export function EditClientWizard({ clientId, initialData, onChange, onSubmit }: EditClientWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState<"view" | "create">("create")
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [quoteData, setQuoteData] = useState<Partial<WestvaalQuote>>(initialData || {
    customerDetails: {
      quoteTo: "",
      companyName: "",
      emailAddress: "",
      contactNumber: ""
    },
    parts: [],
    email: {
      to: "",
      subject: "",
      body: ""
    },
    tradeIn: {
      tradeInPrice: 0,
      settlement: 0,
      deposit: 0,
      cashback: 0,
      depositTowardsPurchase: 0
    }
  })

  const [searchCriteria, setSearchCriteria] = useState({
    make: "",
    model: "",
    type: "",
    features: [] as string[]
  })

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

  const updateQuoteData = (updates: Partial<WestvaalQuote>) => {
    const updated = { ...quoteData, ...updates }
    setQuoteData(updated)
    onChange?.(updated)
  }

  const updateCustomerDetails = (details: DtoCustomerDetails) => {
    updateQuoteData({ customerDetails: details })
  }

  const updateParts = (parts: DtoPart[]) => {
    updateQuoteData({ parts })
  }

  const updateEmail = (email: DtoEmail) => {
    updateQuoteData({ email })
  }

  const updateTradeIn = (tradeIn: any) => {
    updateQuoteData({ tradeIn })
  }

  const handlePreviewQuote = async () => {
    try {
      const response = await fetch('/api/quotes/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData)
      })

      if (response.ok) {
        const html = await response.text()
        setPreviewHtml(html)
        setPreviewDialogOpen(true)
      } else {
        console.error('Failed to generate preview')
      }
    } catch (error) {
      console.error('Failed to generate preview', error)
    }
  }

  return (
    <div className="space-y-6">
      {clientId && (
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Quote Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Client ID: {clientId} - Create and manage vehicle quotes
            </p>
          </div>
        </div>
      )}

      <Card className="bg-card border-border">
        {clientId && (
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
        )}
        <CardContent className="pt-6">
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
                      index <= currentStep
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[400px]">
            {currentStep === 0 && (
              <CustomerDetailsStep 
                data={quoteData.customerDetails!}
                onChange={updateCustomerDetails}
                onNext={goToNextStep}
              />
            )}
            {currentStep === 1 && (
              <SearchDetailsStep 
                data={searchCriteria}
                onChange={setSearchCriteria}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            )}
            {currentStep === 2 && (
              <CompareStep 
                searchCriteria={searchCriteria}
                selectedVehicles={quoteData.parts || []}
                onSelectionChange={updateParts}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            )}
            {currentStep === 3 && (
              <QuoteDetailsStep 
                vehicles={quoteData.parts || []}
                onChange={updateParts}
                customerDetails={quoteData.customerDetails!}
                tradeIn={quoteData.tradeIn}
                onTradeInChange={updateTradeIn}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
              />
            )}
            {currentStep === 4 && (
              <EmailStep 
                template={quoteData.email!}
                onChange={updateEmail}
                customerDetails={quoteData.customerDetails!}
                vehicles={quoteData.parts || []}
                onPreview={handlePreviewQuote}
                onSave={onSubmit || (() => {})}
                onSend={onSubmit || (() => {})}
                onPrevious={goToPreviousStep}
                loading={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-[80vw] w-[80vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Quote Preview</DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-hidden rounded-md border border-border">
            <iframe
              title="Quote Preview"
              srcDoc={previewHtml}
              className="h-full w-full bg-white"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
