import { NextRequest, NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientEmail, privateKey, spreadsheetId } = await request.json()

    if (!clientId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Client ID, client email, and private key are required' },
        { status: 400 }
      )
    }

    // Initialize Google Sheets service with provided config
    googleSheetsService.initialize({ clientId, clientEmail, privateKey, spreadsheetId })

    // Test the connection
    const testResult = await googleSheetsService.testConnection(spreadsheetId)

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Google Sheets integration configured successfully',
        info: testResult.info
      })
    } else {
      return NextResponse.json(
        { error: `Google Sheets configuration failed: ${testResult.error}` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error configuring Google Sheets:', error)
    return NextResponse.json(
      { error: 'Failed to configure Google Sheets integration' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const config = googleSheetsService.getConfig()
    
    return NextResponse.json({
      config,
      isConfigured: googleSheetsService.isConfigured()
    })
  } catch (error) {
    console.error('Error fetching Google Sheets config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Sheets configuration' },
      { status: 500 }
    )
  }
}