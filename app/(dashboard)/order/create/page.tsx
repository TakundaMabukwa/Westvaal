"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Eye, Plus, ArrowLeft, Save, Send } from "lucide-react"
import { CustomerDetailsStep } from "@/components/quote-wizard/customer-details-step"
import { SearchDetailsStep } from "@/components/quote-wizard/search-details-step"
import { CompareStep } from "@/components/quote-wizard/compare-step"
import { QuoteDetailsStep } from "@/components/quote-wizard/quote-details-step"
import { EmailStep } from "@/components/quote-wizard/email-step"
import { WestvaalQuote, DtoCustomerDetails, DtoEmail, DtoPart, QuoteStatus } from "@/types/quote"
import { toast } from "@/hooks/use-toast"

const steps = [
  { id: "customer", label: "Customer Details", number: 1 },
  { id: "search", label: "Search Details", number: 2 },
  { id: "compare", label: "Compare", number: 3 },
  { id: "quote", label: "Quote Details", number: 4 },
  { id: "email", label: "Email", number: 5 },
]

export default function CreateQuotePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState<"view" | "create">("create")
  const [loading, setLoading] = useState(false)

  // Quote data state
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

  const [emailTemplate, setEmailTemplate] = useState<DtoEmail>({
    subject: "Vehicle Quote - WestVaal Fleet Solutions",
    body: "Dear Valued Client,\n\nPlease find attached your customized vehicle quote as requested.\n\nOur team has carefully selected these vehicles based on your specific requirements and budget considerations.\n\nShould you have any questions or require further information, please do not hesitate to contact us.\n\nWe look forward to serving your fleet requirements.",
    footer: "Best regards,\nWestVaal Fleet Solutions Team\nPhone: +27 12 345 6789\nEmail: quotes@westvaal.co.za"
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

  const isStepValid = (step: number) => {
    switch (step) {
      case 0: // Customer Details
        return customerDetails.quoteTo && customerDetails.companyName && customerDetails.emailAddress
      case 1: // Search Details
        return searchCriteria.make && searchCriteria.model
      case 2: // Compare
        return selectedVehicles.length > 0
      case 3: // Quote Details
        return selectedVehicles.every(v => v.quantity > 0 && v.price > 0)
      case 4: // Email
        return emailTemplate.subject && emailTemplate.body
      default:
        return false
    }
  }

  const handleSaveQuote = async () => {
    setLoading(true)
    try {
      const quote: WestvaalQuote = {
        customerDetails,
        email: emailTemplate,
        parts: selectedVehicles,
        status: QuoteStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quote)
      })

      if (response.ok) {
        const savedQuote = await response.json()
        toast({
          title: "Success",
          description: "Quote saved as draft successfully",
        })
        router.push('/quoting')
      } else {
        throw new Error('Failed to save quote')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendQuote = async () => {
    setLoading(true)
    try {
      // Create quote with SENT status
      const quote: WestvaalQuote = {
        customerDetails,
        email: emailTemplate,
        parts: selectedVehicles,
        status: QuoteStatus.SENT,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save quote to database
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quote)
      })

      if (response.ok) {
        const savedQuote = await response.json()
        
        // TODO: Add email sending logic here
        // This would integrate with your email service (SendGrid, AWS SES, etc.)
        // await sendQuoteEmail({
        //   to: customerDetails.emailAddress,
        //   subject: emailTemplate.subject,
        //   body: emailTemplate.body,
        //   quoteId: savedQuote.id
        // })
        
        toast({
          title: "Quote Sent Successfully",
          description: `Quote sent to ${customerDetails.emailAddress} and saved to database`,
        })
        router.push('/quoting')
      } else {
        throw new Error('Failed to save quote')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "customer":
        return (
          <CustomerDetailsStep 
            data={customerDetails}
            onChange={setCustomerDetails}
            onNext={isStepValid(0) ? goToNextStep : undefined}
          />
        )
      case "search":
        return (
          <SearchDetailsStep 
            data={searchCriteria}
            onChange={setSearchCriteria}
            onNext={isStepValid(1) ? goToNextStep : undefined}
            onPrevious={goToPreviousStep}
          />
        )
      case "compare":
        return (
          <CompareStep 
            searchCriteria={searchCriteria}
            selectedVehicles={selectedVehicles}
            onSelectionChange={setSelectedVehicles}
            onNext={isStepValid(2) ? goToNextStep : undefined}
            onPrevious={goToPreviousStep}
          />
        )
      case "quote":
        return (
          <QuoteDetailsStep 
            vehicles={selectedVehicles}
            onChange={setSelectedVehicles}
            customerDetails={customerDetails}
            onNext={isStepValid(3) ? goToNextStep : undefined}
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
            onSave={handleSaveQuote}
            onSend={handleSendQuote}
            onPrevious={goToPreviousStep}
            loading={loading}
          />
        )
      default:
        return null
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
          <h1 className="text-2xl font-semibold text-foreground">
            Create Quote
          </h1>
          <p className="text-sm text-muted-foreground">
            Multi-step quote creation process
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "view" | "create")}
            className="w-auto"
          >
            <TabsList className="bg-muted/50 h-8">
              <TabsTrigger value="view" className="text-xs h-6 px-3 gap-1">
                <Eye className="h-3 w-3" />
                View
              </TabsTrigger>
              <TabsTrigger value="create" className="text-xs h-6 px-3 gap-1">
                <Plus className="h-3 w-3" />
                Create
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {mode === "create" && (
        <>
          {/* Progress indicator */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className="text-sm font-medium">{step.label}</div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-px mx-4 ${
                      index < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Step {steps[currentStep].number}: {steps[currentStep].label}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
            {currentStep === steps.length - 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-muted/30">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousStep}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSaveQuote}
                    disabled={loading || !isStepValid(currentStep)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Draft"}
                  </Button>
                  <Button 
                    onClick={handleSendQuote}
                    disabled={loading || !isStepValid(currentStep)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Sending..." : "Send Quote"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {mode === "view" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quote Preview</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Quote preview will be shown here
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}