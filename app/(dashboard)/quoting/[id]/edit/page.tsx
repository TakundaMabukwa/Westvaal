"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Eye, Plus, ArrowLeft } from "lucide-react"
import { CustomerDetailsStep } from "@/components/quote-wizard/customer-details-step"
import { SearchDetailsStep } from "@/components/quote-wizard/search-details-step"
import { CompareStep } from "@/components/quote-wizard/compare-step"
import { QuoteDetailsStep } from "@/components/quote-wizard/quote-details-step"
import { EmailStep } from "@/components/quote-wizard/email-step"
import { WestvaalQuote, DtoCustomerDetails, DtoEmail, DtoPart, TradeInDetails, QuoteStatus, OrderStatus } from "@/types/quote"
import { toast } from "@/hooks/use-toast"

const steps = [
  { id: "customer", label: "Customer Details", number: 1 },
  { id: "search", label: "Search Details", number: 2 },
  { id: "compare", label: "Compare", number: 3 },
  { id: "quote", label: "Quote Details", number: 4 },
  { id: "email", label: "Email", number: 5 },
]

export default function EditQuotePage() {
  const router = useRouter()
  const params = useParams()
  const quoteId = String(params.id)

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState<"view" | "create">("create")
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>("")

  const [customerDetails, setCustomerDetails] = useState<DtoCustomerDetails>({
    quoteTo: "",
    companyName: "",
    emailAddress: "",
    contactNumber: ""
  })

  const [searchCriteria, setSearchCriteria] = useState({
    make: "",
    model: "",
    type: "",
    features: [] as string[]
  })

  const [selectedVehicles, setSelectedVehicles] = useState<DtoPart[]>([])
  const [tradeIn, setTradeIn] = useState<TradeInDetails | undefined>(undefined)
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus | OrderStatus>(QuoteStatus.DRAFT)
  const [emailTemplate, setEmailTemplate] = useState<DtoEmail>({
    subject: "Vehicle Quote - WestVaal Fleet Solutions",
    body: "",
    footer: "Best regards,\nWestVaal Fleet Solutions Team"
  })

  useEffect(() => {
    fetchQuote()
  }, [quoteId])

  const fetchQuote = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch(`/api/quotes/${quoteId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch quote")
      }

      const quoteRow = await response.json()
      const quoteData: WestvaalQuote = JSON.parse(quoteRow.json)

      setCustomerDetails(quoteData.customerDetails || {
        quoteTo: "",
        companyName: "",
        emailAddress: "",
        contactNumber: ""
      })
      setSelectedVehicles(quoteData.parts || [])
      setTradeIn(quoteData.tradeIn)
      setQuoteStatus(quoteData.status || QuoteStatus.DRAFT)
      setEmailTemplate(quoteData.email || {
        subject: "Vehicle Quote - WestVaal Fleet Solutions",
        body: "",
        footer: "Best regards,\nWestVaal Fleet Solutions Team"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quote",
        variant: "destructive",
      })
      router.push("/quoting")
    } finally {
      setInitialLoading(false)
    }
  }

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

  const handleSaveQuote = async () => {
    setLoading(true)
    try {
      const quote: WestvaalQuote = {
        customerDetails,
        email: emailTemplate,
        parts: selectedVehicles,
        tradeIn,
        status: quoteStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      })

      if (!response.ok) {
        throw new Error("Failed to update quote")
      }

      toast({
        title: "Success",
        description: "Quote updated successfully",
      })
      router.push("/quoting")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quote",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewQuote = async () => {
    try {
      const quote: WestvaalQuote = {
        customerDetails,
        email: emailTemplate,
        parts: selectedVehicles,
        tradeIn,
        status: quoteStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const response = await fetch("/api/quotes/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      })

      if (!response.ok) {
        throw new Error("Failed to generate preview")
      }

      const html = await response.text()
      setPreviewHtml(html)
      setPreviewDialogOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quote preview",
        variant: "destructive",
      })
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "customer":
        return (
          <CustomerDetailsStep
            data={customerDetails}
            onChange={setCustomerDetails}
            onNext={goToNextStep}
          />
        )
      case "search":
        return (
          <SearchDetailsStep
            data={searchCriteria}
            onChange={setSearchCriteria}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case "compare":
        return (
          <CompareStep
            searchCriteria={searchCriteria}
            selectedVehicles={selectedVehicles}
            onSelectionChange={setSelectedVehicles}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case "quote":
        return (
          <QuoteDetailsStep
            vehicles={selectedVehicles}
            onChange={setSelectedVehicles}
            customerDetails={customerDetails}
            tradeIn={tradeIn}
            onTradeInChange={setTradeIn}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )
      case "email":
        return (
          <EmailStep
            template={emailTemplate}
            onChange={setEmailTemplate}
            customerDetails={customerDetails}
            vehicles={selectedVehicles}
            onPreview={handlePreviewQuote}
            onSave={handleSaveQuote}
            onSend={handleSaveQuote}
            onPrevious={goToPreviousStep}
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
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
          <h1 className="text-2xl font-semibold text-foreground">Edit Quote</h1>
          <p className="text-sm text-muted-foreground">Quote #{quoteId}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tabs value={mode} onValueChange={(value) => setMode(value as "view" | "create")} className="w-auto">
            <TabsList className="bg-muted/50 h-8">
              <TabsTrigger value="view" className="text-xs h-6 px-3 gap-1">
                <Eye className="h-3 w-3" />
                View
              </TabsTrigger>
              <TabsTrigger value="create" className="text-xs h-6 px-3 gap-1">
                <Plus className="h-3 w-3" />
                Edit
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-[80vw] w-[80vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Quote Preview</DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-hidden rounded-md border border-border">
            <iframe title="Quote Preview" srcDoc={previewHtml} className="h-full w-full bg-white" />
          </div>
        </DialogContent>
      </Dialog>

      {mode === "create" && (
        <>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className="text-sm font-medium">{step.label}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-px mx-4 ${index < currentStep ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">
                Step {steps[currentStep].number}: {steps[currentStep].label}
              </h2>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
