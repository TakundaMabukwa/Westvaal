import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WestvaalQuote } from '@/types/quote'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all quotes
    const { data: quotesData, error } = await supabase
      .schema('westvaal')
      .from('quote_json')
      .select('json, created_at')

    if (error) {
      console.error('Error fetching quotes:', error)
      return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
    }

    // Parse quotes
    const quotes: (WestvaalQuote & { created_at?: string })[] = quotesData?.map(q => ({
      ...JSON.parse(q.json),
      created_at: q.created_at
    })) || []

    // Calculate date ranges
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Filter approved quotes (orders)
    const approvedQuotes = quotes.filter(q => 
      q.workflowStages?.approveQuote?.completed === true
    )

    // Orders This Month - approved quotes in current month
    const ordersThisMonth = approvedQuotes.filter(q => {
      const approvedAt = q.workflowStages?.approveQuote?.approvedAt
      if (!approvedAt) return false
      const date = new Date(approvedAt)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length

    // Orders Last Month
    const ordersLastMonth = approvedQuotes.filter(q => {
      const approvedAt = q.workflowStages?.approveQuote?.approvedAt
      if (!approvedAt) return false
      const date = new Date(approvedAt)
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    }).length

    // Outstanding Orders - approved but not completed
    const outstandingOrders = approvedQuotes.filter(q => 
      q.status !== 'completed'
    ).length

    // Outstanding Orders Last Month
    const outstandingLastMonth = approvedQuotes.filter(q => {
      const approvedAt = q.workflowStages?.approveQuote?.approvedAt
      if (!approvedAt) return false
      const date = new Date(approvedAt)
      const isLastMonth = date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
      return isLastMonth && q.status !== 'completed'
    }).length

    // Completed Orders - all workflow stages completed
    const completedOrders = approvedQuotes.filter(q => 
      q.status === 'completed'
    ).length

    // Completed Orders Last Month
    const completedLastMonth = approvedQuotes.filter(q => {
      const completedAt = q.workflowStages?.licenseAndReg?.completedAt
      if (!completedAt) return false
      const date = new Date(completedAt)
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    }).length

    // Calculate Total Profit - sum of all completed order values
    const calculateQuoteTotal = (quote: WestvaalQuote): number => {
      let total = 0
      
      quote.parts?.forEach(part => {
        // Calculate part revenue (price includes discount already)
        const partRevenue = (part.price || 0) * (part.quantity || 1)
        total += partRevenue
        
        // Add accessory revenues
        part.accessories?.forEach(acc => {
          const accRevenue = (acc.price || 0) * (acc.quantity || 1)
          total += accRevenue
        })
      })
      
      return total
    }

    const totalProfit = approvedQuotes
      .filter(q => q.status === 'completed')
      .reduce((sum, quote) => sum + calculateQuoteTotal(quote), 0)

    // Calculate total revenue (all approved quotes regardless of completion)
    const totalRevenue = approvedQuotes.reduce((sum, quote) => sum + calculateQuoteTotal(quote), 0)

    // Revenue This Month
    const revenueThisMonth = approvedQuotes
      .filter(q => {
        const approvedAt = q.workflowStages?.approveQuote?.approvedAt
        if (!approvedAt) return false
        const date = new Date(approvedAt)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, quote) => sum + calculateQuoteTotal(quote), 0)

    // Revenue Last Month
    const revenueLastMonth = approvedQuotes
      .filter(q => {
        const approvedAt = q.workflowStages?.approveQuote?.approvedAt
        if (!approvedAt) return false
        const date = new Date(approvedAt)
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
      })
      .reduce((sum, quote) => sum + calculateQuoteTotal(quote), 0)

    // Group quotes by status for the chart
    const statusCounts = {
      new_orders: approvedQuotes.filter(q => q.status === 'new_orders').length,
      awaiting_delivery: approvedQuotes.filter(q => q.status === 'awaiting_delivery').length,
      pre_delivery_inspection: approvedQuotes.filter(q => q.status === 'pre_delivery_inspection').length,
      awaiting_bank: approvedQuotes.filter(q => q.status === 'awaiting_bank').length,
      completed: approvedQuotes.filter(q => q.status === 'completed').length,
    }

    // Total Profit Last Month
    const totalProfitLastMonth = approvedQuotes
      .filter(q => {
        const completedAt = q.workflowStages?.licenseAndReg?.completedAt
        if (!completedAt) return false
        const date = new Date(completedAt)
        return date.getMonth() === lastMonth && 
               date.getFullYear() === lastMonthYear && 
               q.status === 'completed'
      })
      .reduce((sum, quote) => sum + calculateQuoteTotal(quote), 0)

    // Calculate percentage changes
    const ordersChange = ordersLastMonth > 0 
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(0)
      : ordersThisMonth > 0 ? '100' : '0'

    const outstandingChange = outstandingLastMonth > 0
      ? ((outstandingOrders - outstandingLastMonth) / outstandingLastMonth * 100).toFixed(0)
      : outstandingOrders > 0 ? '100' : '0'

    const completedChange = completedLastMonth > 0
      ? ((completedOrders - completedLastMonth) / completedLastMonth * 100).toFixed(0)
      : completedOrders > 0 ? '100' : '0'

    const profitChange = totalProfitLastMonth > 0
      ? ((totalProfit - totalProfitLastMonth) / totalProfitLastMonth * 100).toFixed(0)
      : totalProfit > 0 ? '100' : '0'

    const revenueChange = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(0)
      : revenueThisMonth > 0 ? '100' : '0'

    // Format total profit
    const formatCurrency = (amount: number): string => {
      if (amount >= 1000000) {
        return `R ${(amount / 1000000).toFixed(1)}M`
      } else if (amount >= 1000) {
        return `R ${(amount / 1000).toFixed(0)}k`
      }
      return `R ${amount.toFixed(0)}`
    }

    return NextResponse.json({
      ordersThisMonth: {
        value: ordersThisMonth,
        change: `${Number(ordersChange) >= 0 ? '+' : ''}${ordersChange}%`,
        trend: Number(ordersChange) >= 0 ? 'up' : 'down',
        revenue: formatCurrency(revenueThisMonth)
      },
      outstandingOrders: {
        value: outstandingOrders,
        change: `${Number(outstandingChange) >= 0 ? '+' : ''}${outstandingChange}%`,
        trend: Number(outstandingChange) >= 0 ? 'up' : 'down',
        revenue: formatCurrency(
          approvedQuotes
            .filter(q => q.status !== 'completed')
            .reduce((sum, quote) => sum + calculateQuoteTotal(quote), 0)
        )
      },
      completedOrders: {
        value: completedOrders,
        change: `${Number(completedChange) >= 0 ? '+' : ''}${completedChange}%`,
        trend: Number(completedChange) >= 0 ? 'up' : 'down',
        revenue: formatCurrency(totalProfit)
      },
      totalProfit: {
        value: formatCurrency(totalProfit),
        change: `${Number(profitChange) >= 0 ? '+' : ''}${profitChange}%`,
        trend: Number(profitChange) >= 0 ? 'up' : 'down'
      },
      totalRevenue: {
        value: formatCurrency(totalRevenue),
        change: `${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`,
        trend: Number(revenueChange) >= 0 ? 'up' : 'down'
      },
      statusBreakdown: [
        { name: 'New Orders', value: statusCounts.new_orders, status: 'new_orders' },
        { name: 'Awaiting Delivery', value: statusCounts.awaiting_delivery, status: 'awaiting_delivery' },
        { name: 'Pre-Delivery Inspection', value: statusCounts.pre_delivery_inspection, status: 'pre_delivery_inspection' },
        { name: 'Awaiting Bank', value: statusCounts.awaiting_bank, status: 'awaiting_bank' },
        { name: 'Completed', value: statusCounts.completed, status: 'completed' }
      ]
    })

  } catch (error) {
    console.error('Error calculating quote stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
