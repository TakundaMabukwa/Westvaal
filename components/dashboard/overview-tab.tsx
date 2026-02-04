"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  CheckCircle,
  DollarSign,
} from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface StatData {
  value: string | number
  change: string
  trend: 'up' | 'down'
  revenue?: string
}

interface StatusBreakdown {
  name: string
  value: number
  status: string
}

interface QuoteStats {
  ordersThisMonth: StatData
  outstandingOrders: StatData
  completedOrders: StatData
  totalProfit: StatData
  totalRevenue: StatData
  statusBreakdown: StatusBreakdown[]
}

const stats = [
  {
    title: "Orders This Month",
    value: "24",
    change: "+12%",
    trend: "up",
    icon: Package,
  },
  {
    title: "Outstanding Orders",
    value: "8",
    change: "-5%",
    trend: "down",
    icon: Clock,
  },
  {
    title: "Completed Orders",
    value: "156",
    change: "+18%",
    trend: "up",
    icon: CheckCircle,
  },
  {
    title: "Total Profit",
    value: "R 1.2M",
    change: "+8%",
    trend: "up",
    icon: DollarSign,
  },
]

const salesData = [
  { quarter: "Q1", sales: 45000 },
  { quarter: "Q2", sales: 52000 },
  { quarter: "Q3", sales: 61000 },
  { quarter: "Q4", sales: 48000 },
]

const STATUS_COLORS: Record<string, string> = {
  new_orders: "hsl(var(--chart-1))",
  awaiting_delivery: "hsl(var(--chart-2))",
  pre_delivery_inspection: "hsl(var(--chart-3))",
  awaiting_bank: "hsl(var(--chart-4))",
  completed: "hsl(var(--chart-5))",
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function OverviewTab() {
  const [stats, setStats] = useState<QuoteStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/quotes/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching quote stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = stats ? [
    {
      title: "Orders This Month",
      value: stats.ordersThisMonth.value.toString(),
      change: stats.ordersThisMonth.change,
      trend: stats.ordersThisMonth.trend,
      icon: Package,
      revenue: stats.ordersThisMonth.revenue,
    },
    {
      title: "Outstanding Orders",
      value: stats.outstandingOrders.value.toString(),
      change: stats.outstandingOrders.change,
      trend: stats.outstandingOrders.trend,
      icon: Clock,
      revenue: stats.outstandingOrders.revenue,
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders.value.toString(),
      change: stats.completedOrders.change,
      trend: stats.completedOrders.trend,
      icon: CheckCircle,
      revenue: stats.completedOrders.revenue,
    },
    {
      title: "Total Profit",
      value: stats.totalProfit.value.toString(),
      change: stats.totalProfit.change,
      trend: stats.totalProfit.trend,
      icon: DollarSign,
    },
  ] : []

  const orderStatusData = stats?.statusBreakdown
    .filter(item => item.value > 0)
    .map(item => ({
      ...item,
      color: STATUS_COLORS[item.status] || "hsl(var(--chart-1))"
    })) || []

  const total = orderStatusData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                {stat.revenue && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Revenue: <span className="font-semibold text-foreground">{stat.revenue}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-primary" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span
                    className={`text-xs ${
                      stat.trend === "up" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Sales for the Year</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={salesData} accessibilityLayer>
                <XAxis
                  dataKey="quarter"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `R${value / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Outstanding Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {orderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-foreground">
                      {Math.round((item.value / total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
