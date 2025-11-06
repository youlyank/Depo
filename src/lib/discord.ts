import { Client, GatewayIntentBits, TextChannel } from 'discord.js'

export interface DiscordConfig {
  botToken: string
  defaultChannelId: string
}

export interface DiscordMessage {
  content?: string
  embeds?: any[]
  username?: string
  avatarURL?: string
}

export class DiscordService {
  private client: Client | null = null
  private config: DiscordConfig | null = null
  private isReady: boolean = false

  constructor() {
    this.initializeFromEnv()
  }

  private initializeFromEnv() {
    const botToken = process.env.DISCORD_BOT_TOKEN
    const defaultChannelId = process.env.DISCORD_DEFAULT_CHANNEL_ID

    if (botToken && defaultChannelId) {
      this.config = { botToken, defaultChannelId }
      this.initialize()
    }
  }

  // Initialize with custom config
  initialize(config?: DiscordConfig) {
    if (config) {
      this.config = config
    }

    if (!this.config) {
      throw new Error('Discord configuration is required')
    }

    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ]
      })

      this.client.once('ready', () => {
        console.log(`Discord bot logged in as ${this.client?.user?.tag}`)
        this.isReady = true
      })

      this.client.on('error', (error) => {
        console.error('Discord client error:', error)
      })

      this.client.login(this.config.botToken)
    } catch (error) {
      console.error('Failed to initialize Discord:', error)
      throw error
    }
  }

  // Check if service is configured and ready
  isConfigured(): boolean {
    return this.client !== null && this.config !== null && this.isReady
  }

  // Wait for bot to be ready
  async waitForReady(): Promise<void> {
    if (!this.client) {
      throw new Error('Discord client not initialized')
    }

    if (this.isReady) {
      return
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Discord bot ready timeout'))
      }, 10000)

      this.client!.once('ready', () => {
        clearTimeout(timeout)
        resolve()
      })

      this.client!.once('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    })
  }

  // Send message to Discord channel
  async sendMessage(
    channelId: string,
    message: DiscordMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Discord not configured or not ready' }
    }

    try {
      await this.waitForReady()
      
      const channel = await this.client!.channels.fetch(channelId)
      
      if (!channel || !channel.isTextBased()) {
        return { success: false, error: 'Invalid channel or channel not found' }
      }

      const textChannel = channel as TextChannel
      const sentMessage = await textChannel.send(message)

      return { 
        success: true, 
        messageId: sentMessage.id 
      }
    } catch (error) {
      console.error('Error sending Discord message:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Send workflow notification
  async sendWorkflowNotification(
    workflowName: string,
    status: 'success' | 'error' | 'running',
    details?: any,
    channelId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const color = status === 'success' ? 0x00ff00 : status === 'error' ? 0xff0000 : 0xffff00
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '🔄'

    const embed = {
      title: `${emoji} Workflow Notification`,
      color: color,
      fields: [
        {
          name: 'Workflow',
          value: workflowName,
          inline: true
        },
        {
          name: 'Status',
          value: status.toUpperCase(),
          inline: true
        },
        {
          name: 'Time',
          value: new Date().toLocaleString(),
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    }

    if (details) {
      embed.fields.push({
        name: 'Details',
        value: `\`\`\`${JSON.stringify(details, null, 2).substring(0, 1000)}\`\`\``,
        inline: false
      })
    }

    return this.sendMessage(
      channelId || this.config!.defaultChannelId,
      {
        embeds: [embed],
        username: 'AI Workflow Builder',
        avatarURL: 'https://cdn.discordapp.com/embed/avatars/0.png'
      }
    )
  }

  // Get server information
  async getServerInfo(): Promise<{ success: boolean; servers?: any[]; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Discord not configured' }
    }

    try {
      await this.waitForReady()
      
      const servers = this.client!.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
        icon: guild.iconURL(),
        channels: guild.channels.cache
          .filter(channel => channel.isTextBased())
          .map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type
          }))
      }))

      return { success: true, servers }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get server info' 
      }
    }
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; botInfo?: any; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Discord not configured' }
    }

    try {
      await this.waitForReady()
      
      const botInfo = {
        username: this.client.user?.username,
        id: this.client.user?.id,
        tag: this.client.user?.tag,
        servers: this.client.guilds.cache.size
      }

      return { success: true, botInfo }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }
    }
  }

  // Get current config (without sensitive token)
  getConfig(): { isConfigured: boolean; isReady: boolean; defaultChannelId?: string } {
    return {
      isConfigured: this.client !== null && this.config !== null,
      isReady: this.isReady,
      defaultChannelId: this.config?.defaultChannelId
    }
  }

  // Disconnect bot
  disconnect(): void {
    if (this.client) {
      this.client.destroy()
      this.client = null
      this.config = null
      this.isReady = false
    }
  }
}

// Singleton instance
export const discordService = new DiscordService()