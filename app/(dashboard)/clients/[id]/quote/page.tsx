"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { EditClientWizard } from "@/components/quote-wizard/edit-client-wizard"
import { WestvaalQuote, DtoCustomerDetails } from "@/types/quote"
import { toast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ClientQuotePage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const [loading, setLoading] = useState(true)
  const [clientData, setClientData] = useState<any>(null)
  const [quote, setQuote] = useState<Partial<WestvaalQuote> | null>(null)

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const fetchClientData = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`)
      
      if (response.ok) {
        const data = await response.json()
        setClientData(data)
        
        // Pre-fill the quote with client data
        const initialQuote: Partial<WestvaalQuote> = {
          parts: [],
          customerDetails: {
            quoteTo: data.contactPerson || '',
            companyName: data.companyName || '',
            emailAddress: data.email || '',
            contactNumber: data.phone || ''
          },
          email: {
            to: data.email || '',
            subject: `Quote for ${data.companyName}`,
            body: ''
          },
          status: 'new_orders' as any
        }
        
        setQuote(initialQuote)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch client details",
          variant: "destructive"
        })
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error fetching client:', error)
      toast({
        title: "Error",
        description: "Failed to fetch client details",
        variant: "destructive"
      })
      router.push('/clients')
    } finally {
      setLoading(false)
    }
  }

  const handleQuoteChange = (updatedQuote: Partial<WestvaalQuote>) => {
    setQuote(updatedQuote)
  }

  const handleSubmit = async () => {
    if (!quote || !quote.parts || quote.parts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one vehicle to the quote",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quote)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Quote created successfully"
        })
        router.push('/quoting')
      } else {
        toast({
          title: "Error",
          description: "Failed to create quote",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating quote:', error)
      toast({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading client details...</p>
      </div>
    )
  }

  if (!quote) {
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Quote</h1>
        <p className="text-muted-foreground">
          Creating a new quote for {clientData?.companyName}
        </p>
      </div>

      <EditClientWizard
        initialData={quote}
        onChange={handleQuoteChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
