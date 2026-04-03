// QR Code content types
export type QRContentType = 
  | 'url'
  | 'email'
  | 'phone'
  | 'sms'
  | 'contact'
  | 'wifi'
  | 'geo'
  | 'calendar'
  | 'crypto'
  | 'actionhub'
  | 'text';

export interface QRCodeData {
  raw: string;
  type: QRContentType;
  parsed: ParsedQRData;
  scannedAt: Date;
}

export interface ParsedQRData {
  // URL
  url?: string;
  
  // Email
  email?: string;
  emailSubject?: string;
  emailBody?: string;
  
  // Phone
  phone?: string;
  
  // SMS
  smsNumber?: string;
  smsBody?: string;
  
  // Contact (vCard)
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactOrg?: string;
  contactTitle?: string;
  contactAddress?: string;
  contactUrl?: string;
  contactNote?: string;
  
  // WiFi
  wifiSSID?: string;
  wifiPassword?: string;
  wifiType?: 'WPA' | 'WEP' | 'nopass';
  wifiHidden?: boolean;
  
  // Geo
  latitude?: number;
  longitude?: number;
  
  // Calendar
  eventTitle?: string;
  eventStart?: string;
  eventEnd?: string;
  eventLocation?: string;
  eventDescription?: string;
  
  // Crypto Wallet
  cryptoAddress?: string;
  cryptoCurrency?: string;  // BTC, ETH, SOL, etc.
  cryptoAmount?: string;    // Optional payment amount
  cryptoLabel?: string;     // Optional label/memo
  cryptoMessage?: string;   // Optional message
  
  // Plain text
  text?: string;
  
  // Action Hub
  actionHubCode?: string;
}

export interface GenerateQROptions {
  type: QRContentType;
  data: Partial<ParsedQRData>;
}

export interface HistoryItem {
  id: string;
  data: QRCodeData;
  isFavorite: boolean;
  source: 'scan' | 'generate';
}
