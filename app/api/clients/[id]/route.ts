import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Get client details with company information and contacts
    const { data: client, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error || !client) {
      console.error('Database error fetching client:', error)
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get contact details for this client
    const { data: contacts } = await supabase
      .schema('westvaal')
      .from('contact_details')
      .select('*')
      .limit(1)
      .single()

    // Transform to a usable format
    const clientDetails = {
      id: client.id,
      companyName: client.company_information?.company_name || '',
      registrationNumber: client.company_information?.registration_number || '',
      vatNumber: client.company_information?.vat_number || '',
      kycCompliant: false, // Default value since column doesn't exist in schema
      contactPerson: contacts ? `${contacts.first_name} ${contacts.surname}`.trim() : '',
      email: contacts?.email_address || '',
      phone: contacts?.primary_contact_number || ''
    }

    return NextResponse.json(clientDetails)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
