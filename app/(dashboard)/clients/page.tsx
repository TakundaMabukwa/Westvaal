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
import {
  FileText,
  Pencil,
  Shield,
  Plus,
  Search,
  Users,
  Loader2,
} from "lucide-react"
import { ClientSummary } from "@/types/client"
import { toast } from "@/hooks/use-toast"

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [kycFilter, setKycFilter] = useState<"all" | "compliant" | "non-compliant">("all")

  // Fetch clients from API
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clients')
      
      if (response.ok) {
        const clientsData = await response.json()
        setClients(clientsData)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch clients",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to fetch clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter clients based on search term and KYC status
  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.vatNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesKyc = 
      kycFilter === "all" ||
      (kycFilter === "compliant" && client.kycCompliant) ||
      (kycFilter === "non-compliant" && !client.kycCompliant)

    return matchesSearch && matchesKyc
  })

  const stats = {
    total: clients.length,
    compliant: clients.filter(c => c.kycCompliant).length,
    nonCompliant: clients.filter(c => !c.kycCompliant).length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client database and KYC compliance
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC Compliant</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.nonCompliant}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={kycFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setKycFilter("all")}
          >
            All
          </Button>
          <Button
            variant={kycFilter === "compliant" ? "default" : "outline"}
            size="sm"
            onClick={() => setKycFilter("compliant")}
            className="text-green-600 hover:text-green-700"
          >
            <Shield className="mr-1 h-3 w-3" />
            Compliant
          </Button>
          <Button
            variant={kycFilter === "non-compliant" ? "default" : "outline"}
            size="sm"
            onClick={() => setKycFilter("non-compliant")}
            className="text-red-600 hover:text-red-700"
          >
            <Shield className="mr-1 h-3 w-3" />
            Non-Compliant
          </Button>
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>VAT Number</TableHead>
                  <TableHead>Fleet Size</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="text-muted-foreground">
                        {searchTerm || kycFilter !== "all" 
                          ? "No clients found matching your filters" 
                          : "No clients found"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.registrationNumber}</TableCell>
                      <TableCell>{client.vatNumber}</TableCell>
                      <TableCell>{client.fleetSize}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={client.kycCompliant ? "default" : "destructive"}
                          className={client.kycCompliant ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          {client.kycCompliant ? "Compliant" : "Non-Compliant"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/clients/${client.id}/quote`}>
                                    <FileText className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Create Quote</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/clients/${client.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Client</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
    </div>
  )
}
