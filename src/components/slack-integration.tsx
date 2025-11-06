'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Key,
  Hash,
  TestTube,
  Info,
  ExternalLink
} from 'lucide-react'

interface SlackConfig {
  botToken: string
  defaultChannel: string
}

interface SlackStatus {
  isConfigured: boolean
  team?: string
  channels?: Array<{ id: string; name: string; is_private: boolean }>
}

export default function SlackIntegration() {
  const [config, setConfig] = useState<SlackConfig>({
    botToken: '',
    defaultChannel: '#general'
  })
  const [status, setStatus] = useState<SlackStatus>({ isConfigured: false })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSlackStatus()
  }, [])

  const loadSlackStatus = async () => {
    try {
      const response = await fetch('/api/integrations/slack')
      if (response.ok) {
        const data = await response.json()
        setStatus({
          isConfigured: data.isConfigured,
          team: data.config?.defaultChannel ? 'Connected' : undefined
        })
      }
    } catch (error) {
      console.error('Failed to load Slack status:', error)
    }
  }

  const handleConfigure = async () => {
    if (!config.botToken.trim() || !config.defaultChannel.trim()) {
      setMessage({ type: 'error', text: 'Bot token and default channel are required' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/integrations/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: `Connected to ${data.team} successfully!` })
        setStatus({ isConfigured: true, team: data.team })
      } else {
        setMessage({ type: 'error', text: data.error || 'Configuration failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to configure Slack' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestMessage = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/integrations/slack/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '🤖 Test message from AI Workflow Builder! Integration is working perfectly.',
          workflowName: 'Test Workflow',
          status: 'success'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Test message sent successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send test message' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test message' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Slack Integration
          </CardTitle>
          <CardDescription>
            Connect your Slack workspace to send real notifications from workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configure" className="space-y-4">
            <TabsList>
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="test">Test Connection</TabsTrigger>
              <TabsTrigger value="help">Setup Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-4">
              {/* Current Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {status.isConfigured ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Connected to Slack</span>
                      {status.team && <Badge variant="secondary">{status.team}</Badge>}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Not configured</span>
                    </>
                  )}
                </div>
              </div>

              {/* Configuration Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bot-token" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Bot Token
                  </Label>
                  <Input
                    id="bot-token"
                    type="password"
                    placeholder="xoxb-your-bot-token-here"
                    value={config.botToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, botToken: e.target.value }))}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get this from your Slack app settings under "OAuth & Permissions"
                  </p>
                </div>

                <div>
                  <Label htmlFor="default-channel" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Default Channel
                  </Label>
                  <Input
                    id="default-channel"
                    placeholder="#general"
                    value={config.defaultChannel}
                    onChange={(e) => setConfig(prev => ({ ...prev, defaultChannel: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default channel for workflow notifications
                  </p>
                </div>

                <Button 
                  onClick={handleConfigure}
                  disabled={isLoading || !config.botToken.trim() || !config.defaultChannel.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Configuring...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Connect to Slack
                    </>
                  )}
                </Button>
              </div>

              {/* Message */}
              {message && (
                <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <TestTube className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Test Slack Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Send a test message to verify your connection is working
                  </p>
                </div>

                {status.isConfigured ? (
                  <Button onClick={handleTestMessage} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Settings className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Test Message
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Configure Slack integration first before testing
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Follow these steps to set up your Slack integration
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <h4 className="font-medium">Create a Slack App</h4>
                      <p className="text-sm text-muted-foreground">
                        Go to{' '}
                        <a 
                          href="https://api.slack.com/apps" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          api.slack.com/apps
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {' '}and create a new app
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <h4 className="font-medium">Configure OAuth Permissions</h4>
                      <p className="text-sm text-muted-foreground">
                        Add these bot token scopes: chat:write, channels:read, groups:read
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <h4 className="font-medium">Install to Workspace</h4>
                      <p className="text-sm text-muted-foreground">
                        Install the app to your Slack workspace and copy the Bot User OAuth Token
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
                    <div>
                      <h4 className="font-medium">Add to Channels</h4>
                      <p className="text-sm text-muted-foreground">
                        Invite the bot to any channels you want to send messages to
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Required Permissions:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• <code>chat:write</code> - Send messages to channels</li>
                    <li>• <code>channels:read</code> - Read channel information</li>
                    <li>• <code>groups:read</code> - Read private channel information</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}