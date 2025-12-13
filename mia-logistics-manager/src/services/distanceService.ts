// Distance Service - Gọi Google Apps Script để tính khoảng cách thực tế

const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

export interface DistanceResponse {
  success: boolean;
  distance?: number;
  duration?: number;
  error?: string;
}

export class DistanceService {
  /**
   * Tính khoảng cách thực tế sử dụng Google Apps Script
   */
  static async calculateDistance(
    origin: string,
    destination: string
  ): Promise<DistanceResponse> {
    try {
      // Kiểm tra URL Google Apps Script
      if (!GOOGLE_APPS_SCRIPT_URL) {
        console.warn('⚠️ Google Apps Script URL chưa được cấu hình');
        return {
          success: false,
          error: 'Google Apps Script URL not configured',
        };
      }

      // Validate addresses
      if (
        !DistanceService.validateAddress(origin) ||
        !DistanceService.validateAddress(destination)
      ) {
        console.warn('⚠️ Invalid addresses provided');
        return {
          success: false,
          error: 'Invalid addresses provided',
        };
      }

      // Format addresses
      const formattedOrigin = DistanceService.formatAddress(origin);
      const formattedDestination = DistanceService.formatAddress(destination);

      // Gọi Google Apps Script với timeout
      const url = `${GOOGLE_APPS_SCRIPT_URL}?origin=${encodeURIComponent(formattedOrigin)}&destination=${encodeURIComponent(formattedDestination)}`;

      console.log('🔄 Calling Google Apps Script...');
      console.log(`📍 Origin: ${formattedOrigin}`);
      console.log(`📍 Destination: ${formattedDestination}`);
      console.log(`🔗 URL: ${url}`);

      // Thêm timeout và retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('📊 Google Apps Script Response:', data);

      if (data.success && data.distance && data.distance > 0) {
        console.log(`✅ Distance calculated: ${data.distance.toFixed(2)} km`);
        console.log(`⏱️ Duration: ${data.duration?.toFixed(0)} minutes`);
        return data;
      } else {
        console.error(
          '❌ Google Apps Script error:',
          data.error || 'Invalid response'
        );
        return {
          success: false,
          error: data.error || 'Invalid response from Google Apps Script',
        };
      }
    } catch (error) {
      console.error('❌ Error calling Google Apps Script:', error);

      // Phân loại lỗi để xử lý phù hợp
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error:
              'Request timeout - Google Apps Script took too long to respond',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  /**
   * Test function
   */
  static async testDistanceCalculation() {
    const origin =
      'KTT - lô2-5, Đường CN1, Phường Tân Thới Nhất, Quận 12, TP. Hồ Chí Minh';
    const destination =
      '605 Nguyễn Thị Thập, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh';

    console.log('🧪 Testing distance calculation...');
    const result = await this.calculateDistance(origin, destination);

    if (result.success) {
      console.log(`✅ Test successful: ${result.distance?.toFixed(2)} km`);
    } else {
      console.log(`❌ Test failed: ${result.error}`);
    }

    return result;
  }

  /**
   * Test Google Apps Script connectivity
   */
  static async testConnectivity() {
    console.log('🔍 Testing Google Apps Script connectivity...');

    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.error('❌ Google Apps Script URL not configured');
      return false;
    }

    try {
      const testUrl = `${GOOGLE_APPS_SCRIPT_URL}?origin=test&destination=test`;
      console.log(`🔗 Testing URL: ${testUrl}`);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      console.log(`📊 Response status: ${response.status}`);
      console.log(
        `📊 Response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      if (response.status === 200) {
        const data = await response.json();
        console.log('📊 Response data:', data);
        return true;
      } else {
        const text = await response.text();
        console.log('📊 Response text:', text);
        return false;
      }
    } catch (error) {
      console.error('❌ Connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Validate địa chỉ trước khi gửi request
   */
  static validateAddress(address: string): boolean {
    if (!address || address.trim().length === 0) {
      return false;
    }

    // Kiểm tra địa chỉ có chứa ít nhất 10 ký tự
    if (address.trim().length < 10) {
      return false;
    }

    return true;
  }

  /**
   * Format địa chỉ cho Google Maps
   */
  static formatAddress(address: string): string {
    // Loại bỏ ký tự đặc biệt và format lại
    return address
      .trim()
      .replace(/\s+/g, ' ') // Thay nhiều space thành 1 space
      .replace(/[^\w\s,.-]/g, ''); // Loại bỏ ký tự đặc biệt
  }
}

export default DistanceService;
