import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const templates = [
      {
        id: 'daily-report',
        name: 'Daily Report Email',
        description: 'Send daily reports via email at a scheduled time',
        category: 'reporting',
        prompt: 'Send daily sales report email at 9 AM',
        icon: '📊',
        difficulty: 'beginner'
      },
      {
        id: 'user-onboarding',
        name: 'User Onboarding',
        description: 'Welcome new users and add them to newsletter',
        category: 'user-management',
        prompt: 'When user signs up, send welcome email and add to newsletter',
        icon: '👋',
        difficulty: 'beginner'
      },
      {
        id: 'slack-notifications',
        name: 'Slack Notifications',
        description: 'Send important updates to Slack channels',
        category: 'communication',
        prompt: 'Send Slack notification when database record is created',
        icon: '💬',
        difficulty: 'intermediate'
      },
      {
        id: 'data-backup',
        name: 'Automated Backup',
        description: 'Backup important data to Google Sheets',
        category: 'backup',
        prompt: 'Backup database to Google Sheets every night',
        icon: '💾',
        difficulty: 'intermediate'
      },
      {
        id: 'webhook-processor',
        name: 'Webhook Processor',
        description: 'Process incoming webhooks and update database',
        category: 'integration',
        prompt: 'Receive webhook and update database with the data',
        icon: '🔗',
        difficulty: 'advanced'
      },
      {
        id: 'social-media-post',
        name: 'Social Media Auto-Post',
        description: 'Automatically post content to social media',
        category: 'marketing',
        prompt: 'Post blog updates to social media when published',
        icon: '📱',
        difficulty: 'advanced'
      },
      {
        id: 'error-monitoring',
        name: 'Error Monitoring',
        description: 'Monitor application errors and send alerts',
        category: 'monitoring',
        prompt: 'Monitor application errors and send alerts to Discord',
        icon: '🚨',
        difficulty: 'intermediate'
      },
      {
        id: 'api-sync',
        name: 'API Data Sync',
        description: 'Sync data between different APIs',
        category: 'integration',
        prompt: 'Sync customer data between CRM and email service',
        icon: '🔄',
        difficulty: 'advanced'
      }
    ]

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateId } = await request.json()

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Get template details (in a real app, this would be from a database)
    const templates = {
      'daily-report': {
        name: 'Daily Report Email',
        description: 'Send daily reports via email at a scheduled time',
        prompt: 'Send daily sales report email at 9 AM'
      },
      'user-onboarding': {
        name: 'User Onboarding',
        description: 'Welcome new users and add them to newsletter',
        prompt: 'When user signs up, send welcome email and add to newsletter'
      },
      'slack-notifications': {
        name: 'Slack Notifications',
        description: 'Send important updates to Slack channels',
        prompt: 'Send Slack notification when database record is created'
      }
    }

    const template = templates[templateId as keyof typeof templates]
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Generate workflow from template prompt
    const response = await fetch('/api/workflows/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: template.prompt }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate workflow from template')
    }

    const workflow = await response.json()
    
    return NextResponse.json({
      ...workflow,
      fromTemplate: templateId
    })
  } catch (error) {
    console.error('Error creating workflow from template:', error)
    return NextResponse.json(
      { error: 'Failed to create workflow from template' },
      { status: 500 }
    )
  }
}