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
  const escapeHtml = (value?: string) =>
    (value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const formatCurrency = (value: number) => `R ${value.toFixed(2)}`
  const vatRate = 0.15

  const primaryPart = quote.parts?.[0]
  const vehicleInfo = primaryPart?.product?.basicVehicleInformation
  const vehicleName = primaryPart?.product?.name || ''
  const mmCode = primaryPart?.product?.mmCode || ''
  const modelCode = primaryPart?.product?.basicVehicleInformation?.mmCode || ''

  const accessories = quote.parts?.flatMap(p => p.accessories || []) || []

  const vehicleTotalIncl = quote.parts.reduce((sum, part) => {
    return sum + (part.price || 0) * (part.quantity || 1)
  }, 0)
  const vehicleMasterIncl = quote.parts.reduce((sum, part) => {
    return sum + (part.masterPrice || 0) * (part.quantity || 1)
  }, 0)
  const vehicleDiscountIncl = Math.max(0, vehicleMasterIncl - vehicleTotalIncl)

  const accessoriesTotalIncl = accessories.reduce((sum, acc) => {
    return sum + (acc.price || 0) * (acc.quantity || 1)
  }, 0)
  const accessoriesMasterIncl = accessories.reduce((sum, acc) => {
    return sum + (acc.masterPrice || 0) * (acc.quantity || 1)
  }, 0)
  const accessoriesDiscountIncl = Math.max(0, accessoriesMasterIncl - accessoriesTotalIncl)

  const retailTotalIncl = vehicleTotalIncl + accessoriesTotalIncl
  const retailTotalExcl = retailTotalIncl / (1 + vatRate)
  const totalDiscountIncl = vehicleDiscountIncl + accessoriesDiscountIncl
  const totalDiscountExcl = totalDiscountIncl / (1 + vatRate)

  const subTotalExcl = Math.max(0, retailTotalExcl - totalDiscountExcl)
  const accessoriesExcl = accessoriesTotalIncl / (1 + vatRate)
  const vatAmount = (subTotalExcl + accessoriesExcl) * vatRate
  const subTotalIncl = subTotalExcl + accessoriesExcl + vatAmount

  const tradeInOffset = quote.tradeIn?.depositTowardsPurchase || 0
  const netAfterTradeIn = subTotalIncl - tradeInOffset
  const tradeIn = quote.tradeIn

  const logoUrl = "https://d2638j3z8ek976.cloudfront.net/6162db9520beba39059972d5701f03b46326924c/1770053796/images/logo-white.png"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Westvaal Sales Estimate</title>
      <style>
        @page { size: A4; margin: 16mm; }
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #111; margin: 0; }
        .page { padding: 12mm; }
        .header { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: start; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 10px; }
        .title { font-weight: 700; font-size: 14px; }
        .sub { font-size: 10px; color: #333; line-height: 1.4; }
        .logo { text-align: right; }
        .logo img { height: 40px; }
        .grid { display: grid; gap: 10px; }
        .grid.two { grid-template-columns: 1fr 1fr; }
        .box { border: 2px solid #111; border-radius: 10px; padding: 10px; }
        .section-title { font-size: 11px; font-weight: 700; margin-bottom: 6px; text-transform: none; }
        .row { display: grid; grid-template-columns: 1fr auto; gap: 8px; font-size: 10.5px; padding: 2px 0; }
        .label { color: #444; }
        .value { font-weight: 600; text-align: right; }
        .vehicle-img { width: 100%; height: 150px; object-fit: contain; border: 1px solid #999; margin-top: 8px; }
        .table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
        .table th, .table td { border-bottom: 1px solid #ddd; padding: 6px 4px; text-align: left; }
        .table th { background: #f2f2f2; font-weight: 700; }
        .totals .row.total { font-weight: 700; border-top: 1px solid #111; padding-top: 6px; margin-top: 6px; }
        .signature-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 14px; }
        .signature { border-top: 1px solid #111; font-size: 10px; padding-top: 4px; }
        .footer { margin-top: 8px; font-size: 9.5px; color: #555; }
        .thin-divider { height: 1px; background: #111; margin: 6px 0; }
        .muted { color: #666; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div>
            <div class="title">Sales Estimate</div>
            <div class="sub">Westvaal Motor Group (Pty) Ltd</div>
            <div class="sub">Quote Date: ${new Date().toLocaleDateString()}</div>
            <div class="sub">Quote No: ${escapeHtml(String(quote.id ?? 'N/A'))}</div>
          </div>
          <div class="logo"><img src="${logoUrl}" alt="Westvaal" /></div>
        </div>

        <div class="grid two">
          <div class="box">
            <div class="section-title">Client Details</div>
            <div class="row"><span class="label">Client Name</span><span class="value">${escapeHtml(quote.customerDetails.companyName || quote.customerDetails.quoteTo)}</span></div>
            <div class="row"><span class="label">Contact</span><span class="value">${escapeHtml(quote.customerDetails.contactNumber || '')}</span></div>
            <div class="row"><span class="label">Email</span><span class="value">${escapeHtml(quote.customerDetails.emailAddress || '')}</span></div>
          </div>
          <div class="box">
            <div class="section-title">Financial Details</div>
            <div class="totals">
              <div class="row"><span class="label">Retail Price Excl. VAT</span><span class="value">${formatCurrency(retailTotalExcl)}</span></div>
              <div class="row"><span class="label">Discount</span><span class="value">-${formatCurrency(totalDiscountExcl)}</span></div>
              <div class="row"><span class="label">Sub Total Excl. VAT</span><span class="value">${formatCurrency(subTotalExcl)}</span></div>
              <div class="row"><span class="label">Accessories</span><span class="value">${formatCurrency(accessoriesTotalIncl)}</span></div>
              <div class="row"><span class="label">VAT</span><span class="value">${formatCurrency(vatAmount)}</span></div>
              <div class="row"><span class="label">Sub Total</span><span class="value">${formatCurrency(subTotalIncl)}</span></div>
              <div class="row"><span class="label">Nett. Trade-In</span><span class="value">-${formatCurrency(tradeInOffset)}</span></div>
              <div class="row total"><span class="label">Total</span><span class="value">${formatCurrency(netAfterTradeIn)}</span></div>
            </div>
          </div>
        </div>

        <div class="grid two" style="margin-top:10px;">
          <div class="box">
            <div class="section-title">Vehicle Details</div>
            <div class="row"><span class="label">Vehicle</span><span class="value">${escapeHtml(vehicleName)}</span></div>
            <div class="row"><span class="label">Make/Model</span><span class="value">${escapeHtml(`${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''}`.trim())}</span></div>
            <div class="row"><span class="label">MM Code</span><span class="value">${escapeHtml(mmCode)}</span></div>
            <div class="row"><span class="label">Model Code</span><span class="value">${escapeHtml(modelCode)}</span></div>
            <img class="vehicle-img" src="https://via.placeholder.com/480x220?text=Vehicle+Image" alt="Vehicle"/>
          </div>
          <div class="box">
            <div class="section-title">Accessories</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Accessory</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${accessories.length > 0 ? accessories.map(acc => `
                  <tr>
                    <td>${escapeHtml(acc.product?.name || '')}</td>
                    <td>${acc.quantity || 1}</td>
                    <td>${formatCurrency((acc.price || 0) * (acc.quantity || 1))}</td>
                  </tr>
                `).join('') : `<tr><td colspan="3">No accessories</td></tr>`}
              </tbody>
            </table>
            <div class="section-title" style="margin-top:10px;">Value Added Products</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colspan="3">No value added products</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        ${tradeIn ? `
          <div class="box" style="margin-top:10px;">
            <div class="section-title">Trade-In Summary</div>
            <div class="grid two">
              <div class="row"><span class="label">Trade-In Price</span><span class="value">${formatCurrency(tradeIn.tradeInPrice || 0)}</span></div>
              <div class="row"><span class="label">Settlement</span><span class="value">${formatCurrency(tradeIn.settlement || 0)}</span></div>
              <div class="row"><span class="label">Deposit</span><span class="value">${formatCurrency(tradeIn.deposit || 0)}</span></div>
              <div class="row"><span class="label">Cashback</span><span class="value">${formatCurrency(tradeIn.cashback || 0)}</span></div>
              <div class="row"><span class="label">Deposit Towards Purchase</span><span class="value">${formatCurrency(tradeIn.depositTowardsPurchase || 0)}</span></div>
              <div class="row"><span class="label">Nett Balance</span><span class="value">${formatCurrency(tradeIn.offer?.nettBalance || 0)}</span></div>
            </div>
          </div>
        ` : ''}

        <div class="signature-row">
          <div class="signature">Signature Sales Representative</div>
          <div class="signature">Signature Sales Manager</div>
          <div class="signature">Purchaser</div>
        </div>
        <div class="footer">
          Estimate is a non-binding purchase option. Valid for 7 days. Prices subject to OEM price changes and stock availability.
        </div>
      </div>
    </body>
    </html>
  `
}
