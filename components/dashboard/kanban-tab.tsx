"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WestvaalQuote, OrderStatus } from "@/types/quote"
import { CheckCircle, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

interface QuoteWithId extends WestvaalQuote {
  id: string
  created_at?: string
}

const columns = [
  { id: OrderStatus.NEW_ORDERS, title: "New Orders", color: "bg-blue-500" },
  { id: OrderStatus.AWAITING_DELIVERY, title: "Awaiting Delivery", color: "bg-yellow-500" },
  { id: OrderStatus.PRE_DELIVERY_INSPECTION, title: "Pre-delivery Inspection", color: "bg-purple-500" },
  { id: OrderStatus.AWAITING_BANK, title: "Awaiting Bank", color: "bg-orange-500" },
  { id: OrderStatus.COMPLETED, title: "Completed", color: "bg-green-500" },
]

function OrderCard({ 
  quote, 
  onStatusChange 
}: { 
  quote: QuoteWithId
  onStatusChange: (newStatus: OrderStatus) => void
}) {
  const totalValue = quote.parts?.reduce((sum, part) => {
    const partTotal = part.price * part.quantity
    const accessoryTotal = part.accessories?.reduce((accSum, acc) => 
      accSum + (acc.price * acc.quantity), 0) || 0
    return sum + partTotal + accessoryTotal
  }, 0) || 0

  const customerName = quote.customerDetails?.companyName || quote.customerDetails?.quoteTo || 'Unknown Customer'
  const vehicle = quote.parts?.[0]?.product?.basicVehicleInformation
  const vehicleInfo = vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.type || ''}`.trim() : 'Vehicle details pending'

  // Get all completed workflow stages
  const completedStages = []
  const stages = quote.workflowStages
  if (stages) {
    if (stages.approveQuote?.completed) completedStages.push('Approved')
    if (stages.preDeliveryJobCard?.completed) completedStages.push('Job Card')
    if (stages.applyForFinance?.completed) completedStages.push('Finance')
    if (stages.waitingForStock?.completed) completedStages.push('Stock')
    if (stages.waitingForStock?.skipped) completedStages.push('Stock Skipped')
    if (stages.licenseAndReg?.completed) completedStages.push('Licensed')
  }

  return (
    <Card className="bg-background border-border hover:shadow-md transition-all duration-200 hover:border-primary/50">
      <CardContent className="p-3 space-y-3">
        {/* Approve button for new quotes */}
        {quote.status === OrderStatus.NEW_ORDERS && (
          <Button 
            onClick={() => onStatusChange(OrderStatus.AWAITING_DELIVERY)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Quote
          </Button>
        )}
        
        {/* Header with Order ID, Date and Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="text-xs font-mono font-bold mb-1.5">
              ORD-{String(quote.id).padStart(3, '0')}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {quote.created_at ? new Date(quote.created_at).toLocaleDateString('en-US', { 
                month: 'numeric', 
                day: 'numeric', 
                year: 'numeric' 
              }) : 'N/A'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {columns.map((column) => (
                <DropdownMenuItem 
                  key={column.id}
                  onClick={() => onStatusChange(column.id)}
                  disabled={quote.status === column.id}
                >
                  Move to {column.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Customer Name */}
        <div>
          <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
            {customerName}
          </h4>
        </div>

        {/* Vehicle Info */}
        <div className="bg-muted/50 rounded-md p-2 border border-border/50">
          <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
            {vehicleInfo}
          </p>
        </div>

        {/* Workflow Stages */}
        {completedStages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {completedStages.map((stage, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 font-medium"
              >
                {stage}
              </Badge>
            ))}
          </div>
        )}

        {/* Price - prominent at bottom */}
        <div className="pt-2 border-t border-border">
          <div className="text-lg font-bold text-foreground tracking-tight">
            R {totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function KanbanTab() {
  const [quotes, setQuotes] = useState<QuoteWithId[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes')
      if (response.ok) {
        const data = await response.json()
        const parsedQuotes: QuoteWithId[] = data.map((q: any) => ({
          ...JSON.parse(q.json),
          id: q.id,
          created_at: q.created_at
        }))
        // Only show approved quotes (orders)
        const approvedQuotes = parsedQuotes.filter(q => q.workflowStages?.approveQuote?.completed)
        
        // Remove duplicates by ID
        const uniqueQuotes = Array.from(
          new Map(approvedQuotes.map(q => [q.id, q])).values()
        )
        
        setQuotes(uniqueQuotes)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (quoteId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      await fetchQuotes()

      toast({
        title: "Status Updated",
        description: `Order status changed successfully.`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive"
      })
    }
  }

  const groupedQuotes = useMemo(() => {
    const groups: Record<string, QuoteWithId[]> = {
      [OrderStatus.NEW_ORDERS]: [],
      [OrderStatus.AWAITING_DELIVERY]: [],
      [OrderStatus.PRE_DELIVERY_INSPECTION]: [],
      [OrderStatus.AWAITING_BANK]: [],
      [OrderStatus.COMPLETED]: []
    }

    // Track processed quote IDs to avoid duplicates
    const processedIds = new Set<string>()

    quotes.forEach(quote => {
      const quoteId = String(quote.id)
      
      // Skip if already processed
      if (processedIds.has(quoteId)) {
        return
      }

      const quoteStatus = quote.status as string
      if (quoteStatus && groups[quoteStatus]) {
        groups[quoteStatus].push(quote)
        processedIds.add(quoteId)
      }
    })

    return groups
  }, [quotes])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile view - stacked cards */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {columns.map((column) => (
          <Card key={column.id} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3 px-4 pt-4">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full shrink-0", column.color)} />
                <CardTitle className="text-base font-semibold text-foreground flex-1">
                  {column.title}
                </CardTitle>
                <Badge variant="secondary" className="text-sm font-semibold px-2.5">
                  {groupedQuotes[column.id]?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {groupedQuotes[column.id]?.map((quote) => (
                  <OrderCard 
                    key={quote.id} 
                    quote={quote}
                    onStatusChange={(newStatus) => handleStatusChange(quote.id, newStatus)}
                  />
                ))}
                {(!groupedQuotes[column.id] || groupedQuotes[column.id].length === 0) && (
                  <div className="text-center py-8 text-sm text-muted-foreground bg-muted/30 rounded-md border border-dashed border-border">
                    No orders
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop view - horizontal columns */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4">
        {columns.map((column) => (
          <Card key={column.id} className="bg-card border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 px-3 pt-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", column.color)} />
                <CardTitle className="text-sm font-semibold text-foreground flex-1 min-w-0">
                  <span className="line-clamp-2 leading-tight">{column.title}</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-semibold px-2 shrink-0">
                  {groupedQuotes[column.id]?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 flex-1 overflow-hidden">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-3">
                  {groupedQuotes[column.id]?.map((quote) => (
                    <OrderCard 
                      key={quote.id} 
                      quote={quote}
                      onStatusChange={(newStatus) => handleStatusChange(quote.id, newStatus)}
                    />
                  ))}
                  {(!groupedQuotes[column.id] || groupedQuotes[column.id].length === 0) && (
                    <div className="text-center py-8 text-xs text-muted-foreground bg-muted/30 rounded-md border border-dashed border-border">
                      No orders
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
