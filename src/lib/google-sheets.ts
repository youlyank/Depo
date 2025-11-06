import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

export interface GoogleSheetsConfig {
  clientId: string
  clientEmail: string
  privateKey: string
  spreadsheetId?: string
}

export interface SheetData {
  range: string
  values: any[][]
}

export interface GoogleSheetsService {
  readData(spreadsheetId: string, range: string): Promise<any[][]>
  writeData(spreadsheetId: string, range: string, values: any[][]): Promise<boolean>
  appendData(spreadsheetId: string, range: string, values: any[][]): Promise<boolean>
  createSheet(spreadsheetId: string, sheetName: string): Promise<boolean>
  getSpreadsheetInfo(spreadsheetId: string): Promise<any>
}

export class GoogleSheetsIntegration implements GoogleSheetsService {
  private auth: JWT | null = null
  private sheets: any = null
  private config: GoogleSheetsConfig | null = null

  constructor() {
    this.initializeFromEnv()
  }

  private initializeFromEnv() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY

    if (clientId && clientEmail && privateKey) {
      this.config = { clientId, clientEmail, privateKey }
      this.initialize()
    }
  }

  // Initialize with custom config
  initialize(config?: GoogleSheetsConfig) {
    if (config) {
      this.config = config
    }

    if (!this.config) {
      throw new Error('Google Sheets configuration is required')
    }

    try {
      // Format private key properly
      const privateKey = this.config.privateKey.replace(/\\n/g, '\n')
      
      this.auth = new JWT({
        email: this.config.clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        issuer: this.config.clientId,
      })

      this.sheets = google.sheets({ version: 'v4', auth: this.auth })
      console.log('Google Sheets service initialized')
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error)
      throw error
    }
  }

  // Check if service is configured
  isConfigured(): boolean {
    return this.auth !== null && this.sheets !== null
  }

  // Read data from Google Sheets
  async readData(spreadsheetId: string, range: string): Promise<any[][]> {
    if (!this.sheets) {
      throw new Error('Google Sheets not configured')
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      })

      return response.data.values || []
    } catch (error) {
      console.error('Error reading from Google Sheets:', error)
      throw new Error(`Failed to read data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Write data to Google Sheets
  async writeData(spreadsheetId: string, range: string, values: any[][]): Promise<boolean> {
    if (!this.sheets) {
      throw new Error('Google Sheets not configured')
    }

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      })

      return true
    } catch (error) {
      console.error('Error writing to Google Sheets:', error)
      throw new Error(`Failed to write data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Append data to Google Sheets
  async appendData(spreadsheetId: string, range: string, values: any[][]): Promise<boolean> {
    if (!this.sheets) {
      throw new Error('Google Sheets not configured')
    }

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      })

      return true
    } catch (error) {
      console.error('Error appending to Google Sheets:', error)
      throw new Error(`Failed to append data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Create a new sheet
  async createSheet(spreadsheetId: string, sheetName: string): Promise<boolean> {
    if (!this.sheets) {
      throw new Error('Google Sheets not configured')
    }

    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      })

      return true
    } catch (error) {
      console.error('Error creating sheet:', error)
      throw new Error(`Failed to create sheet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get spreadsheet information
  async getSpreadsheetInfo(spreadsheetId: string): Promise<any> {
    if (!this.sheets) {
      throw new Error('Google Sheets not configured')
    }

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      })

      return {
        title: response.data.properties?.title,
        sheets: response.data.sheets?.map((sheet: any) => ({
          name: sheet.properties?.title,
          sheetId: sheet.properties?.sheetId,
          index: sheet.properties?.index,
        })),
      }
    } catch (error) {
      console.error('Error getting spreadsheet info:', error)
      throw new Error(`Failed to get spreadsheet info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Test connection
  async testConnection(spreadsheetId?: string): Promise<{ success: boolean; error?: string; info?: any }> {
    if (!this.sheets) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      if (spreadsheetId) {
        const info = await this.getSpreadsheetInfo(spreadsheetId)
        return { success: true, info }
      } else {
        // Just test authentication
        const response = await this.sheets.spreadsheets.get({
          spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', // Public test spreadsheet
        })
        return { success: true, info: { title: 'Authentication successful' } }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }
    }
  }

  // Get current config (without sensitive data)
  getConfig(): { isConfigured: boolean; hasCredentials: boolean } {
    return {
      isConfigured: this.isConfigured(),
      hasCredentials: !!(this.config?.clientId && this.config?.clientEmail && this.config?.privateKey)
    }
  }

  // Create a new spreadsheet
  async createSpreadsheet(title: string): Promise<{ success: boolean; spreadsheetId?: string; error?: string }> {
    if (!this.sheets) {
      return { success: false, error: 'Google Sheets not configured' }
    }

    try {
      const response = await this.sheets.spreadsheets.create({
        resource: {
          properties: {
            title,
          },
          sheets: [
            {
              properties: {
                title: 'Sheet1',
              },
            },
          ],
        },
      })

      return { 
        success: true, 
        spreadsheetId: response.data.spreadsheetId 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create spreadsheet' 
      }
    }
  }
}

// Singleton instance
export const googleSheetsService = new GoogleSheetsIntegration()