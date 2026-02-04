import { NextRequest, NextResponse } from 'next/server'
import { WestvaalQuote } from '@/types/quote'

// POST - Generate PDF preview
export async function POST(request: NextRequest) {
  try {
    const quote: WestvaalQuote = await request.json()
    
    // Generate HTML for the quote
    const html = generateQuoteHtml(quote)
    
    // For now, return HTML (you can add PDF generation later with puppeteer)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
    
    // TODO: Add PDF generation with puppeteer
    // const browser = await puppeteer.launch()
    // const page = await browser.newPage()
    // await page.setContent(html)
    // const pdf = await page.pdf({ format: 'A4' })
    // await browser.close()
    // 
    // return new NextResponse(pdf, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': 'attachment; filename="quote.pdf"'
    //   },
    // })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate quote preview' }, { status: 500 })
  }
}

// Basic HTML template generator (port from C# TemplateGenerator later)
function generateQuoteHtml(quote: WestvaalQuote): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>WestVaal Quote</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .customer-details { margin-bottom: 20px; }
            .parts-table { width: 100%; border-collapse: collapse; }
            .parts-table th, .parts-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .parts-table th { background-color: #f2f2f2; }
            .total { text-align: right; margin-top: 20px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>WestVaal Vehicle Quote</h1>
            <p>Status: ${quote.status}</p>
        </div>
        
        <div class="customer-details">
            <h3>Customer Details</h3>
            <p><strong>Quote To:</strong> ${quote.customerDetails.quoteTo}</p>
            <p><strong>Company:</strong> ${quote.customerDetails.companyName}</p>
            <p><strong>Email:</strong> ${quote.customerDetails.emailAddress}</p>
            <p><strong>Contact:</strong> ${quote.customerDetails.contactNumber}</p>
        </div>
        
        <div class="parts-section">
            <h3>Quoted Items</h3>
            <table class="parts-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Make/Model</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.parts.map(part => `
                        <tr>
                            <td>${part.product.name}</td>
                            <td>${part.product.basicVehicleInformation.make} ${part.product.basicVehicleInformation.model}</td>
                            <td>${part.quantity}</td>
                            <td>R ${part.masterPrice.toFixed(2)}</td>
                            <td>${part.masterDiscount}%</td>
                            <td>R ${(part.price * part.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="total">
            <p>Total Amount: R ${quote.parts.reduce((sum, part) => sum + (part.price * part.quantity), 0).toFixed(2)}</p>
        </div>
        
        ${quote.bankRef ? `<p><strong>Bank Reference:</strong> ${quote.bankRef}</p>` : ''}
    </body>
    </html>
  `
}