import { NextRequest, NextResponse } from 'next/server'
import { discordService } from '@/lib/discord'

export async function POST(request: NextRequest) {
  try {
    const { botToken, defaultChannelId } = await request.json()

    if (!botToken || !defaultChannelId) {
      return NextResponse.json(
        { error: 'Bot token and default channel ID are required' },
        { status: 400 }
      )
    }

    // Disconnect existing connection if any
    discordService.disconnect()

    // Initialize Discord service with provided config
    discordService.initialize({ botToken, defaultChannelId })

    // Test the connection
    const testResult = await discordService.testConnection()

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Discord integration configured successfully',
        botInfo: testResult.botInfo
      })
    } else {
      return NextResponse.json(
        { error: `Discord configuration failed: ${testResult.error}` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error configuring Discord:', error)
    return NextResponse.json(
      { error: 'Failed to configure Discord integration' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const config = discordService.getConfig()
    const serverInfo = discordService.isConfigured() 
      ? await discordService.getServerInfo()
      : { success: false, error: 'Not configured' }

    return NextResponse.json({
      config,
      servers: serverInfo.success ? serverInfo.servers : [],
      isConfigured: discordService.isConfigured()
    })
  } catch (error) {
    console.error('Error fetching Discord config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Discord configuration' },
      { status: 500 }
    )
  }
}