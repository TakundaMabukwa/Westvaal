"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  FileText, 
  CreditCard, 
  Package, 
  FileCheck, 
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { WestvaalQuote, QuoteWorkflowStages } from "@/types/quote"
import { FileUpload } from "@/components/ui/file-upload"
import { toast } from "@/hooks/use-toast"

interface QuoteWorkflowProps {
  quote: WestvaalQuote
  onUpdate: (updatedQuote: WestvaalQuote) => void
}

export function QuoteWorkflow({ quote, onUpdate }: QuoteWorkflowProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const workflowStages = quote.workflowStages || {}

  const updateWorkflowStage = async (stage: keyof QuoteWorkflowStages, data: any) => {
    setLoading(stage)
    
    try {
      const response = await fetch(`/api/quotes/${quote.id}/workflow`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage,
          data
        })
      })

      if (response.ok) {
        const result = await response.json()
        onUpdate(result.quote)
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        throw new Error('Failed to update workflow stage')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow stage",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const resetWorkflowStage = async (stage: keyof QuoteWorkflowStages) => {
    setLoading(stage)
    
    try {
      const response = await fetch(`/api/quotes/${quote.id}/workflow`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage,
          data: {
            completed: false,
            // Clear all stage-specific data
            documentUrl: undefined,
            bankReferenceNumber: undefined,
            expectedDate: undefined,
            oemReference: undefined,
            licensePlate: undefined,
            registrationNumber: undefined,
            notes: undefined,
            completedAt: undefined
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        onUpdate(result.quote)
        toast({
          title: "Success",
          description: `${stage} has been reset to pending`,
        })
      } else {
        throw new Error('Failed to reset workflow stage')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset workflow stage",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const WorkflowStageCard = ({ 
    stageKey, 
    title, 
    icon: Icon, 
    color,
    description
  }: {
    stageKey: keyof QuoteWorkflowStages
    title: string
    icon: any
    color: string
    description: string
  }) => {
    const stage = workflowStages[stageKey]
    const isCompleted = stage?.completed || false
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleStageAction = (formData: any) => {
      updateWorkflowStage(stageKey, {
        ...formData,
        completed: true,
        completedAt: new Date().toISOString()
      })
      setDialogOpen(false)
    }

    return (
      <Card className={`relative transition-all duration-200 hover:shadow-md compact-card ${isCompleted ? 'ring-1 ring-green-200 bg-green-50/30' : ''}`}>
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-md ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Icon className={`h-3 w-3 ${isCompleted ? 'text-green-600' : color}`} />
              </div>
              <div>
                <CardTitle className="text-xs font-medium">{title}</CardTitle>
                <p className="text-xs text-muted-foreground leading-tight">{description}</p>
              </div>
            </div>
            {isCompleted ? (
              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-3 w-3 text-orange-500 flex-shrink-0" />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-2 px-3">
          <div className="space-y-1">
            <Badge 
              variant={isCompleted ? "default" : "secondary"} 
              className={`text-xs h-5 px-2 ${isCompleted ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300" : ""}`}
            >
              {isCompleted ? "✅ Done" : "⏳ Pending"}
            </Badge>
            
            {!isCompleted && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="w-full h-7 text-xs"
                    disabled={loading === stageKey}
                  >
                    {loading === stageKey ? "Processing..." : `Start ${title}`}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${color}`} />
                      {title}
                    </DialogTitle>
                    <DialogDescription>
                      Complete the {title.toLowerCase()} stage by filling out the required information below.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <StageForm 
                    stageKey={stageKey} 
                    onSubmit={handleStageAction}
                    loading={loading === stageKey}
                    quoteId={quote.id as string}
                  />
                </DialogContent>
              </Dialog>
            )}

            {isCompleted && stage && (
              <>
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <div className="text-xs space-y-0.5">
                    {stage.completedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span className="font-medium">Completed:</span>
                        <span className="text-green-700">{new Date(stage.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {stage.approvedBy && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="font-medium">Approved By:</span>
                        <span className="text-green-700">{stage.approvedBy}</span>
                      </div>
                    )}
                    {stage.approvedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span className="font-medium">Approved:</span>
                        <span className="text-green-700 text-xs">{new Date(stage.approvedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {stage.bankReferenceNumber && (
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-green-600" />
                        <span className="font-medium">Bank Ref:</span>
                        <span className="font-mono text-green-700 text-xs">{stage.bankReferenceNumber}</span>
                      </div>
                    )}
                    {stage.appliedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span className="font-medium">Applied:</span>
                        <span className="text-green-700 text-xs">{new Date(stage.appliedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {stage.approvedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="font-medium">Approved:</span>
                        <span className="text-green-700 text-xs">{new Date(stage.approvedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {stage.expectedDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span className="font-medium">Expected:</span>
                        <span className="text-green-700 text-xs">{new Date(stage.expectedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {stage.oemReference && (
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-green-600" />
                        <span className="font-medium">OEM Ref:</span>
                        <span className="font-mono text-green-700 text-xs">{stage.oemReference}</span>
                      </div>
                    )}
                    {stage.licensePlate && (
                      <div className="flex items-center gap-1">
                        <FileCheck className="h-3 w-3 text-green-600" />
                        <span className="font-medium">License:</span>
                        <span className="font-mono text-green-700 text-xs">{stage.licensePlate}</span>
                      </div>
                    )}
                    {stage.documentUrl && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-green-600" />
                        <a href={stage.documentUrl} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:text-blue-800 text-xs underline">
                          View Doc
                        </a>
                      </div>
                    )}
                    {stage.notes && (
                      <div className="pt-1">
                        <span className="font-medium text-green-700">Notes:</span>
                        <p className="text-green-600 text-xs mt-0.5 line-clamp-2">{stage.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-6 text-xs py-0"
                  onClick={() => resetWorkflowStage(stageKey)}
                  disabled={loading === stageKey}
                >
                  {loading === stageKey ? "Resetting..." : "Reset"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const StageForm = ({ 
    stageKey, 
    onSubmit, 
    loading,
    quoteId
  }: {
    stageKey: keyof QuoteWorkflowStages
    onSubmit: (data: any) => void
    loading: boolean
    quoteId: string
  }) => {
    const [formData, setFormData] = useState<any>({})

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {stageKey === 'approveQuote' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded p-3 mb-4">
              <p className="text-sm text-emerald-900">
                <span className="font-semibold">Approve Quote:</span> Start the workflow by approving this quote. This initiates the delivery process.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="approvedBy" className="text-sm font-medium">
                Approved By <span className="text-red-500">*</span>
              </Label>
              <Input
                id="approvedBy"
                placeholder="Enter your name"
                value={formData.approvedBy || ''}
                onChange={(e) => setFormData({...formData, approvedBy: e.target.value})}
                required
                className="w-full text-sm"
              />
              <p className="text-xs text-muted-foreground">Your name for approval tracking</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Approval Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this approval..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4}
                className="w-full text-sm"
              />
            </div>
          </div>
        )}

        {stageKey === 'preDeliveryJobCard' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Pre-Delivery Job Card:</span> Upload the job card document and any supporting documentation.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Job Card Document <span className="text-red-500">*</span></Label>
              <FileUpload
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                maxSize={10 * 1024 * 1024} // 10MB
                value={formData.documentUrl || formData.uploadedFile}
                quoteId={quoteId}
                stageKey={stageKey}
                onChange={(file, url) => {
                  if (file && url) {
                    // Upload successful - save the real Supabase URL
                    setFormData({
                      ...formData, 
                      uploadedFile: file,
                      documentUrl: url
                    })
                  } else if (!file) {
                    // File removed
                    setFormData({
                      ...formData,
                      uploadedFile: null,
                      documentUrl: ''
                    })
                  }
                  // If file exists but no URL, upload failed - don't save anything
                }}
                placeholder="Upload job card document (PDF, DOC, or image)"
              />
              <p className="text-xs text-muted-foreground">Upload the pre-delivery job card document</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the job card or pre-delivery inspection..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4}
                className="w-full text-sm"
              />
            </div>
          </div>
        )}

        {stageKey === 'applyForFinance' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Apply for Finance:</span> Enter the bank reference number for the finance application.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankReferenceNumber" className="text-sm font-medium">
                Bank Reference Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bankReferenceNumber"
                placeholder="e.g., BNK-2026-001234"
                value={formData.bankReferenceNumber || ''}
                onChange={(e) => setFormData({...formData, bankReferenceNumber: e.target.value})}
                required
                className="w-full font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Bank reference number for finance tracking</p>
            </div>
          </div>
        )}

        {stageKey === 'waitingForStock' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Waiting for Stock:</span> Track OEM supplier stock status. This stage is optional and can be skipped.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedDate" className="text-sm font-medium">Expected Delivery Date</Label>
              <Input
                id="expectedDate"
                type="date"
                value={formData.expectedDate || ''}
                onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Expected delivery date from OEM supplier</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oemReference" className="text-sm font-medium">OEM Reference Number</Label>
              <Input
                id="oemReference"
                placeholder="e.g., OEM-2026-789456"
                value={formData.oemReference || ''}
                onChange={(e) => setFormData({...formData, oemReference: e.target.value})}
                className="w-full font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Reference number from Original Equipment Manufacturer</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any stock-related notes or tracking information..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={4}
                className="w-full text-sm"
              />
            </div>
          </div>
        )}

        {stageKey === 'licenseAndReg' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="licensePlate" className="text-sm font-medium">License Plate *</Label>
              <Input
                id="licensePlate"
                placeholder="e.g., ABC123GP"
                value={formData.licensePlate || ''}
                onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                required
                className="w-full font-mono text-center text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber" className="text-sm font-medium">Registration Number *</Label>
              <Input
                id="registrationNumber"
                placeholder="Vehicle registration number"
                value={formData.registrationNumber || ''}
                onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                required
                className="w-full font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Registration Documents</Label>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10 * 1024 * 1024} // 10MB
                value={formData.documentUrl || formData.uploadedFile}
                quoteId={quoteId}
                stageKey={stageKey}
                onChange={(file, url) => {
                  if (file) {
                    setFormData({
                      ...formData, 
                      uploadedFile: file,
                      documentUrl: url || `uploads/${file.name}`
                    })
                  } else {
                    setFormData({
                      ...formData,
                      uploadedFile: null,
                      documentUrl: ''
                    })
                  }
                }}
                placeholder="Upload registration documents (PDF or image)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any registration notes..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          {stageKey === 'waitingForStock' && (
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                onSubmit({ completed: true, skipped: true })
                setDialogOpen(false)
              }}
              disabled={loading}
              className="min-w-[100px]"
            >
              Skip Stage
            </Button>
          )}
          <Button type="submit" disabled={loading} className="min-w-[120px] bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                Updating...
              </div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Stage
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">Quote Workflow</h3>
        <p className="text-sm text-muted-foreground">
          Track and manage post-creation quote stages
        </p>
      </div>

      {/* Workflow Steps Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          Workflow Steps (Can be completed in any order)
        </h4>
        <div className="space-y-3 text-xs">
          {/* Step 0: Approve Quote */}
          <div className="flex items-start gap-2 pb-2 border-b border-gray-200">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">✓</div>
            <div>
              <p className="font-medium text-gray-900">Approve Quote</p>
              <p className="text-gray-600">Click green <span className="font-semibold">Approve</span> button to start workflow</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">•</div>
              <div>
                <p className="font-medium text-gray-900">Pre-Delivery Job Card</p>
                <p className="text-gray-600">Upload documents → click <span className="font-semibold">Complete</span></p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">•</div>
              <div>
                <p className="font-medium text-gray-900">Apply for Finance</p>
                <p className="text-gray-600">Enter bank ref → click <span className="font-semibold">Complete</span></p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">•</div>
              <div>
                <p className="font-medium text-gray-900">Waiting for Stock</p>
                <p className="text-gray-600">Add OEM ref → <span className="font-semibold">Complete</span> or <span className="font-semibold">Skip</span></p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">•</div>
              <div>
                <p className="font-medium text-gray-900">License & Registration</p>
                <p className="text-gray-600">Add details → click <span className="font-semibold">Complete</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WorkflowStageCard
          stageKey="approveQuote"
          title="Approve Quote"
          icon={CheckCircle}
          color="text-emerald-600"
          description="Start workflow by approving the quote"
        />
        <WorkflowStageCard
          stageKey="preDeliveryJobCard"
          title="Pre-Delivery Job Card"
          icon={FileText}
          color="text-blue-600"
          description="Upload documentation and complete job card"
        />
        <WorkflowStageCard
          stageKey="applyForFinance"
          title="Apply for Finance"
          icon={CreditCard}
          color="text-green-600"
          description="Submit finance application and get bank reference"
        />
        <WorkflowStageCard
          stageKey="waitingForStock"
          title="Waiting for Stock"
          icon={Package}
          color="text-orange-600"
          description="Track stock delivery from OEM supplier"
        />
        <WorkflowStageCard
          stageKey="licenseAndReg"
          title="License & Registration"
          icon={FileCheck}
          color="text-purple-600"
          description="Complete vehicle licensing and registration"
        />
      </div>
    </div>
  )
}