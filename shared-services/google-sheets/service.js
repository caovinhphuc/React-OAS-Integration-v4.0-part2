// service.js - core implementation of Google Sheets interactions
// NOTE: Runtime configuration is injected via environment variables to reduce hard coupling.
// Required env vars (frontend build or backend runtime):
//   REACT_APP_SHEETS_API_BASE or SHEETS_API_BASE
//   REACT_APP_SPREADSHEET_ID or SHEETS_SPREADSHEET_ID

const API_BASE = process.env.REACT_APP_SHEETS_API_BASE || process.env.SHEETS_API_BASE
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID || process.env.SHEETS_SPREADSHEET_ID

if (!API_BASE) {
  // Soft warn (don't throw to allow build to proceed); runtime calls will fail explicitly.
  // eslint-disable-next-line no-console
  console.warn('[google-sheets] Missing API_BASE environment variable')
}

export class GoogleSheetsService {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || API_BASE || ''
    this.spreadsheetId = options.spreadsheetId || SPREADSHEET_ID || ''
  }

  _assertConfig() {
    if (!this.baseUrl || !this.spreadsheetId) {
      throw new Error('GoogleSheetsService not configured: baseUrl or spreadsheetId missing')
    }
  }

  async _post(path, payload) {
    this._assertConfig()
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Sheets API error ${res.status}: ${text}`)
    }
    return res.json()
  }

  readSheet(sheetName = 'Sheet1', range = 'A1:Z1000') {
    return this._post('/sheets/read', { spreadsheetId: this.spreadsheetId, sheetName, range })
  }

  writeSheet(sheetName = 'Sheet1', range = 'A1', values = []) {
    return this._post('/sheets/write', {
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!${range}`,
      values,
    })
  }

  appendSheet(sheetName = 'Sheet1', values = []) {
    return this._post('/sheets/append', {
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A1`,
      values,
    })
  }

  createSheet(sheetName) {
    return this._post('/sheets/create', { spreadsheetId: this.spreadsheetId, sheetName })
  }

  getSpreadsheetInfo() {
    return this._post('/sheets/info', { spreadsheetId: this.spreadsheetId })
  }

  // Utilities preserved from original implementations
  parseCSVData(csvText) {
    return csvText
      .split('\n')
      .map((line) => line.split(',').map((cell) => cell.trim()))
      .filter((row) => !(row.length === 1 && row[0] === ''))
  }

  formatToCSV(data) {
    return data.map((row) => row.join(',')).join('\n')
  }
}
