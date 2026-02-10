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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Plus, 
  Search, 
  Eye,
  Users,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react"
import { WestvaalQuote, QuoteStatus } from "@/types/quote"
import { QuoteWorkflow } from "@/components/quote-workflow/quote-workflow"
import { toast } from "@/hooks/use-toast"

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<WestvaalQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuote, setSelectedQuote] = useState<WestvaalQuote | null>(null)
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false)

  // Fetch quotes from API
  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/quotes')
      
      if (response.ok) {
        const quotesData = await response.json()
        // Parse JSON strings to objects
        const parsedQuotes = quotesData.map((quote: any) => ({
          ...quote,
          ...JSON.parse(quote.json)
        }))
        setQuotes(parsedQuotes)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch quotes",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to fetch quotes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuoteUpdate = (updatedQuote: WestvaalQuote) => {
    setQuotes(quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q))
    setSelectedQuote(updatedQuote)
  }

  // Filter quotes based on search term
  const filteredQuotes = quotes.filter((quote) => 
    quote.customerDetails?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customerDetails?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status !== QuoteStatus.COMPLETED).length,
    completed: quotes.filter(q => q.status === QuoteStatus.COMPLETED).length,
    inProgress: quotes.filter(q =>
      [
        QuoteStatus.PRE_DELIVERY_JOB_CARD,
        QuoteStatus.APPLY_FOR_FINANCE,
        QuoteStatus.WAITING_FOR_STOCK,
        QuoteStatus.LICENSE_AND_REG
      ].includes(q.status as QuoteStatus)
    ).length
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case QuoteStatus.COMPLETED:
        return 'default'
      case QuoteStatus.DRAFT:
        return 'secondary'
      case QuoteStatus.SENT:
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatStatus = (status?: string) => {
    if (!status) return 'Draft'
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">
            Manage quotes and track workflow progress
          </p>
        </div>
        <Button asChild>
          <Link href="/quoting/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Quote
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading quotes...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="text-muted-foreground">
                        {searchTerm 
                          ? "No quotes found matching your search" 
                          : "No quotes found"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">#{quote.id}</TableCell>
                      <TableCell>{quote.customerDetails?.companyName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(quote.status || QuoteStatus.DRAFT)}>
                          {formatStatus(quote.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuote(quote)
                              setWorkflowDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Workflow Management Dialog */}
      <Dialog open={workflowDialogOpen} onOpenChange={setWorkflowDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Workflow Management</DialogTitle>
            <DialogDescription>
              {selectedQuote && `Quote #${selectedQuote.id} - ${selectedQuote.customerDetails?.companyName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <QuoteWorkflow 
              quote={selectedQuote} 
              onUpdate={handleQuoteUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
