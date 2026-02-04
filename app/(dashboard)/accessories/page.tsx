"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Trash2, Edit2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Accessory {
  id: number
  mm_code: string | null
  name: string
  description: string | null
  cost: number
  retail: number
  max_discount: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export default function AccessoriesPage() {
  const [activeTab, setActiveTab] = useState<string>("view")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Accessory | null>(null)
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [loading, setLoading] = useState(true)

  // form state
  const [mmCode, setMmCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [cost, setCost] = useState("")
  const [retail, setRetail] = useState("")
  const [maxDiscount, setMaxDiscount] = useState("")

  useEffect(() => {
    fetchAccessories()
  }, [])

  const fetchAccessories = async () => {
    try {
      const response = await fetch('/api/accessories')
      if (response.ok) {
        const data = await response.json()
        setAccessories(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch accessories",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching accessories:', error)
      toast({
        title: "Error",
        description: "Failed to connect to accessories API",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  function openView(item: Accessory) {
    setSelected(item)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setSelected(null)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete accessory?')) return
    
    try {
      const response = await fetch(`/api/accessories/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAccessories((s) => s.filter((a) => a.id !== id))
        closeDrawer()
        toast({
          title: "Success",
          description: "Accessory deleted successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete accessory",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting accessory:', error)
      toast({
        title: "Error",
        description: "Failed to delete accessory",
        variant: "destructive"
      })
    }
  }

  function handleEditFromDrawer(item: Accessory) {
    setMmCode(item.mm_code || '')
    setName(item.name)
    setDescription(item.description || '')
    setCost(item.cost.toString())
    setRetail(item.retail.toString())
    setMaxDiscount(item.max_discount.toString())
    setDrawerOpen(false)
    setSelected(item)
    setActiveTab('create')
  }

  async function save() {
    const payload = {
      mmCode: mmCode,
      name: name,
      description: description,
      cost: cost,
      retail: retail,
      maxDiscount: maxDiscount || '0'
    }

    try {
      const url = selected ? `/api/accessories/${selected.id}` : '/api/accessories'
      const method = selected ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        
        if (selected) {
          setAccessories((s) => s.map((x) => x.id === data.id ? data : x))
        } else {
          setAccessories((s) => [data, ...s])
        }
        
        // Reset form
        setMmCode('')
        setName('')
        setDescription('')
        setCost('')
        setRetail('')
        setMaxDiscount('')
        setSelected(null)
        setActiveTab('view')
        
        toast({
          title: "Success",
          description: `Accessory ${selected ? 'updated' : 'created'} successfully`
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to ${selected ? 'update' : 'create'} accessory`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving accessory:', error)
      toast({
        title: "Error",
        description: `Failed to ${selected ? 'update' : 'create'} accessory`,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Accessories</h1>
          <p className="text-sm text-muted-foreground">Manage accessories catalog</p>
        </div>
      </div>

      <div>
        <div className="border-b">
          <nav className="flex gap-4" aria-label="Tabs">
            <button onClick={() => setActiveTab('view')} className={`px-4 py-3 ${activeTab === 'view' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>View</button>
            <button onClick={() => setActiveTab('create')} className={`px-4 py-3 ${activeTab === 'create' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Create</button>
          </nav>
        </div>

        {activeTab === 'view' && (
          <Card className="bg-card border-border mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Accessories</CardTitle>
              <p className="text-sm text-muted-foreground">
                {accessories.length} accessories in catalog
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
                      <TableRow>
                        <TableHead className="text-primary font-semibold">MMCode</TableHead>
                        <TableHead className="text-primary font-semibold">Make and Model</TableHead>
                        <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessories.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.mm_code || 'N/A'}</TableCell>
                          <TableCell>{row.name} {row.description ? ` - ${row.description}` : ''}</TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => openView(row)} className="h-8 w-8 rounded-md bg-transparent hover:bg-muted/20">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                      {accessories.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                            No accessories found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'create' && (
          <Card className="bg-card border-border mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{selected ? 'Edit Accessory' : 'Create Accessory'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">MM Code</label>
                  <Input 
                    placeholder="e.g., 6R0071126" 
                    value={mmCode} 
                    onChange={(e) => setMmCode(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <Input 
                    placeholder="e.g., VW Roof Bar Pair" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-input border-border"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <Textarea 
                    placeholder="e.g., Roof bar set - Silver for Polo Vivo" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-input border-border min-h-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cost (R)</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={cost} 
                    onChange={(e) => setCost(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Retail Price (R) *</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={retail} 
                    onChange={(e) => setRetail(e.target.value)}
                    className="bg-input border-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Max Discount (%)</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={maxDiscount} 
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <Button onClick={save} disabled={!name || !retail}>
                  {selected ? 'Update' : 'Create'} Accessory
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setActiveTab('view')
                    setMmCode('')
                    setName('')
                    setDescription('')
                    setCost('')
                    setRetail('')
                    setMaxDiscount('')
                    setSelected(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Drawer open={drawerOpen} onOpenChange={(open) => setDrawerOpen(open)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Accessory Details</DrawerTitle>
            <DrawerDescription>{selected ? `${selected.name} • ${selected.mm_code || 'N/A'}` : ''}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            {selected && (
              <div className="space-y-4">
                <div><strong>MM Code:</strong> {selected.mm_code || 'N/A'}</div>
                <div><strong>Name:</strong> {selected.name}</div>
                <div><strong>Description:</strong> {selected.description || 'N/A'}</div>
                <div><strong>Cost:</strong> R{selected.cost.toFixed(2)}</div>
                <div><strong>Retail:</strong> R{selected.retail.toFixed(2)}</div>
                <div><strong>Max Discount:</strong> {selected.max_discount}%</div>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" onClick={() => handleEditFromDrawer(selected)}><Edit2 className="mr-2 h-4 w-4"/> Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(selected.id)}><Trash2 className="mr-2 h-4 w-4"/> Delete</Button>
                </div>
              </div>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
