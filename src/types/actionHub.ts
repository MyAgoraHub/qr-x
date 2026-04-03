// Action Hub Types

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ActionHubQRCode {
  id: string;
  name: string;
  description?: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type ActionType = 
  | 'webhook' 
  | 'push_notification' 
  | 'email' 
  | 'sms' 
  | 'redirect' 
  | 'custom';

export interface Action {
  id: string;
  qr_code_id: string;
  action_type: ActionType;
  config: Record<string, any>;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ActionTypeInfo {
  type: ActionType;
  name: string;
  description: string;
  configSchema: {
    [field: string]: {
      type: string;
      required: boolean;
      description: string;
    };
  };
  exampleConfig: Record<string, any>;
}

export interface ScanLog {
  id: string;
  qr_code_id: string;
  ip_address: string;
  user_agent?: string;
  metadata?: {
    latitude?: number;
    longitude?: number;
    device?: string;
    userAgent?: string;
  };
  created_at: string;
}

export interface ScanExecuteRequest {
  code: string;
  metadata?: {
    latitude?: number;
    longitude?: number;
    device?: string;
    userAgent?: string;
  };
}

// Response from GET /api/v1/scan/:code
// Returns QR code info and configured actions (does NOT execute)
export interface ScanResponse {
  success: boolean;
  qrCode: {
    id: string;
    name: string;
    description?: string;
  };
  // Actions configured for this QR code
  actions: {
    id: string;
    type: ActionType;
    config: Record<string, any>;
    priority: number;
  }[];
}

// Request body for POST /api/v1/scan/execute
export interface ScanExecuteRequest {
  code: string;
  metadata?: {
    latitude?: number;
    longitude?: number;
    device?: string;
    userAgent?: string;
  };
}

// Response from POST /api/v1/scan/execute
// Backend executes all actions and returns result
export interface ScanExecuteResponse {
  success: boolean;
  message: string;
  qrCode: {
    id: string;
    name: string;
  };
  actionsExecuted: number;
  // If a redirect action was configured, backend returns the URL here
  redirect?: string;
  // Summary of executed actions
  actions?: {
    id: string;
    type: ActionType;
    status: 'success' | 'error';
    message?: string;
  }[];
}

export interface AnalyticsOverview {
  totalQRCodes: number;
  totalScans: number;
  scansLast24Hours: number;
  activeActions: number;
}

export interface ScanTrend {
  date: string;
  scans: number;
}

export interface TopQRCode {
  id: string;
  name: string;
  code: string;
  scan_count: number;
}

export interface QRCodeAnalytics {
  qrCode: ActionHubQRCode;
  analytics: {
    totalScans: number;
    uniqueVisitors: number;
    scansByDay: ScanTrend[];
  };
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface CreateQRCodeRequest {
  name: string;
  description?: string;
}

export interface UpdateQRCodeRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateActionRequest {
  qr_code_id: string;
  action_type: ActionType;
  config: Record<string, any>;
  priority?: number;
}

export interface UpdateActionRequest {
  config?: Record<string, any>;
  priority?: number;
  is_active?: boolean;
}

// Auth State
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
}
