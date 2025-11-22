export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { riskFilter, format } = await req.json()

    // Fetch dashboard data
    const dashRes = await fetch('http://localhost:3000/api/dashboard', { cache: 'no-store' })
    const dashboardData = await dashRes.json()

    // Fetch filtered employees
    const empRes = await fetch('http://localhost:3000/api/employees', { cache: 'no-store' })
    const employees = await empRes.json()

    const filteredEmployees = riskFilter
      ? employees.filter((e: any) => e.latest_risk_label === riskFilter)
      : employees

    // Generate a simple HTML report (you can upgrade to PDF with libraries like pdfkit)
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Burnout Risk Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1f2937; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .card { background: #f3f4f6; padding: 15px; border-radius: 8px; }
          .card h3 { margin: 0 0 10px 0; color: #6b7280; }
          .card .value { font-size: 24px; font-weight: bold; color: #1f2937; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: bold; }
          .high { color: #dc2626; }
          .medium { color: #f59e0b; }
          .low { color: #059669; }
        </style>
      </head>
      <body>
        <h1>Employee Burnout Risk Report</h1>
        <p>Generated: ${new Date().toLocaleDateString()}</p>

        <div class="summary">
          <div class="card">
            <h3>Total Employees</h3>
            <div class="value">${dashboardData?.summary?.total_employees ?? 0}</div>
          </div>
          <div class="card">
            <h3>Surveys Submitted</h3>
            <div class="value">${dashboardData?.summary?.total_surveys ?? 0}</div>
          </div>
          <div class="card">
            <h3>High Risk</h3>
            <div class="value high">${dashboardData?.summary?.high_risk_count ?? 0}</div>
          </div>
          <div class="card">
            <h3>Avg Risk Score</h3>
            <div class="value">${dashboardData?.summary?.average_risk ?? 0}</div>
          </div>
        </div>

        <h2>Risk Distribution</h2>
        <div class="summary">
          <div class="card">
            <h3>High Risk</h3>
            <div class="value high">${dashboardData?.summary?.high_risk_count ?? 0}</div>
          </div>
          <div class="card">
            <h3>Medium Risk</h3>
            <div class="value medium">${dashboardData?.summary?.medium_risk_count ?? 0}</div>
          </div>
          <div class="card">
            <h3>Low Risk</h3>
            <div class="value low">${dashboardData?.summary?.low_risk_count ?? 0}</div>
          </div>
        </div>

        <h2>Department Overview</h2>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Surveys</th>
              <th>Avg Risk Score</th>
            </tr>
          </thead>
          <tbody>
            ${dashboardData?.departments?.map((dept: any) => `
              <tr>
                <td>${dept.department}</td>
                <td>${dept.count}</td>
                <td>${dept.avg_risk}</td>
              </tr>
            `).join('') ?? ''}
          </tbody>
        </table>

        <h2>Filtered Employees (${filteredEmployees.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Risk Status</th>
              <th>Risk Score</th>
              <th>Last Submission</th>
            </tr>
          </thead>
          <tbody>
            ${filteredEmployees.map((emp: any) => `
              <tr>
                <td>${emp.name}</td>
                <td>${emp.department}</td>
                <td>${emp.email}</td>
                <td class="${emp.latest_risk_label?.toLowerCase()}">${emp.latest_risk_label}</td>
                <td>${emp.latest_risk_score ?? 'N/A'}</td>
                <td>${emp.last_submission ? new Date(emp.last_submission).toLocaleDateString() : 'Never'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    // If preview=true is passed, return the HTML inline so the browser can render it.
    // This allows the user to Print → Save as PDF from the browser without installing
    // server-side PDF tooling. Example: `/api/employees/export-report?preview=true`
    const reqUrl = new URL(req.url)
    const preview = reqUrl.searchParams.get('preview') === 'true'
    // Also accept `format: 'pdf'` in the POST JSON body or `?format=pdf` to generate PDF server-side

    // `format` is read from the POST JSON above (if present)

    if (preview) {
      return new NextResponse(reportHTML, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    // If PDF requested, try to dynamically import puppeteer and generate a PDF.
    const wantPdf = (format === 'pdf') || reqUrl.searchParams.get('format') === 'pdf'

    if (wantPdf) {
      try {
        const puppeteer = await import('puppeteer')

        const launchArgs: string[] = []
        // On many Linux hosts Chromium needs these flags
        launchArgs.push('--no-sandbox', '--disable-setuid-sandbox')

        const browser = await puppeteer.launch({ args: launchArgs, headless: 'new' as any })
        const page = await browser.newPage()
        await page.setContent(reportHTML, { waitUntil: 'networkidle0' })
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
        await browser.close()

        // Ensure we return a Node Buffer/ArrayBuffer for NextResponse
        const outBuffer = Buffer.from(pdfBuffer)

        return new NextResponse(outBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="burnout-report-${new Date().toISOString().split('T')[0]}.pdf"`,
          },
        })
      } catch (err: any) {
        console.error('PDF generation failed:', err)
        // Fall back to HTML download with an error notice so the client doesn't hang
        const errorHtml = `<!-- PDF generation failed: ${String(err?.message ?? err)} -->\n${reportHTML}`
        return new NextResponse(errorHtml, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `attachment; filename="burnout-report-${new Date().toISOString().split('T')[0]}.html"`,
          },
        })
      }
    }

    // Default: return as a downloadable .html attachment
    return new NextResponse(reportHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="burnout-report-${new Date().toISOString().split('T')[0]}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
