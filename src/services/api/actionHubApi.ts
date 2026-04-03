import { API_CONFIG, ENDPOINTS } from './config';
import {
  User,
  AuthResponse,
  ActionHubQRCode,
  Action,
  ActionTypeInfo,
  ScanLog,
  ScanResponse,
  ScanExecuteRequest,
  ScanExecuteResponse,
  AnalyticsOverview,
  ScanTrend,
  TopQRCode,
  QRCodeAnalytics,
  CreateQRCodeRequest,
  UpdateQRCodeRequest,
  CreateActionRequest,
  UpdateActionRequest,
} from '../../types/actionHub';

class ActionHubApi {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(authenticated: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      // Include app signature in all requests for backend identification
      [API_CONFIG.APP_HEADER_NAME]: API_CONFIG.APP_SIGNATURE,
    };

    if (authenticated && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authenticated: boolean = true
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    console.log(`[ActionHubApi] ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(authenticated),
          ...options.headers,
        },
      });

      console.log(`[ActionHubApi] Response status: ${response.status}`);

      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }

      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }

      const data = await response.json();

      if (!response.ok) {
        console.log(`[ActionHubApi] Error response:`, data);
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error: any) {
      console.error(`[ActionHubApi] Request failed:`, error.message);
      // Check if it's a network error
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  // ============ Auth ============

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      },
      false
    );
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>(ENDPOINTS.AUTH.ME);
  }

  // ============ QR Codes ============

  async listQRCodes(): Promise<{ qrCodes: ActionHubQRCode[] }> {
    return this.request<{ qrCodes: ActionHubQRCode[] }>(ENDPOINTS.QR.LIST);
  }

  async getQRCode(id: string): Promise<{ qrCode: ActionHubQRCode }> {
    return this.request<{ qrCode: ActionHubQRCode }>(ENDPOINTS.QR.GET(id));
  }

  async createQRCode(data: CreateQRCodeRequest): Promise<{ qrCode: ActionHubQRCode }> {
    return this.request<{ qrCode: ActionHubQRCode }>(ENDPOINTS.QR.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQRCode(id: string, data: UpdateQRCodeRequest): Promise<{ qrCode: ActionHubQRCode }> {
    return this.request<{ qrCode: ActionHubQRCode }>(ENDPOINTS.QR.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQRCode(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(ENDPOINTS.QR.DELETE(id), {
      method: 'DELETE',
      body: JSON.stringify({ _: true }), // Fastify requires body when Content-Type is json
    });
  }

  // ============ Actions ============

  async getActionTypes(): Promise<{ actionTypes: ActionTypeInfo[] }> {
    return this.request<{ actionTypes: ActionTypeInfo[] }>(ENDPOINTS.ACTIONS.TYPES);
  }

  async listActions(qrId: string): Promise<{ actions: Action[] }> {
    return this.request<{ actions: Action[] }>(ENDPOINTS.ACTIONS.LIST(qrId));
  }

  async createAction(data: CreateActionRequest): Promise<{ action: Action }> {
    return this.request<{ action: Action }>(ENDPOINTS.ACTIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAction(id: string, data: UpdateActionRequest): Promise<{ action: Action }> {
    return this.request<{ action: Action }>(ENDPOINTS.ACTIONS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAction(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(ENDPOINTS.ACTIONS.DELETE(id), {
      method: 'DELETE',
      body: JSON.stringify({ _: true }), // Fastify requires body when Content-Type is json
    });
  }

  // ============ Scan ============

  /**
   * GET /api/v1/scan/:code
   * Unified scan endpoint - returns JSON for QRMaster app
   * The same endpoint returns redirect/HTML for browsers without signature
   */
  async getScan(code: string): Promise<ScanResponse> {
    return this.request<ScanResponse>(
      ENDPOINTS.SCAN.GET(code),
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
      false // Public endpoint, but signature is added by getHeaders()
    );
  }

  /**
   * POST /api/v1/scan/execute
   * Execute actions for a QR code with device metadata
   */
  async executeScan(data: ScanExecuteRequest): Promise<ScanExecuteResponse> {
    return this.request<ScanExecuteResponse>(
      ENDPOINTS.SCAN.EXECUTE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false // Public endpoint
    );
  }

  async getScanHistory(qrId?: string, limit: number = 50): Promise<{ scans: ScanLog[] }> {
    const params = new URLSearchParams();
    if (qrId) params.append('qrId', qrId);
    params.append('limit', limit.toString());
    
    return this.request<{ scans: ScanLog[] }>(
      `${ENDPOINTS.SCAN.HISTORY}?${params.toString()}`
    );
  }

  // ============ Analytics ============

  async getAnalyticsOverview(): Promise<{ analytics: AnalyticsOverview }> {
    return this.request<{ analytics: AnalyticsOverview }>(ENDPOINTS.ANALYTICS.OVERVIEW);
  }

  async getScanTrends(): Promise<{ trends: ScanTrend[] }> {
    return this.request<{ trends: ScanTrend[] }>(ENDPOINTS.ANALYTICS.TRENDS);
  }

  async getTopQRCodes(): Promise<{ topQRCodes: TopQRCode[] }> {
    return this.request<{ topQRCodes: TopQRCode[] }>(ENDPOINTS.ANALYTICS.TOP_QR_CODES);
  }

  async getQRCodeAnalytics(qrId: string): Promise<QRCodeAnalytics> {
    return this.request<QRCodeAnalytics>(ENDPOINTS.ANALYTICS.QR(qrId));
  }

  // ============ Health ============

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>(
      ENDPOINTS.HEALTH,
      {},
      false
    );
  }
}

// Export singleton instance
export const actionHubApi = new ActionHubApi();
