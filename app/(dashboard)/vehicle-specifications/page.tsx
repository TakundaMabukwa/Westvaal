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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Pencil, Eye } from "lucide-react"
import VehicleSpecForm, { defaultVehicleSpecFormData } from "@/components/vehicle-specs/spec-form"
import { toast } from "@/hooks/use-toast"

interface VehicleSpec {
  mm_code: string
  make: string
  model: string
  type: string
  created_at?: string
  updated_at?: string
}

export default function VehicleSpecsPage() {
  const [activeTab, setActiveTab] = useState("view")
  const [searchCode, setSearchCode] = useState("")
  const [searchMake, setSearchMake] = useState("")
  const [searchModel, setSearchModel] = useState("")
  const [vehicles, setVehicles] = useState<VehicleSpec[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicle-specs')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch vehicle specifications",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast({
        title: "Error",
        description: "Failed to connect to vehicle specs API",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredData = vehicles.filter((s) =>
    s.mm_code.toLowerCase().includes(searchCode.toLowerCase()) &&
    s.make.toLowerCase().includes(searchMake.toLowerCase()) &&
    s.model.toLowerCase().includes(searchModel.toLowerCase())
  )

  const handleCreate = async (payload: typeof defaultVehicleSpecFormData) => {
    try {
      setSubmitting(true)
      const response = await fetch('/api/vehicle-specs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || 'Failed to create specification')
      }

      toast({
        title: "Success",
        description: "Vehicle specification created",
      })
      setActiveTab("view")
      fetchVehicles()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create vehicle specification",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Vehicle Specifications (MM)</h1>
          <p className="text-sm text-muted-foreground">View and create vehicle M&M specifications</p>
        </div>
        <Button className="gap-2" onClick={() => setActiveTab("create")}>
          <Pencil className="h-4 w-4" />
          Create
        </Button>
      </div>

      <div>
        <div className="space-y-6">
          <div>
            <div className="border-b">
              <nav className="flex gap-4" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("view")}
                  className={`px-4 py-3 ${activeTab === "view" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                >
                  View
                </button>
                <button
                  onClick={() => setActiveTab("create")}
                  className={`px-4 py-3 ${activeTab === "create" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                >
                  Create
                </button>
              </nav>
            </div>

            {activeTab === "view" && (
              <Card className="bg-card border-border mt-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-foreground">M&M Directory</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {vehicles.length} vehicle specifications in database
                  </p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="text-primary font-semibold">M&M Code</TableHead>
                            <TableHead className="text-primary font-semibold">Make</TableHead>
                            <TableHead className="text-primary font-semibold">Model</TableHead>
                            <TableHead className="text-primary font-semibold">Type</TableHead>
                            <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
                          </TableRow>
                          <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="py-2">
                              <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="M&M Code" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} className="pl-8 h-8 bg-input border-border" />
                              </div>
                            </TableHead>
                            <TableHead className="py-2">
                              <Input placeholder="Make" value={searchMake} onChange={(e) => setSearchMake(e.target.value)} className="h-8 bg-input border-border" />
                            </TableHead>
                            <TableHead className="py-2">
                              <Input placeholder="Model" value={searchModel} onChange={(e) => setSearchModel(e.target.value)} className="h-8 bg-input border-border" />
                            </TableHead>
                          <TableHead className="py-2"></TableHead>
                          <TableHead className="py-2"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((s) => (
                          <TableRow key={s.mm_code} className="hover:bg-muted/50 border-border">
                            <TableCell className="font-medium text-foreground">{s.mm_code}</TableCell>
                            <TableCell className="text-foreground">{s.make}</TableCell>
                            <TableCell className="text-foreground">{s.model}</TableCell>
                            <TableCell className="text-foreground">{s.type}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-primary/10">
                                <Link href={`/vehicle-specifications/${s.mm_code}/edit`}>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Edit
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No results</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "create" && (
              <Card className="bg-card border-border mt-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-foreground">Create M&M</CardTitle>
                </CardHeader>
                <CardContent>
                  <VehicleSpecForm
                    submitLabel="Create Specification"
                    loading={submitting}
                    onSubmit={handleCreate}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
