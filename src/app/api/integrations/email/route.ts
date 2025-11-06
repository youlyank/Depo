import { NextRequest, NextResponse } from 'next/server'
import { emailService, EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { host, port, secure, user, pass, from } = await request.json()

    if (!host || !port || !user || !pass) {
      return NextResponse.json(
        { error: 'Host, port, user, and password are required' },
        { status: 400 }
      )
    }

    // Initialize email service with provided config
    emailService.initialize({ host, port, secure, auth: { user, pass }, from })

    // Test the connection
    const testResult = await emailService.testConnection()

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Email integration configured successfully'
      })
    } else {
      return NextResponse.json(
        { error: `Email configuration failed: ${testResult.error}` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error configuring email:', error)
    return NextResponse.json(
      { error: 'Failed to configure email integration' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const config = emailService.getConfig()
    const presets = EmailService.getProviderPresets()

    return NextResponse.json({
      config,
      presets,
      isConfigured: emailService.isConfigured()
    })
  } catch (error) {
    console.error('Error fetching email config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email configuration' },
      { status: 500 }
    )
  }
}