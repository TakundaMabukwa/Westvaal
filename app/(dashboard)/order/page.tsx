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

  const handlePreviewQuote = async (quote: QuoteJson) => {
    try {
      const quoteData = getQuoteData(quote)
      const response = await fetch('/api/quotes/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData)
      })
      
      if (response.ok) {
        const html = await response.text()
        const newWindow = window.open()
        if (newWindow) {
          newWindow.document.write(html)
        }
      } else {
        throw new Error('Failed to generate preview')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quote preview",
        variant: "destructive",
      })
    }
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
      title: "View Order",
      description: `Opening Order ${quoteId.slice(-8)}...`,
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Order Management</h1>
          <p className="text-muted-foreground">
            Manage vehicle orders and their status workflow
          </p>
        </div>
        <Link href="/quoting/create">
          {/* <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Quote
          </Button> */}
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

                                <Tooltip>
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
                                </Tooltip>

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
    </div>
  )
}
