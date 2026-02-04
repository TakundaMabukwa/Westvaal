"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Pencil,
  Shield,
  Plus,
  Search,
  Users,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Settings
} from "lucide-react"
import { QuoteJson, WestvaalQuote, QuoteStatus } from "@/types/quote"
import { QuoteWorkflow } from "@/components/quote-workflow/quote-workflow"
import { QuoteKanban } from "@/components/quote-kanban/quote-kanban"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

export default function QuotingPage() {
  const [activeTab, setActiveTab] = useState("view")
  const [quotes, setQuotes] = useState<QuoteJson[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuote, setSelectedQuote] = useState<WestvaalQuote | null>(null)
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false)
  const [previewQuote, setPreviewQuote] = useState<WestvaalQuote | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)

  // Fetch quotes on component mount
  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes')
      if (response.ok) {
        const data = await response.json()
        setQuotes(data || [])
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        toast({
          title: "Warning",
          description: "Could not fetch quotes. The database might not be set up yet.",
          variant: "default",
        })
        setQuotes([]) // Set empty array so UI shows "no quotes found"
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast({
        title: "Warning", 
        description: "Could not connect to quote API",
        variant: "default",
      })
      setQuotes([]) // Set empty array so UI shows "no quotes found"
    } finally {
      setLoading(false)
    }
  }

  const getQuoteData = (quote: QuoteJson): WestvaalQuote => {
    const quoteData = JSON.parse(quote.json)
    // Ensure the ID is set from the database record
    return {
      ...quoteData,
      id: quote.id
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case QuoteStatus.DRAFT:
        return <Badge variant="secondary">{status}</Badge>
      case QuoteStatus.CLIENT_APPROVED:
        return <Badge variant="default">{status}</Badge>
      case QuoteStatus.AWAITING_BANK_REF:
        return <Badge variant="outline">{status}</Badge>
      case QuoteStatus.AWAITING_INSPECTION:
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case QuoteStatus.DRAFT:
        return <Pencil className="h-4 w-4" />
      case QuoteStatus.CLIENT_APPROVED:
        return <CheckCircle className="h-4 w-4" />
      case QuoteStatus.AWAITING_BANK_REF:
        return <Clock className="h-4 w-4" />
      case QuoteStatus.AWAITING_INSPECTION:
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleApproveQuote = async (id: number) => {
    try {
      const response = await fetch(`/api/quotes/${id}/approve`, {
        method: 'PUT',
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Quote approved successfully",
        })
        fetchQuotes() // Refresh the list
      } else {
        throw new Error('Failed to approve quote')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve quote",
        variant: "destructive",
      })
    }
  }

  const handlePreviewQuote = async (quote: WestvaalQuote) => {
    setPreviewQuote(quote)
    setPreviewDialogOpen(true)
  }
  const handleQuoteUpdate = (updatedQuote: WestvaalQuote) => {
    // Update the quote in the quotes list
    setQuotes(quotes.map(q => {
      if (q.id === updatedQuote.id) {
        return {
          ...q,
          json: JSON.stringify(updatedQuote)
        }
      }
      return q
    }))
    setSelectedQuote(updatedQuote)
  }
  const filteredQuotes = quotes.filter(quote => {
    const quoteData = getQuoteData(quote)
    return (
      quoteData.customerDetails.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quoteData.customerDetails.quoteTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quoteData.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }).map(quote => {
    // Transform QuoteJson to the format expected by Kanban
    const quoteData = getQuoteData(quote)
    return {
      ...quoteData,
      id: quote.id,
      created_at: quote.created_at
    }
  })

  const calculateQuoteTotal = (quote: WestvaalQuote): number => {
    return quote.parts.reduce((sum, part) => sum + (part.price * part.quantity), 0)
  }

  const handleStatusChange = async (quoteId: string, newStatus: QuoteStatus) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Refresh quotes data
      await fetchQuotes()

      toast({
        title: "Status Updated",
        description: `Quote status changed successfully.`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update quote status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleViewQuote = (quoteId: string) => {
    // For now, just show a toast - you can implement detailed view later
    toast({
      title: "View Quote",
      description: `Opening quote ${quoteId.slice(-8)}...`,
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Quote Management</h1>
          <p className="text-muted-foreground">
            Manage vehicle quotes and their status workflow
          </p>
        </div>
        <Link href="/quoting/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Quote
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kanban">
            <Users className="h-4 w-4 mr-2" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="view">
            <FileText className="h-4 w-4 mr-2" />
            Table View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <QuoteKanban
            quotes={filteredQuotes}
            onStatusChange={handleStatusChange}
            onViewQuote={handleViewQuote}
            onManageWorkflow={(quoteId) => {
              const quote = filteredQuotes.find(q => String(q.id) === String(quoteId))
              if (quote) {
                setSelectedQuote(quote)
                setWorkflowDialogOpen(true)
              }
            }}
          />
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Quotes</CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, company, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => {
                      const total = calculateQuoteTotal(quote)
                      return (
                        <TableRow key={quote.id}>
                          <TableCell>#{quote.id}</TableCell>
                          <TableCell>{quote.customerDetails.quoteTo}</TableCell>
                          <TableCell>{quote.customerDetails.companyName}</TableCell>
                          <TableCell>{quote.parts.length} item(s)</TableCell>
                          <TableCell>R {total.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(quote.status)}
                              {getStatusBadge(quote.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {quote.created_at 
                              ? new Date(quote.created_at).toLocaleDateString()
                              : 'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handlePreviewQuote(quote)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Preview Quote</TooltipContent>
                                </Tooltip>

                                {quote.status === QuoteStatus.DRAFT && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleApproveQuote(quote.id)}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Approve Quote</TooltipContent>
                                  </Tooltip>
                                )}

                                {/* <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedQuote(quote)
                                        setWorkflowDialogOpen(true)
                                      }}
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Manage Workflow</TooltipContent>
                                </Tooltip> */}

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/quoting/${quote.id}/edit`}>
                                      <Button variant="ghost" size="sm">
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Quote</TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filteredQuotes.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {quotes.length === 0 ? "No quotes found. Create your first quote!" : "No quotes match your search."}
                            </p>
                            {quotes.length === 0 && (
                              <Link href="/quoting/create">
                                <Button className="mt-2">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create New Quote
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Workflow Management Dialog */}
      <Dialog open={workflowDialogOpen} onOpenChange={setWorkflowDialogOpen}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">Quote Workflow Management</DialogTitle>
            <DialogDescription className="text-base">
              {selectedQuote && `Quote #${selectedQuote.id} - ${selectedQuote.customerDetails?.companyName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {selectedQuote && (
              <QuoteWorkflow 
                quote={selectedQuote} 
                onUpdate={handleQuoteUpdate}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quote Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-[70vw] w-[70vw] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
          <DialogHeader className="flex-shrink-0 border-b pb-4 bg-gradient-to-r from-primary/5 to-primary/10 -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
            <DialogTitle className="text-2xl font-bold text-foreground">Quote Preview</DialogTitle>
            <DialogDescription className="text-base mt-1">
              {previewQuote && `Quote #${previewQuote.id} - ${previewQuote.customerDetails?.companyName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-2 space-y-6 py-6">
            {previewQuote && (
              <>
                {/* Customer Information */}
                <Card className="shadow-md border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-blue-500 text-white rounded-lg">
                        <Users className="h-5 w-5" />
                      </div>
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Company Name</Label>
                        <p className="text-base font-medium bg-muted/50 p-3 rounded-md">{previewQuote.customerDetails.companyName}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Person</Label>
                        <p className="text-base font-medium bg-muted/50 p-3 rounded-md">{previewQuote.customerDetails.quoteTo}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email Address</Label>
                        <p className="text-base font-medium bg-muted/50 p-3 rounded-md">{previewQuote.customerDetails.emailAddress}</p>
                      </div>
                      {previewQuote.customerDetails.contactNumber && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Number</Label>
                          <p className="text-base font-medium bg-muted/50 p-3 rounded-md">{previewQuote.customerDetails.contactNumber}</p>
                        </div>
                      )}
                      {previewQuote.customerDetails.registrationNumber && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Registration Number</Label>
                          <p className="text-base font-medium bg-muted/50 p-3 rounded-md">{previewQuote.customerDetails.registrationNumber}</p>
                        </div>
                      )}
                      {previewQuote.customerDetails.vatNumber && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">VAT Number</Label>
                          <p className="text-base font-medium bg-muted/50 p-3 rounded-md">{previewQuote.customerDetails.vatNumber}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quote Details */}
                <Card className="shadow-md border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-purple-500 text-white rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      Quote Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quote ID</Label>
                        <p className="text-base font-medium bg-muted/50 p-3 rounded-md">#{previewQuote.id}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
                        <div className="bg-muted/50 p-3 rounded-md">{getStatusBadge(previewQuote.status)}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Created Date</Label>
                        <p className="text-base font-medium bg-muted/50 p-3 rounded-md">
                          {previewQuote.created_at 
                            ? new Date(previewQuote.created_at).toLocaleDateString('en-ZA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicles/Items */}
                <Card className="shadow-md border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-green-500 text-white rounded-lg">
                        <Shield className="h-5 w-5" />
                      </div>
                      Vehicles & Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {previewQuote.parts.map((part, index) => (
                        <div key={index} className="border-2 rounded-xl p-5 space-y-4 bg-gradient-to-br from-background to-muted/20 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="font-bold text-lg text-foreground">{part.product.name}</h4>
                              {part.product.mmCode && (
                                <p className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded inline-block">
                                  MM Code: {part.product.mmCode}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                              Qty: {part.quantity}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="space-y-2 bg-background p-3 rounded-lg border">
                              <Label className="text-xs font-bold text-muted-foreground uppercase">Retail Price</Label>
                              <p className="font-semibold text-base">R {part.masterPrice.toLocaleString()}</p>
                            </div>
                            <div className="space-y-2 bg-background p-3 rounded-lg border">
                              <Label className="text-xs font-bold text-muted-foreground uppercase">Discount</Label>
                              <p className="font-semibold text-base">{part.masterDiscount}%</p>
                            </div>
                            <div className="space-y-2 bg-background p-3 rounded-lg border">
                              <Label className="text-xs font-bold text-muted-foreground uppercase">Unit Price</Label>
                              <p className="font-semibold text-base">R {part.price.toLocaleString()}</p>
                            </div>
                            <div className="space-y-2 bg-primary/10 p-3 rounded-lg border-2 border-primary/30">
                              <Label className="text-xs font-bold text-primary uppercase">Subtotal</Label>
                              <p className="font-bold text-base text-primary">
                                R {(part.price * part.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {part.accessories && part.accessories.length > 0 && (
                            <div className="mt-4 pt-4 border-t-2 border-dashed">
                              <Label className="text-sm font-bold mb-3 block flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Accessories
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {part.accessories.map((acc, accIndex) => (
                                  <div key={accIndex} className="flex justify-between text-sm bg-muted/70 p-3 rounded-lg border hover:bg-muted transition-colors">
                                    <span className="font-medium">{acc.name}</span>
                                    <span className="font-bold">R {acc.price.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Totals */}
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/30 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/10">
                    <CardTitle className="text-xl font-bold">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-base py-2">
                        <span className="text-muted-foreground font-medium">Total Items</span>
                        <span className="font-bold text-lg">{previewQuote.parts.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-base py-2">
                        <span className="text-muted-foreground font-medium">Total Quantity</span>
                        <span className="font-bold text-lg">
                          {previewQuote.parts.reduce((sum, p) => sum + p.quantity, 0)}
                        </span>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center text-2xl font-bold pt-4 pb-2 px-4 bg-primary/20 rounded-lg border-2 border-primary/40">
                        <span>Total Amount</span>
                        <span className="text-primary">
                          R {calculateQuoteTotal(previewQuote).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow Status (if applicable) */}
                {previewQuote.workflowStages && (
                  <Card className="shadow-md border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-amber-500 text-white rounded-lg">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        Workflow Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {previewQuote.workflowStages.approveQuote && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <Badge variant={previewQuote.workflowStages.approveQuote.completed ? "default" : "secondary"} className="text-lg px-2">
                              {previewQuote.workflowStages.approveQuote.completed ? "✓" : "○"}
                            </Badge>
                            <span className="text-sm font-medium">Approve Quote</span>
                          </div>
                        )}
                        {previewQuote.workflowStages.preDeliveryJobCard && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <Badge variant={previewQuote.workflowStages.preDeliveryJobCard.completed ? "default" : "secondary"} className="text-lg px-2">
                              {previewQuote.workflowStages.preDeliveryJobCard.completed ? "✓" : "○"}
                            </Badge>
                            <span className="text-sm font-medium">Pre-Delivery Job Card</span>
                          </div>
                        )}
                        {previewQuote.workflowStages.applyForFinance && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <Badge variant={previewQuote.workflowStages.applyForFinance.completed ? "default" : "secondary"} className="text-lg px-2">
                              {previewQuote.workflowStages.applyForFinance.completed ? "✓" : "○"}
                            </Badge>
                            <span className="text-sm font-medium">Apply for Finance</span>
                          </div>
                        )}
                        {previewQuote.workflowStages.waitingForStock && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <Badge variant={previewQuote.workflowStages.waitingForStock.completed ? "default" : "secondary"} className="text-lg px-2">
                              {previewQuote.workflowStages.waitingForStock.completed ? "✓" : "○"}
                            </Badge>
                            <span className="text-sm font-medium">Waiting for Stock</span>
                          </div>
                        )}
                        {previewQuote.workflowStages.licenseAndReg && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <Badge variant={previewQuote.workflowStages.licenseAndReg.completed ? "default" : "secondary"} className="text-lg px-2">
                              {previewQuote.workflowStages.licenseAndReg.completed ? "✓" : "○"}
                            </Badge>
                            <span className="text-sm font-medium">License & Registration</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
