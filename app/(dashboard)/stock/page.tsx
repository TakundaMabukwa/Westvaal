"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, UploadCloud } from "lucide-react"

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<string>("view")
  const [fleetCreateMode, setFleetCreateMode] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  const sampleStock = [
    { id: "s1", name: "Gold", registration: "ABC123" },
  ]

  const sampleFleet = [
    { id: "f1", name: "Fleet A", make: "FORD", fleetSize: 3, discount: "3%" },
  ]

  // Create form state (dropdowns)
  const [mmCode, setMmCode] = useState("")
  const [color, setColor] = useState("")
  const [registration, setRegistration] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function openEdit(item: any) {
    setSelected(item)
    setMmCode(item.mmCode || "")
    setColor(item.color || "")
    setRegistration(item.registration || "")
    setFleetCreateMode(false)
    setActiveTab("create")
  }

  function openFleetEdit(item: any) {
    setSelected(item)
    setMmCode(item.mmCode || "")
    setColor(item.color || "")
    setRegistration("")
    setFleetCreateMode(true)
    setActiveTab("create")
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  function save() {
    // placeholder: save logic
    setSelected(null)
    setName("")
    setRegistration("")
    setFile(null)
    setPreview(null)
    setActiveTab("view")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stock</h1>
          <p className="text-sm text-muted-foreground">Manage stock and fleet assist</p>
        </div>
      </div>

      <div>
        <div className="border-b">
          <nav className="flex gap-4" aria-label="Tabs">
            <button onClick={() => { setActiveTab("view"); setFleetCreateMode(false) }} className={`px-4 py-3 ${activeTab === "view" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>View</button>
            <button onClick={() => { setActiveTab("create"); setFleetCreateMode(false) }} className={`px-4 py-3 ${activeTab === "create" && !fleetCreateMode ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Create</button>
            <button onClick={() => { setActiveTab("fleet"); setFleetCreateMode(false) }} className={`px-4 py-3 ${activeTab === "fleet" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Fleet Assist</button>
            <button onClick={() => { setActiveTab("reports"); setFleetCreateMode(false) }} className={`px-4 py-3 ${activeTab === "reports" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Reports</button>
          </nav>
        </div>

        {activeTab === "view" && (
          <Card className="bg-card border-border mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Stock Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-primary font-semibold">Name</TableHead>
                      <TableHead className="text-primary font-semibold">Registration</TableHead>
                      <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleStock.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.registration}</TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button onClick={() => openEdit(row)} className="h-8 w-8 rounded-md bg-transparent hover:bg-muted/20">
                                  <Pencil className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "create" && (
          <Card className="bg-card border-border mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{fleetCreateMode ? "Create Fleet Assist" : selected ? "Edit Stock" : "Create Stock"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">MM Code *</label>
                  <Select value={mmCode} onValueChange={(v) => setMmCode(v)}>
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Select MM Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="220-35-150">220-35-150 - Ford - Ranger 2.0 SiT Double Cab Base 4X2</SelectItem>
                      <SelectItem value="280-16-076">280-16-076 - Isuzu - D-Max 1.9 DDI Double Cab HR L A/T</SelectItem>
                      <SelectItem value="220-35-300">220-35-300 - Ford - Ranger 2.0 SiT Double Cab XL 4X2</SelectItem>
                      <SelectItem value="280-16-092">280-16-092 - Isuzu - D-Max 1.9 DDI Double Cab HR LS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Vehicle Color</label>
                  <Select value={color} onValueChange={(v) => setColor(v)}>
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Select Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Registration</label>
                  <Select value={registration} onValueChange={(v) => setRegistration(v)}>
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Select Registration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ABC123">ABC123</SelectItem>
                      <SelectItem value="DEF456">DEF456</SelectItem>
                      <SelectItem value="GHI789">GHI789</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground">Upload Image</label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input id="stock-file" type="file" accept="image/*" onChange={handleFile} className="hidden" />
                      <Button variant="outline" onClick={() => document.getElementById('stock-file')?.click()}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload image
                      </Button>
                    </label>
                    <div className="flex-1">
                      {preview ? (
                        <div className="w-full border rounded-md p-2">
                          <img src={preview} alt="preview" className="max-h-40 w-auto mx-auto object-contain" />
                        </div>
                      ) : (
                        <div className="h-20 rounded-md border border-dashed flex items-center justify-center text-sm text-muted-foreground">No file selected</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button onClick={save}>{selected || fleetCreateMode ? "Update" : "Create"}</Button>
                <Button variant="outline" onClick={() => { setSelected(null); setName(""); setRegistration(""); setFile(null); setPreview(null); setActiveTab("view") }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "fleet" && (
          <Card className="bg-card border-border mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Fleet Assist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-right">
                <Button onClick={() => { setFleetCreateMode(true); setSelected(null); setName(""); setActiveTab("create") }}><UploadCloud className="mr-2 h-4 w-4" /> Create</Button>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-primary font-semibold">Name</TableHead>
                      <TableHead className="text-primary font-semibold">Make</TableHead>
                      <TableHead className="text-primary font-semibold">Fleet Size</TableHead>
                      <TableHead className="text-primary font-semibold">Discount</TableHead>
                      <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleFleet.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.make}</TableCell>
                        <TableCell>{row.fleetSize}</TableCell>
                        <TableCell>{row.discount}</TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button onClick={() => openFleetEdit(row)} className="h-8 w-8 rounded-md bg-transparent hover:bg-muted/20">
                                  <Pencil className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "reports" && (
          <Card className="bg-card border-border mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reports and exports will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
