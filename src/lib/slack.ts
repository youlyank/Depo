import { WebClient } from '@slack/web-api'

export interface SlackConfig {
  botToken: string
  defaultChannel: string
}

export interface SlackMessage {
  channel?: string
  text: string
  blocks?: any[]
  thread_ts?: string
}

export class SlackService {
  private client: WebClient | null = null
  private config: SlackConfig | null = null

  constructor() {
    this.initializeFromEnv()
  }

  private initializeFromEnv() {
    const botToken = process.env.SLACK_BOT_TOKEN
    const defaultChannel = process.env.SLACK_DEFAULT_CHANNEL

    if (botToken && defaultChannel) {
      this.config = { botToken, defaultChannel }
      this.client = new WebClient(botToken)
      console.log('Slack service initialized with environment variables')
    }
  }

  // Initialize with custom config (for user-provided tokens)
  initialize(config: SlackConfig) {
    this.config = config
    this.client = new WebClient(config.botToken)
    console.log('Slack service initialized with custom config')
  }

  // Check if Slack is configured
  isConfigured(): boolean {
    return this.client !== null && this.config !== null
  }

  // Send a message to Slack
  async sendMessage(message: SlackMessage): Promise<{ success: boolean; ts?: string; error?: string }> {
    if (!this.client || !this.config) {
      return { success: false, error: 'Slack not configured' }
    }

    try {
      const channel = message.channel || this.config.defaultChannel
      
      const result = await this.client.chat.postMessage({
        channel,
        text: message.text,
        blocks: message.blocks,
        thread_ts: message.thread_ts
      })

      if (result.ok) {
        return { success: true, ts: result.ts }
      } else {
        return { success: false, error: result.error || 'Unknown error' }
      }
    } catch (error) {
      console.error('Slack API error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Send a formatted workflow notification
  async sendWorkflowNotification(
    workflowName: string, 
    status: 'success' | 'error' | 'running',
    details?: any
  ): Promise<{ success: boolean; ts?: string; error?: string }> {
    const color = status === 'success' ? 'good' : status === 'error' ? 'danger' : 'warning'
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '🔄'

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} Workflow Notification`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Workflow:*\n${workflowName}`
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${status.toUpperCase()}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Time:*\n${new Date().toLocaleString()}`
        }
      }
    ]

    if (details) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Details:*\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``
        }
      })
    }

    return this.sendMessage({
      text: `${emoji} Workflow ${workflowName}: ${status.toUpperCase()}`,
      blocks
    })
  }

  // Get channel list
  async getChannels(): Promise<{ success: boolean; channels?: any[]; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Slack not configured' }
    }

    try {
      const result = await this.client.conversations.list({
        types: 'public_channel,private_channel'
      })

      if (result.ok) {
        return { 
          success: true, 
          channels: result.channels?.map(channel => ({
            id: channel.id,
            name: channel.name,
            is_private: channel.is_private
          }))
        }
      } else {
        return { success: false, error: result.error || 'Unknown error' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; team?: string; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Slack not configured' }
    }

    try {
      const result = await this.client.auth.test()
      
      if (result.ok) {
        return { 
          success: true, 
          team: result.team || 'Unknown Team'
        }
      } else {
        return { success: false, error: result.error || 'Authentication failed' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }
    }
  }

  // Get current config (without sensitive token)
  getConfig(): { isConfigured: boolean; defaultChannel?: string } {
    return {
      isConfigured: this.isConfigured(),
      defaultChannel: this.config?.defaultChannel
    }
  }
}

// Singleton instance
export const slackService = new SlackService()