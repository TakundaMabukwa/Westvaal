"use client"

import { useState } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Pencil, X, Check } from "lucide-react"

export default function OrdersPage() {
  const [searchName, setSearchName] = useState("")
  const [searchCompany, setSearchCompany] = useState("")
  const [searchEmail, setSearchEmail] = useState("")

  const orders = [
    {
      id: "o1",
      name: "John Client",
      company: "3BM Engineering (PTY) LTD",
      email: "john@3bm.co.za",
      contact: "John Smith",
      status: "Open",
    },
    {
      id: "o2",
      name: "Jane Customer",
      company: "Apex Transport Services",
      email: "jane@apex.co.za",
      contact: "Jane Doe",
      status: "Pending",
    },
  ]

  const filtered = orders.filter((o) =>
    o.name.toLowerCase().includes(searchName.toLowerCase()) &&
    o.company.toLowerCase().includes(searchCompany.toLowerCase()) &&
    o.email.toLowerCase().includes(searchEmail.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">Manage orders, approve or close them</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-foreground">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-primary font-semibold">Name</TableHead>
                  <TableHead className="text-primary font-semibold">Company Name</TableHead>
                  <TableHead className="text-primary font-semibold">Email Address</TableHead>
                  <TableHead className="text-primary font-semibold">Primary Contact</TableHead>
                  <TableHead className="text-primary font-semibold">Status</TableHead>
                  <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
                </TableRow>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="py-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="pl-8 h-8 bg-input border-border" />
                    </div>
                  </TableHead>
                  <TableHead className="py-2">
                    <Input placeholder="Company Name" value={searchCompany} onChange={(e) => setSearchCompany(e.target.value)} className="h-8 bg-input border-border" />
                  </TableHead>
                  <TableHead className="py-2">
                    <Input placeholder="Email Address" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="h-8 bg-input border-border" />
                  </TableHead>
                  <TableHead className="py-2"></TableHead>
                  <TableHead className="py-2"></TableHead>
                  <TableHead className="py-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order, index) => (
                  <TableRow key={order.id} className={`border-border ${index % 2 === 0 ? "bg-muted/30" : ""}`}>
                    <TableCell className="font-medium text-foreground">{order.name}</TableCell>
                    <TableCell className="text-muted-foreground">{order.company}</TableCell>
                    <TableCell className="text-muted-foreground">{order.email}</TableCell>
                    <TableCell className="text-muted-foreground">{order.contact}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "Open" ? "default" : "secondary"} className={order.status === "Open" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/orders/${order.id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-chart-4/20 hover:text-chart-4"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>Edit Order</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Close Order</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Approve Order</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No results</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
