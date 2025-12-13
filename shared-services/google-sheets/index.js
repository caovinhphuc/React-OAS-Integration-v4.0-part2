// Centralized Google Sheets Service (deduplicated)
// Provides a unified API wrapper to interact with backend Sheets endpoints.
// Any project should import from: shared-services/google-sheets

import { GoogleSheetsService } from './service'

const googleSheetsService = new GoogleSheetsService()
export { GoogleSheetsService }
export default googleSheetsService
