'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  FileSpreadsheet, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Key,
  Plus,
  TestTube,
  Info,
  ExternalLink,
  Database,
  Upload,
  Download
} from 'lucide-react'

interface GoogleSheetsConfig {
  clientId: string
  clientEmail: string
  privateKey: string
  spreadsheetId?: string
}

interface GoogleSheetsStatus {
  isConfigured: boolean
  hasCredentials: boolean
  spreadsheetInfo?: any
}

export default function GoogleSheetsIntegration() {
  const [config, setConfig] = useState<GoogleSheetsConfig>({
    clientId: '',
    clientEmail: '',
    privateKey: '',
    spreadsheetId: ''
  })
  const [status, setStatus] = useState<GoogleSheetsStatus>({ isConfigured: false, hasCredentials: false })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [testData, setTestData] = useState<any[]>([])
  const [operationResult, setOperationResult] = useState<any>(null)

  useEffect(() => {
    loadGoogleSheetsStatus()
  }, [])

  const loadGoogleSheetsStatus = async () => {
    try {
      const response = await fetch('/api/integrations/google-sheets')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to load Google Sheets status:', error)
    }
  }

  const handleConfigure = async () => {
    if (!config.clientId.trim() || !config.clientEmail.trim() || !config.privateKey.trim()) {
      setMessage({ type: 'error', text: 'Client ID, client email, and private key are required' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/integrations/google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Google Sheets integration configured successfully!' })
        setStatus({ isConfigured: true, hasCredentials: true })
      } else {
        setMessage({ type: 'error', text: data.error || 'Configuration failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to configure Google Sheets' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/integrations/google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Connection test successful!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Connection test failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test connection' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOperation = async (action: string, params: any = {}) => {
    setIsLoading(true)
    setOperationResult(null)

    try {
      const response = await fetch('/api/integrations/google-sheets/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...params
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOperationResult(data)
        setMessage({ type: 'success', text: data.message })
        
        if (action === 'read' && data.data) {
          setTestData(data.data)
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Operation failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to perform operation' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSpreadsheet = async () => {
    const title = `Workflow Data ${new Date().toISOString().split('T')[0]}`
    await handleOperation('createSpreadsheet', { title })
  }

  const handleWriteTestData = async () => {
    if (!config.spreadsheetId) {
      setMessage({ type: 'error', text: 'Spreadsheet ID is required' })
      return
    }

    const testValues = [
      ['Timestamp', 'Workflow Name', 'Status', 'Data'],
      [new Date().toISOString(), 'Test Workflow', 'Success', 'Sample data'],
      [new Date().toISOString(), 'Another Workflow', 'Running', 'More data']
    ]

    await handleOperation('write', {
      spreadsheetId: config.spreadsheetId,
      range: 'Sheet1!A1:D3',
      values: testValues
    })
  }

  const handleReadData = async () => {
    if (!config.spreadsheetId) {
      setMessage({ type: 'error', text: 'Spreadsheet ID is required' })
      return
    }

    await handleOperation('read', {
      spreadsheetId: config.spreadsheetId,
      range: 'Sheet1!A:Z'
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Google Sheets Integration
          </CardTitle>
          <CardDescription>
            Connect your Google account to read and write spreadsheet data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configure" className="space-y-4">
            <TabsList>
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="test">Test Connection</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="help">Setup Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-4">
              {/* Current Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {status.isConfigured ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Connected to Google Sheets</span>
                      <Badge variant="secondary">Ready</Badge>
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
                  <Label htmlFor="client-id" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Client ID
                  </Label>
                  <Input
                    id="client-id"
                    placeholder="your-client-id.apps.googleusercontent.com"
                    value={config.clientId}
                    onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="client-email" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Client Email
                  </Label>
                  <Input
                    id="client-email"
                    placeholder="your-service-account@your-project.iam.gserviceaccount.com"
                    value={config.clientEmail}
                    onChange={(e) => setConfig(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="private-key" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Private Key
                  </Label>
                  <Textarea
                    id="private-key"
                    placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
                    value={config.privateKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, privateKey: e.target.value }))}
                    className="font-mono text-xs"
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="spreadsheet-id" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Default Spreadsheet ID (Optional)
                  </Label>
                  <Input
                    id="spreadsheet-id"
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    value={config.spreadsheetId}
                    onChange={(e) => setConfig(prev => ({ ...prev, spreadsheetId: e.target.value }))}
                    className="font-mono"
                  />
                </div>

                <Button 
                  onClick={handleConfigure}
                  disabled={isLoading || !config.clientId.trim() || !config.clientEmail.trim() || !config.privateKey.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Configuring...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Connect to Google Sheets
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
                  <h3 className="text-lg font-medium">Test Google Sheets Connection</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify your Google Sheets integration is working properly
                  </p>
                </div>

                {status.isConfigured ? (
                  <div className="space-y-3">
                    <Button onClick={handleTestConnection} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Settings className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    
                    <Button onClick={handleCreateSpreadsheet} variant="outline" disabled={isLoading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Test Spreadsheet
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Configure Google Sheets integration first before testing
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Write Test Data</CardTitle>
                    <CardDescription>
                      Write sample data to your spreadsheet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleWriteTestData} 
                      disabled={isLoading || !config.spreadsheetId}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Write Test Data
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Read Data</CardTitle>
                    <CardDescription>
                      Read data from your spreadsheet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleReadData} 
                      disabled={isLoading || !config.spreadsheetId}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Read Data
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Operation Results */}
              {operationResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Operation Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(operationResult, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Test Data Display */}
              {testData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Spreadsheet Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {testData[0]?.map((header: string, index: number) => (
                              <TableHead key={index}>{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testData.slice(1).map((row: any[], rowIndex: number) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell: any, cellIndex: number) => (
                                <TableCell key={cellIndex}>{String(cell)}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Follow these steps to set up your Google Sheets integration
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <h4 className="font-medium">Create Google Cloud Project</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to{' '}
                      <a 
                        href="https://console.cloud.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Google Cloud Console
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {' '}and create a new project
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <h4 className="font-medium">Enable Google Sheets API</h4>
                    <p className="text-sm text-muted-foreground">
                      In your project, enable the "Google Sheets API" from the API library
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <h4 className="font-medium">Create Service Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to IAM & Admin → Service Accounts → Create Service Account
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
                  <div>
                    <h4 className="font-medium">Generate JSON Key</h4>
                    <p className="text-sm text-muted-foreground">
                      Create and download a JSON key file. Extract the credentials from the file
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">5</div>
                  <div>
                    <h4 className="font-medium">Share Spreadsheet</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your Google Sheet with the service account email address
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Required Permissions:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Google Sheets API enabled</li>
                  <li>• Service account with Editor permissions on spreadsheets</li>
                  <li>• JSON key file downloaded and credentials extracted</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}