import nodemailer from 'nodemailer'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from?: string
}

export interface EmailMessage {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: any[]
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig | null = null

  constructor() {
    this.initializeFromEnv()
  }

  private initializeFromEnv() {
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587')
    const secure = process.env.SMTP_SECURE === 'true'
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = process.env.SMTP_FROM

    if (host && user && pass) {
      this.config = { host, port, secure, auth: { user, pass }, from }
      this.initialize()
    }
  }

  // Initialize with custom config
  initialize(config?: EmailConfig) {
    if (config) {
      this.config = config
    }

    if (!this.config) {
      throw new Error('Email configuration is required')
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      })

      console.log('Email service initialized')
    } catch (error) {
      console.error('Failed to initialize email service:', error)
      throw error
    }
  }

  // Check if service is configured
  isConfigured(): boolean {
    return this.transporter !== null && this.config !== null
  }

  // Send email
  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter || !this.config) {
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const mailOptions = {
        from: message.from || this.config.from || this.config.auth.user,
        to: message.to,
        cc: message.cc,
        bcc: message.bcc,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments
      }

      const result = await this.transporter.sendMail(mailOptions)

      return { 
        success: true, 
        messageId: result.messageId 
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Send workflow notification email
  async sendWorkflowNotification(
    workflowName: string,
    status: 'success' | 'error' | 'running',
    details?: any,
    recipients?: string | string[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const statusColor = status === 'success' ? '#28a745' : status === 'error' ? '#dc3545' : '#ffc107'
    const statusEmoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '🔄'

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">
            ${statusEmoji} Workflow Notification
          </h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid ${statusColor};">
          <h2 style="color: #333; margin-top: 0;">Workflow: ${workflowName}</h2>
          <p style="color: #666; margin-bottom: 20px;">
            <strong>Status:</strong> 
            <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">
              ${status}
            </span>
          </p>
          <p style="color: #666; margin-bottom: 20px;">
            <strong>Time:</strong> ${new Date().toLocaleString()}
          </p>
          
          ${details ? `
          <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <h3 style="color: #333; margin-top: 0;">Details:</h3>
            <pre style="background: #f1f3f4; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px;">
${JSON.stringify(details, null, 2)}
            </pre>
          </div>
          ` : ''}
        </div>
        
        <div style="background: #343a40; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            Sent from <strong>AI Workflow Builder</strong>
          </p>
          <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.8;">
            Automated workflow notification system
          </p>
        </div>
      </div>
    `

    const text = `
Workflow Notification
===================

Workflow: ${workflowName}
Status: ${status.toUpperCase()}
Time: ${new Date().toLocaleString()}

${details ? `Details:\n${JSON.stringify(details, null, 2)}` : ''}

---
Sent from AI Workflow Builder
Automated workflow notification system
    `

    return this.sendEmail({
      to: recipients || this.config?.auth.user || '',
      subject: `${statusEmoji} Workflow ${workflowName}: ${status.toUpperCase()}`,
      html,
      text
    })
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' }
    }

    try {
      await this.transporter.verify()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      }
    }
  }

  // Get current config (without sensitive data)
  getConfig(): { isConfigured: boolean; host?: string; port?: number; secure?: boolean; from?: string } {
    return {
      isConfigured: this.isConfigured(),
      host: this.config?.host,
      port: this.config?.port,
      secure: this.config?.secure,
      from: this.config?.from
    }
  }

  // Get popular SMTP providers presets
  static getProviderPresets(): Record<string, Partial<EmailConfig>> {
    return {
      gmail: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false
      },
      outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false
      },
      yahoo: {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false
      },
      sendgrid: {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false
      },
      mailgun: {
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false
      }
    }
  }
}

// Singleton instance
export const emailService = new EmailService()