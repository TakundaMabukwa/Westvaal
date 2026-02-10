"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Package, 
  Truck, 
  Search, 
  CreditCard, 
  CheckCircle, 
  MoreVertical,
  Calendar,
  User
} from 'lucide-react'
import { WestvaalQuote, OrderStatus } from '@/types/quote'

interface QuoteKanbanProps {
  quotes: (WestvaalQuote & { id: string; created_at?: string })[]
  onStatusChange: (quoteId: string, newStatus: OrderStatus) => void
  onViewQuote: (quoteId: string) => void
  onManageWorkflow: (quoteId: string) => void
}

const STATUS_CONFIG = {
  'new_orders': {
    title: 'New Orders',
    icon: Package,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  'awaiting_delivery': {
    title: 'Awaiting Delivery',
    icon: Truck,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  'pre_delivery_inspection': {
    title: 'Pre-delivery Inspection',
    icon: Search,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  'awaiting_bank': {
    title: 'Awaiting Bank',
    icon: CreditCard,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  'completed': {
    title: 'Completed',
    icon: CheckCircle,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
}

const QuoteCard = ({ 
  quote, 
  onStatusChange, 
  onViewQuote, 
  onManageWorkflow 
}: {
  quote: WestvaalQuote & { id: string; created_at?: string }
  onStatusChange: (newStatus: OrderStatus) => void
  onViewQuote: () => void
  onManageWorkflow: () => void
}) => {
  const totalValue = quote.parts?.reduce((sum, part) => {
    const partTotal = part.price * part.quantity
    const accessoryTotal = part.accessories?.reduce((accSum, acc) => 
      accSum + (acc.price * acc.quantity), 0) || 0
    return sum + partTotal + accessoryTotal
  }, 0) || 0

  const customerName = quote.customerDetails?.companyName || 
    `${quote.customerDetails?.quoteTo || 'Unknown Customer'}`
  const vehicle = quote.parts?.[0]?.product?.basicVehicleInformation

  // Determine current workflow stage
  const getCurrentWorkflowStage = (): string => {
    const stages = quote.workflowStages
    if (!stages) return ''
    
    if (stages.approveQuote?.completed) {
      if (stages.preDeliveryJobCard?.completed) return 'Job Card Complete'
      if (stages.applyForFinance?.completed) return 'Finance Approved'
      if (stages.waitingForStock?.completed) return 'Stock Received'
      if (stages.waitingForStock?.skipped) return 'Stock Skipped'
      if (stages.licenseAndReg?.completed) return 'Licensed'
    }
    
    return ''
  }

  const workflowStage = getCurrentWorkflowStage()

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow duration-200 compact-quote-card">
      <CardContent className="p-3">
        {/* Approve button for new quotes */}
        {quote.status === OrderStatus.NEW_ORDERS && (
          <div className="mb-2">
            <Button 
              onClick={() => onStatusChange(OrderStatus.AWAITING_DELIVERY)}
              className="w-full h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve Quote
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                ORD-{String(quote.id).padStart(3, '0')}
              </span>
              {quote.created_at && (
                <span className="text-xs text-gray-500">
                  {new Date(quote.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <h4 className="font-medium text-sm truncate text-gray-900">
              {customerName}
            </h4>
            <p className="text-xs text-gray-600 truncate mt-0.5">
              {vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.type || ''}`.trim() : 'Vehicle details pending'}
            </p>
            {workflowStage && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 mt-1 bg-blue-50 text-blue-700 border-blue-200">
                {workflowStage}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onViewQuote}>
                View Quote Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageWorkflow}>
                Manage Workflow
              </DropdownMenuItem>
              {Object.entries(STATUS_CONFIG).map(([statusKey, statusConfig]) => (
                <DropdownMenuItem 
                  key={statusKey}
                  onClick={() => onStatusChange(statusKey as OrderStatus)}
                >
                  Move to {statusConfig.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-900">
              R {totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function QuoteKanban({ 
  quotes, 
  onStatusChange, 
  onViewQuote, 
  onManageWorkflow 
}: QuoteKanbanProps) {
  const groupedQuotes = useMemo(() => {
    const groups: Record<string, typeof quotes> = {
      'new_orders': [],
      'awaiting_delivery': [],
      'pre_delivery_inspection': [],
      'awaiting_bank': [],
      'completed': []
    }

    quotes.forEach(quote => {
      const quoteStatus = quote.status as string
      if (quoteStatus && groups[quoteStatus]) {
        groups[quoteStatus].push(quote)
      } else {
        // Default to new orders if status is undefined
        groups['new_orders'].push(quote)
      }
    })

    return groups
  }, [quotes])

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      {Object.entries(STATUS_CONFIG).map(([status, config]) => {
        const statusQuotes = groupedQuotes[status]
        const Icon = config.icon

        return (
          <div key={status} className="flex-shrink-0 w-80">
            <Card className={`h-full ${config.bgColor} ${config.borderColor} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className={`p-1.5 rounded-lg ${config.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{config.title}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {statusQuotes.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {statusQuotes.map((quote) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onStatusChange={(newStatus) => onStatusChange(quote.id, newStatus)}
                      onViewQuote={() => onViewQuote(quote.id)}
                      onManageWorkflow={() => onManageWorkflow(quote.id)}
                    />
                  ))}
                  {statusQuotes.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                      No quotes in this stage
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
