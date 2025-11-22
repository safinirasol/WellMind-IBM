import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { employeeId, employeeName, employeeEmail } = await req.json()

    if (!employeeEmail) {
      return NextResponse.json({ error: 'Employee email is required' }, { status: 400 })
    }

    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vortex.wellmind@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    })

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">VorteX Wellness Advisory</h2>
        <p>Dear ${employeeName},</p>
        <p>Our wellness monitoring system has detected signs of potential burnout risk.</p>
        <p>We care about your wellbeing and want to ensure you have the support you need.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Recommended Actions:</h3>
          <ul>
            <li>Consider taking regular breaks during work hours</li>
            <li>Utilize your paid time off</li>
            <li>Reach out to HR or your manager to discuss workload</li>
            <li>Explore our employee assistance program</li>
          </ul>
        </div>
        
        <p>Please don't hesitate to contact HR if you'd like to discuss this further.</p>
        <br>
        <p>Best regards,<br>VorteX Wellness Team</p>
      </div>
    `

    await transporter.sendMail({
      from: '"VorteX Wellness" <vortex.wellmind@gmail.com>',
      to: employeeEmail,
      subject: 'Wellness Check: Burnout Risk Advisory',
      html: emailHTML,
    })

    console.log(`[EMAIL] Sent burnout advisory to ${employeeName} (${employeeEmail})`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Wellness email sent to ${employeeName}` 
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}