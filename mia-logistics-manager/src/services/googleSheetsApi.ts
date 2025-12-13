// src/services/googleSheetsApi.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class GoogleSheetsApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/sheets`;
  }

  // Get spreadsheet info
  async getSpreadsheetInfo() {
    const response = await axios.get(`${this.baseURL}/info`);
    return response.data;
  }

  // Get all records from a sheet
  async getRecords(sheetName: string, limit?: number) {
    const params = limit ? { limit } : {};
    const response = await axios.get(`${this.baseURL}/${sheetName}`, {
      params,
    });
    return response.data;
  }

  // Add new record to a sheet
  async addRecord(sheetName: string, data: any) {
    const response = await axios.post(`${this.baseURL}/${sheetName}`, data);
    return response.data;
  }

  // Update record in a sheet
  async updateRecord(sheetName: string, rowIndex: number, data: any) {
    const response = await axios.put(
      `${this.baseURL}/${sheetName}/${rowIndex}`,
      data
    );
    return response.data;
  }

  // Delete record from a sheet
  async deleteRecord(sheetName: string, rowIndex: number) {
    const response = await axios.delete(
      `${this.baseURL}/${sheetName}/${rowIndex}`
    );
    return response.data;
  }

  // Specific methods for common sheets
  async getEmployees(limit?: number) {
    return this.getRecords('employees', limit);
  }

  async addEmployee(employeeData: any) {
    return this.addRecord('employees', employeeData);
  }

  async updateEmployee(rowIndex: number, employeeData: any) {
    return this.updateRecord('employees', rowIndex, employeeData);
  }

  async deleteEmployee(rowIndex: number) {
    return this.deleteRecord('employees', rowIndex);
  }

  async getOrders(limit?: number) {
    return this.getRecords('orders', limit);
  }

  async addOrder(orderData: any) {
    return this.addRecord('orders', orderData);
  }

  async updateOrder(rowIndex: number, orderData: any) {
    return this.updateRecord('orders', rowIndex, orderData);
  }

  async deleteOrder(rowIndex: number) {
    return this.deleteRecord('orders', rowIndex);
  }

  async getCarriers(limit?: number) {
    return this.getRecords('carriers', limit);
  }

  async addCarrier(carrierData: any) {
    return this.addRecord('carriers', carrierData);
  }

  async updateCarrier(rowIndex: number, carrierData: any) {
    return this.updateRecord('carriers', rowIndex, carrierData);
  }

  async deleteCarrier(rowIndex: number) {
    return this.deleteRecord('carriers', rowIndex);
  }
}

export const googleSheetsApi = new GoogleSheetsApiService();
export default googleSheetsApi;
