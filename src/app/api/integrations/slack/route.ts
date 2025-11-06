import { NextRequest, NextResponse } from 'next/server'
import { slackService } from '@/lib/slack'

export async function POST(request: NextRequest) {
  try {
    const { botToken, defaultChannel } = await request.json()

    if (!botToken || !defaultChannel) {
      return NextResponse.json(
        { error: 'Bot token and default channel are required' },
        { status: 400 }
      )
    }

    // Initialize Slack service with provided config
    slackService.initialize({ botToken, defaultChannel })

    // Test the connection
    const testResult = await slackService.testConnection()

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Slack integration configured successfully',
        team: testResult.team
      })
    } else {
      return NextResponse.json(
        { error: `Slack configuration failed: ${testResult.error}` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error configuring Slack:', error)
    return NextResponse.json(
      { error: 'Failed to configure Slack integration' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const config = slackService.getConfig()
    const channels = slackService.isConfigured() 
      ? await slackService.getChannels()
      : { success: false, error: 'Not configured' }

    return NextResponse.json({
      config,
      channels: channels.success ? channels.channels : [],
      isConfigured: slackService.isConfigured()
    })
  } catch (error) {
    console.error('Error fetching Slack config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Slack configuration' },
      { status: 500 }
    )
  }
}