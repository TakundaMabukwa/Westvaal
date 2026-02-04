import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { WestvaalClient, ClientSummary } from '@/types/client'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get clients from proper client tables using joins
    const { data: clients, error } = await supabase
      .schema('westvaal')
      .from('client_registration')
      .select(`
        id,
        company_information!company_id (
          id,
          company_name,
          registration_number,
          vat_number
        )
      `)

    if (error) {
      console.error('Database error fetching clients:', error)
      return NextResponse.json([])
    }

    // Transform to ClientSummary format
    const clientSummaries: ClientSummary[] = clients?.map((client: any) => ({
      id: client.id,
      name: client.company_information?.company_name || '',
      registrationNumber: client.company_information?.registration_number || '',
      vatNumber: client.company_information?.vat_number || '',
      kycCompliant: false, // Default for now
      businessType: 'General', // Default for now  
      fleetSize: 0, // Default for now
    })) || []

    return NextResponse.json(clientSummaries)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const clientData = await request.json()

    // 1. Insert company information first
    const { data: company, error: companyError } = await supabase
      .schema('westvaal')
      .from('company_information')
      .insert({
        company_name: clientData.companyInformation.name,
        registration_number: clientData.companyInformation.registrationNumber,
        vat_number: clientData.companyInformation.vatNumber
      })
      .select('id')
      .single()

    if (companyError) {
      console.error('Error creating company:', companyError)
      return NextResponse.json({ error: 'Failed to create company information' }, { status: 500 })
    }

    // 2. Create client registration
    const { data: clientReg, error: clientError } = await supabase
      .schema('westvaal')
      .from('client_registration')
      .insert({
        company_id: company.id
      })
      .select('id')
      .single()

    if (clientError) {
      console.error('Error creating client registration:', clientError)
      return NextResponse.json({ error: 'Failed to create client registration' }, { status: 500 })
    }

    // 3. Create contact details if provided
    if (clientData.contactDetails && clientData.contactDetails.length > 0) {
      const contact = clientData.contactDetails[0]
      const { error: contactError } = await supabase
        .schema('westvaal')
        .from('contact_details')
        .insert({
          first_name: contact.primaryContactName?.split(' ')[0] || '',
          surname: contact.primaryContactName?.split(' ').slice(1).join(' ') || '',
          primary_contact_number: contact.primaryContactPhone || '',
          email_address: contact.primaryContactEmail || ''
        })

      if (contactError) {
        console.warn('Warning: Failed to create contact details:', contactError)
      }
    }

    return NextResponse.json({ 
      message: 'Client created successfully', 
      clientId: clientReg.id 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}