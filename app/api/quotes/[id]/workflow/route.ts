import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { QuoteWorkflowStages, OrderStatus } from '@/types/quote'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { stage, data }: { stage: keyof QuoteWorkflowStages, data: any } = await request.json()
    
    const { id: quoteId } = await params

    // Get current quote
    const { data: currentQuote, error: fetchError } = await supabase
      .schema('westvaal')
      .from('quote_json')
      .select('json')
      .eq('id', quoteId)
      .single()

    if (fetchError || !currentQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Parse current quote data
    const quoteData = JSON.parse(currentQuote.json)
    
    // Initialize workflow stages if not exists
    if (!quoteData.workflowStages) {
      quoteData.workflowStages = {}
    }

    // Update the specific stage
    quoteData.workflowStages[stage] = {
      ...quoteData.workflowStages[stage],
      ...data,
      completed: data.completed || false,
      skipped: data.skipped || false
    }

    // Update quote status based on workflow progress
    if (stage === 'approveQuote' && data.completed) {
      quoteData.status = OrderStatus.AWAITING_DELIVERY // Move to awaiting delivery after approval
    } else if (stage === 'preDeliveryJobCard' && data.completed) {
      quoteData.status = OrderStatus.PRE_DELIVERY_INSPECTION // Pre-Delivery Inspection
    } else if (stage === 'applyForFinance' && data.completed) {
      quoteData.status = OrderStatus.AWAITING_BANK // Awaiting Bank
    } else if (stage === 'waitingForStock' && data.completed) {
      quoteData.status = OrderStatus.AWAITING_DELIVERY // Keep in awaiting delivery
    } else if (stage === 'licenseAndReg' && data.completed) {
      quoteData.status = OrderStatus.PRE_DELIVERY_INSPECTION // Keep in pre-delivery inspection
    }

    // Check if all required stages are completed (waitingForStock is optional and can be skipped)
    const allStagesCompleted = quoteData.workflowStages.preDeliveryJobCard?.completed &&
                              quoteData.workflowStages.applyForFinance?.completed &&
                              (quoteData.workflowStages.waitingForStock?.completed || quoteData.workflowStages.waitingForStock?.skipped) &&
                              quoteData.workflowStages.licenseAndReg?.completed

    if (allStagesCompleted) {
      quoteData.status = OrderStatus.COMPLETED
    }

    // Update in database
    const { error: updateError } = await supabase
      .schema('westvaal')
      .from('quote_json')
      .update({ 
        json: JSON.stringify(quoteData)
      })
      .eq('id', quoteId)

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json({ error: 'Failed to update quote workflow' }, { status: 500 })
    }

    // Save workflow data to quote_workflow_data table
    const workflowDataToSave: any = {
      quote_id: quoteId,
      stage_key: stage,
      completed_at: data.completed ? new Date().toISOString() : null
    }

    // Map stage-specific data
    if (stage === 'approveQuote') {
      workflowDataToSave.approved_by = data.approvedBy || null
      workflowDataToSave.approved_at = data.completed ? new Date().toISOString() : null
    } else if (stage === 'applyForFinance') {
      workflowDataToSave.bank_reference_number = data.bankReferenceNumber || null
    } else if (stage === 'preDeliveryJobCard') {
      workflowDataToSave.job_card_url = data.documentUrl || null
    } else if (stage === 'waitingForStock') {
      workflowDataToSave.expected_delivery_date = data.expectedDate || null
      workflowDataToSave.oem_reference = data.oemReference || null
    } else if (stage === 'licenseAndReg') {
      workflowDataToSave.license_plate = data.licensePlate || null
      workflowDataToSave.registration_number = data.registrationNumber || null
      workflowDataToSave.registration_doc_url = data.documentUrl || null
    }

    // Always save notes if provided
    if (data.notes) {
      workflowDataToSave.notes = data.notes
    }

    // Upsert workflow data (insert or update if already exists)
    const { error: workflowError } = await supabase
      .schema('westvaal')
      .from('quote_workflow_data')
      .upsert(workflowDataToSave, {
        onConflict: 'quote_id,stage_key'
      })

    if (workflowError) {
      console.error('Workflow data save error:', workflowError)
      // Don't fail the request if workflow data save fails, just log it
    }

    return NextResponse.json({ 
      message: `${stage} updated successfully`,
      quote: {
        ...quoteData,
        id: quoteId
      }
    })

  } catch (error) {
    console.error('Error updating quote workflow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
