"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Send, Download, Eye, ArrowLeft } from "lucide-react"
import { DtoEmail, DtoCustomerDetails, DtoPart } from "@/types/quote"

interface EmailStepProps {
  template: DtoEmail
  onChange: (template: DtoEmail) => void
  customerDetails: DtoCustomerDetails
  vehicles: DtoPart[]
  onPreview?: () => void
  onSave: () => void
  onSend: () => void
  onPrevious?: () => void
  loading: boolean
}

export function EmailStep({ 
  template, 
  onChange, 
  customerDetails, 
  vehicles, 
  onPreview,
  onSave, 
  onSend, 
  onPrevious, 
  loading 
}: EmailStepProps) {
  const [sendCopy, setSendCopy] = useState(true)
  const [attachPdf, setAttachPdf] = useState(true)
  
  // Initialize with proper default values to avoid uncontrolled input issues
  const totalValue = vehicles.reduce((sum, vehicle) => sum + (vehicle.price * vehicle.quantity), 0)
  const vehicleCount = vehicles.length
  const totalQuantity = vehicles.reduce((sum, v) => sum + v.quantity, 0)
  
  const [emailData, setEmailData] = useState({
    to: customerDetails.emailAddress || "",
    cc: "",
    subject: `Vehicle Quote - ${customerDetails.companyName || "Fleet Requirements"}`,
    message: `Dear ${customerDetails.quoteTo || "Valued Client"},

Please find attached your customized vehicle quote as requested for ${customerDetails.companyName || "your company"}.

Quote Summary:
• ${vehicleCount} vehicle${vehicleCount !== 1 ? 's' : ''} selected
• Total quantity: ${totalQuantity}
• Total value: R ${totalValue.toLocaleString()}

Our team has carefully selected these vehicles based on your specific requirements and budget considerations. Each vehicle has been configured with competitive pricing and relevant accessories.

Should you have any questions or require further information about any of the vehicles or pricing, please do not hesitate to contact us. We are here to assist with your fleet requirements.

We look forward to serving your business needs and appreciate the opportunity to provide this quote.

${template.footer || "Best regards,\\nWestVaal Fleet Solutions Team\\nPhone: +27 12 345 6789\\nEmail: quotes@westvaal.co.za"}`
  })

  // Update email data when customer details or vehicles change
  useEffect(() => {
    const newTotalValue = vehicles.reduce((sum, vehicle) => sum + (vehicle.price * vehicle.quantity), 0)
    const newVehicleCount = vehicles.length
    const newTotalQuantity = vehicles.reduce((sum, v) => sum + v.quantity, 0)

    const newEmailData = {
      to: customerDetails.emailAddress || "",
      cc: "",
      subject: `Vehicle Quote - ${customerDetails.companyName || "Fleet Requirements"}`,
      message: `Dear ${customerDetails.quoteTo || "Valued Client"},

Please find attached your customized vehicle quote as requested for ${customerDetails.companyName || "your company"}.

Quote Summary:
• ${newVehicleCount} vehicle${newVehicleCount !== 1 ? 's' : ''} selected
• Total quantity: ${newTotalQuantity}
• Total value: R ${newTotalValue.toLocaleString()}

Our team has carefully selected these vehicles based on your specific requirements and budget considerations.

Should you have any questions or require further information, please do not hesitate to contact us.

We look forward to serving your fleet requirements.`
    }

    setEmailData(newEmailData)

    // Update the template with the auto-generated content
    onChange({
      subject: `Vehicle Quote - ${customerDetails.companyName || "Fleet Requirements"}`,
      body: newEmailData.message,
      footer: template.footer || "Best regards,\\nWestVaal Fleet Solutions Team\\nPhone: +27 12 345 6789\\nEmail: quotes@westvaal.co.za"
    })
  }, [customerDetails, vehicles, template.footer])

  const updateEmailField = (field: keyof typeof emailData, value: string) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }))

    // Update the template when subject or message changes
    if (field === 'subject') {
      onChange({ ...template, subject: value })
    } else if (field === 'message') {
      onChange({ ...template, body: value })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-2">Send Quote</h3>
        <p className="text-sm text-muted-foreground">
          Review and send the quote to the client via email
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Details
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="email"
                  value={emailData.to}
                  onChange={(e) => updateEmailField('to', e.target.value)}
                  placeholder="client@example.com"
                  className="bg-input border-border"
                />
                {customerDetails.quoteTo && (
                  <p className="text-xs text-muted-foreground">
                    Contact: {customerDetails.quoteTo}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  type="email"
                  value={emailData.cc}
                  onChange={(e) => updateEmailField('cc', e.target.value)}
                  placeholder="Enter CC email addresses..."
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => updateEmailField('subject', e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={8}
                  value={emailData.message}
                  onChange={(e) => updateEmailField('message', e.target.value)}
                  className="bg-input border-border resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-muted/30 border-border">
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Client Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="text-foreground font-medium">{customerDetails.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="text-foreground font-medium">{customerDetails.quoteTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground font-medium">{customerDetails.emailAddress}</span>
                </div>
                {customerDetails.contactNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground font-medium">{customerDetails.contactNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-border">
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Email Options
              </h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendCopy"
                    checked={sendCopy}
                    onCheckedChange={(checked) => setSendCopy(checked === true)}
                  />
                  <Label htmlFor="sendCopy" className="text-sm cursor-pointer">
                    Send a copy to myself
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attachPdf"
                    checked={attachPdf}
                    onCheckedChange={(checked) => setAttachPdf(checked === true)}
                  />
                  <Label htmlFor="attachPdf" className="text-sm cursor-pointer">
                    Attach quote as PDF
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Quote Summary
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vehicles</span>
                  <span className="text-foreground font-medium">{vehicleCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span className="text-foreground font-medium">{totalQuantity}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="text-primary font-semibold">R {totalValue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full gap-2" 
              onClick={onSend}
              disabled={loading || !emailData.to || !emailData.subject}
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Send Quote"}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={() => onPreview?.()}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 bg-transparent"
                onClick={onSave}
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                {loading ? "Saving..." : "Save Draft"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        {onPrevious && (
          <Button variant="outline" onClick={onPrevious} disabled={loading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        )}
      </div>
    </div>
  )
}
