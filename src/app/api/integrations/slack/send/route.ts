import { NextRequest, NextResponse } from 'next/server'
import { slackService } from '@/lib/slack'

export async function POST(request: NextRequest) {
  try {
    const { channel, message, workflowName, status, details } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!slackService.isConfigured()) {
      return NextResponse.json(
        { error: 'Slack is not configured. Please set up Slack integration first.' },
        { status: 400 }
      )
    }

    let result

    if (workflowName && status) {
      // Send workflow notification
      result = await slackService.sendWorkflowNotification(
        workflowName, 
        status, 
        details
      )
    } else {
      // Send custom message
      result = await slackService.sendMessage({
        channel,
        text: message
      })
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        timestamp: result.ts
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending Slack message:', error)
    return NextResponse.json(
      { error: 'Failed to send Slack message' },
      { status: 500 }
    )
  }
}