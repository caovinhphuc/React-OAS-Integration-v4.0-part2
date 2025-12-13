import googleConfig from '../config/googleConfig'

class GoogleSheetsService {
  constructor() {
    this.apiBaseUrl = googleConfig.api_base_url
    this.spreadsheetId = googleConfig.spreadsheet_id
  }

  // Helper method to make API calls to backend
  async makeApiCall(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(`${this.apiBaseUrl}/${endpoint}`, options)

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`API Error: ${response.status} - ${error}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API call failed:', error)
      throw new Error(`Failed to connect to backend: ${error.message}`)
    }
  }

  // Read data from a Google Sheet
  async readSheet(sheetName, range = 'A1:Z100') {
    try {
      const fullRange = sheetName ? `${sheetName}!${range}` : range
      const response = await this.makeApiCall('sheets/read', 'POST', {
        spreadsheetId: this.spreadsheetId,
        range: fullRange,
        sheetName,
      })
      return response
    } catch (error) {
      throw new Error(`Failed to read sheet: ${error.message}`)
    }
  }

  // Write data to a Google Sheet (overwrites existing data)
  async writeSheet(sheetName, range, values) {
    try {
      const fullRange = sheetName ? `${sheetName}!${range}` : range
      const response = await this.makeApiCall('sheets/write', 'POST', {
        spreadsheetId: this.spreadsheetId,
        range: fullRange,
        values,
      })
      return response
    } catch (error) {
      throw new Error(`Failed to write to sheet: ${error.message}`)
    }
  }

  // Append data to the end of a Google Sheet
  async appendSheet(sheetName, values) {
    try {
      const range = `${sheetName}!A1`
      const response = await this.makeApiCall('sheets/append', 'POST', {
        spreadsheetId: this.spreadsheetId,
        range,
        values,
      })
      return response
    } catch (error) {
      throw new Error(`Failed to append to sheet: ${error.message}`)
    }
  }

  // Create a new sheet in the spreadsheet
  async createSheet(title) {
    try {
      const response = await this.makeApiCall('sheets/create', 'POST', {
        spreadsheetId: this.spreadsheetId,
        sheetName: title,
      })
      return response
    } catch (error) {
      throw new Error(`Failed to create sheet: ${error.message}`)
    }
  }

  // Get spreadsheet information
  async getSpreadsheetInfo() {
    try {
      const response = await this.makeApiCall('sheets/info', 'POST', {
        spreadsheetId: this.spreadsheetId,
      })
      return response
    } catch (error) {
      throw new Error(`Failed to get spreadsheet info: ${error.message}`)
    }
  }

  // Update cell formatting
  async formatCells(sheetName, range, format) {
    try {
      const response = await this.makeApiCall('sheets/format', 'POST', {
        sheetName,
        range,
        format,
      })
      return response
    } catch (error) {
      throw new Error(`Failed to format cells: ${error.message}`)
    }
  }

  // Clear sheet data
  async clearSheet(sheetName, range) {
    try {
      const response = await this.makeApiCall('sheets/clear', 'POST', {
        sheetName,
        range,
      })
      return response
    } catch (error) {
      throw new Error(`Failed to clear sheet: ${error.message}`)
    }
  }

  // Utility method to parse CSV data into array format
  parseCSVData(csvString) {
    if (!csvString.trim()) return []

    return csvString
      .trim()
      .split('\n')
      .map((row) => row.split(',').map((cell) => cell.trim()))
  }

  // Utility method to convert array data to CSV format
  arrayToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return ''

    return data
      .map((row) =>
        Array.isArray(row)
          ? row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
          : String(row),
      )
      .join('\n')
  }

  // Validate configuration
  isConfigured() {
    return !!(this.apiBaseUrl && this.spreadsheetId)
  }

  // Get configuration status
  getConfigStatus() {
    return {
      apiBaseUrl: !!this.apiBaseUrl,
      spreadsheetId: !!this.spreadsheetId,
      configured: this.isConfigured(),
    }
  }
}

// Create and export a singleton instance
const googleSheetsService = new GoogleSheetsService()

export { GoogleSheetsService }
export default googleSheetsService
