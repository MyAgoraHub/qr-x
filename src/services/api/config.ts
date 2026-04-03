// API Configuration
// Development: localhost, Production: configure via environment

import { Platform } from 'react-native';

const isDevelopment = __DEV__;

// For Android emulator, localhost doesn't work - use 10.0.2.2 instead
// For physical device, use your computer's local IP address (e.g., 192.168.x.x)
const getDevBaseUrl = () => {
  // Using local network IP for physical device testing
  return 'http://192.168.1.32:3000/api/v1';
};

export const API_CONFIG = {
  // Base URL for the Action Hub API
  // In development, this points to localhost (or 10.0.2.2 for Android emulator)
  // For production builds, update this URL or use environment variables
  BASE_URL: isDevelopment 
    ? getDevBaseUrl()
    : 'https://your-domain.com/api/v1',
  
  // Public scan URL (the domain where QR codes point to)
  // This is used for detecting Action Hub URLs when scanned
  SCAN_URL_BASE: isDevelopment
    ? 'http://192.168.1.32:3000'
    : 'https://hub.qrmaster.io',
  
  // Scan URL path pattern - unified endpoint for both browser and app
  // GET /api/v1/scan/:code
  SCAN_URL_PATH: '/api/v1/scan/',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // API version
  VERSION: 'v1',
  
  // App signature for identifying QRMaster requests
  // This header is checked by the backend to differentiate app vs browser requests
  // Format: qrm_<sha256 hash of "qrmaster-mobile-client-2026">
  APP_SIGNATURE: 'qrm_a7c4e2f9b1d6a8c3e5f7b9d2a4c6e8f0b2d4a6c8e0f2a4b6',
  
  // Custom header name for app identification
  APP_HEADER_NAME: 'X-QRMaster-Signature',
};

// Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  
  // QR Codes
  QR: {
    LIST: '/qr/list',
    GET: (id: string) => `/qr/${id}`,
    CREATE: '/qr/create',
    UPDATE: (id: string) => `/qr/${id}`,
    DELETE: (id: string) => `/qr/${id}`,
  },
  
  // Actions
  ACTIONS: {
    TYPES: '/actions/types',
    LIST: (qrId: string) => `/actions/qr/${qrId}`,
    CREATE: '/actions/create',
    UPDATE: (id: string) => `/actions/${id}`,
    DELETE: (id: string) => `/actions/${id}`,
  },
  
  // Scan
  SCAN: {
    // GET /api/v1/scan/:code - unified endpoint (returns JSON for app, redirects for browser)
    GET: (code: string) => `/scan/${code}`,
    // POST /api/v1/scan/execute - legacy, can be deprecated
    EXECUTE: '/scan/execute',
    HISTORY: '/scan/history',
  },
  
  // Analytics
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    TRENDS: '/analytics/trends',
    TOP_QR_CODES: '/analytics/top-qr-codes',
    QR: (qrId: string) => `/analytics/qr/${qrId}`,
  },
  
  // Health
  HEALTH: '/health',
};
