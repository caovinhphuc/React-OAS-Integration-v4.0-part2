/**
 * Service để quản lý đề nghị vận chuyển
 */

export interface TransportRequest {
  id: string;
  requestCode: string;
  type: 'system' | 'external';
  origin: {
    id: string;
    name: string;
    address: string;
  };
  destinations: Array<{
    id: string;
    name: string;
    address: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  note?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateTransportRequestData {
  type: 'system' | 'external';
  originId: string;
  destinationIds: string[];
  note?: string;
}

class TransportRequestsService {
  private readonly SHEET_NAME = 'TransportProposals';

  /**
   * Tạo đề nghị vận chuyển mới
   */
  async createTransportRequest(
    data: CreateTransportRequestData
  ): Promise<TransportRequest> {
    try {
      const requestCode = this.generateRequestCode(data.type);
      const now = new Date();

      const transportRequest: TransportRequest = {
        id: this.generateId(),
        requestCode,
        type: data.type,
        origin: await this.getLocationById(data.originId),
        destinations: await Promise.all(
          data.destinationIds.map((id) => this.getLocationById(id))
        ),
        status: 'pending',
        note: data.note,
        createdAt: this.formatVietnameseDateTime(now),
        updatedAt: this.formatVietnameseDateTime(now),
        createdBy: 'current_user', // TODO: Get from auth context
      };

      // TODO: Save to Google Sheets
      console.log('Creating transport request:', transportRequest);

      return transportRequest;
    } catch (error) {
      console.error('Error creating transport request:', error);
      throw new Error('Không thể tạo đề nghị vận chuyển');
    }
  }

  /**
   * Lấy danh sách đề nghị vận chuyển
   */
  async getTransportRequests(): Promise<TransportRequest[]> {
    try {
      // TODO: Fetch from Google Sheets
      return [];
    } catch (error) {
      console.error('Error fetching transport requests:', error);
      throw new Error('Không thể lấy danh sách đề nghị vận chuyển');
    }
  }

  /**
   * Cập nhật trạng thái đề nghị vận chuyển
   */
  async updateTransportRequestStatus(
    id: string,
    status: TransportRequest['status']
  ): Promise<void> {
    try {
      // TODO: Update in Google Sheets
      console.log(`Updating transport request ${id} status to ${status}`);
    } catch (error) {
      console.error('Error updating transport request status:', error);
      throw new Error('Không thể cập nhật trạng thái đề nghị vận chuyển');
    }
  }

  /**
   * Tạo mã đề nghị vận chuyển
   */
  private generateRequestCode(type: 'system' | 'external'): string {
    const prefix = type === 'system' ? 'TRS' : 'TRE';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  /**
   * Tạo ID duy nhất
   */
  private generateId(): string {
    return `tr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Lấy thông tin địa điểm theo ID
   */
  private async getLocationById(id: string): Promise<{
    id: string;
    name: string;
    address: string;
  }> {
    try {
      // TODO: Fetch from locations API
      const response = await fetch(`/api/locations/${id}`);
      if (!response.ok) {
        throw new Error('Location not found');
      }
      const location = await response.json();
      return {
        id: location.id,
        name: location.name,
        address: location.address,
      };
    } catch (error) {
      console.error('Error fetching location:', error);
      throw new Error('Không thể lấy thông tin địa điểm');
    }
  }

  /**
   * Định dạng ngày tháng theo tiếng Việt
   */
  private formatVietnameseDateTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Khởi tạo sheet TransportRequests
   */
  async initializeSheet(): Promise<void> {
    try {
      const response = await fetch('/api/transport-proposals/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initialize sheet');
      }

      console.log('TransportProposals sheet initialized successfully');
    } catch (error) {
      console.error('Error initializing TransportProposals sheet:', error);
      throw new Error('Không thể khởi tạo sheet đề nghị vận chuyển');
    }
  }
}

export const transportRequestsService = new TransportRequestsService();
