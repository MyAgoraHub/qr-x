import { QRContentType, ParsedQRData, QRCodeData } from '../types';
import WAValidator from 'multicoin-address-validator';
import { API_CONFIG } from '../services/api/config';

/**
 * Check if a URL is an Action Hub scan URL
 */
function isActionHubUrl(content: string): boolean {
  const trimmed = content.trim();
  
  // Check for actionhub:// protocol
  if (/^actionhub:\/\//i.test(trimmed)) {
    return true;
  }
  
  // Check for HTTPS Action Hub URL pattern
  // e.g., https://hub.qrmaster.io/s/QR-XXXXX or http://192.168.1.32:3000/s/QR-XXXXX
  const scanUrlBase = API_CONFIG.SCAN_URL_BASE.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const scanPath = API_CONFIG.SCAN_URL_PATH;
  
  // Build regex pattern for the scan URL
  // Matches: http(s)://domain/s/CODE
  const pattern = new RegExp(`^https?:\\/\\/${scanUrlBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${scanPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[A-Za-z0-9_-]+`, 'i');
  
  return pattern.test(trimmed);
}

/**
 * Extract Action Hub code from URL or protocol
 */
export function extractActionHubCode(content: string): string | null {
  const trimmed = content.trim();
  
  // Extract from actionhub:// protocol
  const protocolMatch = trimmed.match(/^actionhub:\/\/(.+)$/i);
  if (protocolMatch) {
    return protocolMatch[1];
  }
  
  // Extract from HTTPS URL
  const scanPath = API_CONFIG.SCAN_URL_PATH;
  const urlPattern = new RegExp(`${scanPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([A-Za-z0-9_-]+)`, 'i');
  const urlMatch = trimmed.match(urlPattern);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  return null;
}

/**
 * Detect the type of QR code content
 */
export function detectQRContentType(content: string): QRContentType {
  const trimmed = content.trim();
  
  // Action Hub QR codes (check first - both protocol and URL patterns)
  if (isActionHubUrl(trimmed)) {
    return 'actionhub';
  }
  
  // URL patterns (with and without protocol)
  if (/^https?:\/\//i.test(trimmed)) {
    return 'url';
  }
  if (/^www\./i.test(trimmed)) {
    return 'url';
  }
  // Check for domain-like patterns (example.com, google.com, etc.)
  if (/^[a-z0-9-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed) && !trimmed.includes(' ')) {
    return 'url';
  }
  
  // Email patterns (with and without mailto:)
  if (/^mailto:/i.test(trimmed)) {
    return 'email';
  }
  // Bare email addresses
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(trimmed)) {
    return 'email';
  }
  
  // Phone patterns (with and without tel:)
  if (/^tel:/i.test(trimmed)) {
    return 'phone';
  }
  // International phone numbers (+1234567890, +27 12 345 6789, etc.)
  if (/^\+?[\d\s\-()]{10,}$/i.test(trimmed) && /\d{3,}/.test(trimmed)) {
    return 'phone';
  }
  
  // SMS patterns
  if (/^sms:/i.test(trimmed) || /^smsto:/i.test(trimmed)) {
    return 'sms';
  }
  
  // vCard patterns (BEGIN:VCARD or MECARD)
  if (/^BEGIN:VCARD/i.test(trimmed)) {
    return 'contact';
  }
  if (/^MECARD:/i.test(trimmed)) {
    return 'contact';
  }
  
  // WiFi patterns
  if (/^WIFI:/i.test(trimmed)) {
    return 'wifi';
  }
  
  // Geo patterns
  if (/^geo:/i.test(trimmed)) {
    return 'geo';
  }
  
  // Calendar event patterns
  if (/^BEGIN:VEVENT/i.test(trimmed) || /^BEGIN:VCALENDAR/i.test(trimmed)) {
    return 'calendar';
  }
  
  // Crypto wallet patterns (bitcoin:, ethereum:, etc.)
  if (/^(bitcoin|btc|ethereum|eth|litecoin|ltc|dogecoin|doge|solana|sol|ripple|xrp|cardano|ada|polkadot|dot|binancecoin|bnb|tron|trx|monero|xmr|stellar|xlm|cosmos|atom|avalanche|avax|polygon|matic|chainlink|link|uniswap|uni|tether|usdt|usd-coin|usdc|dai):/i.test(trimmed)) {
    return 'crypto';
  }
  
  // Default to plain text
  return 'text';
}

/**
 * Parse QR code content based on detected type
 */
export function parseQRContent(content: string): QRCodeData {
  const type = detectQRContentType(content);
  let parsed: ParsedQRData = {};
  
  switch (type) {
    case 'url':
      parsed = parseURL(content);
      break;
    case 'email':
      parsed = parseEmail(content);
      break;
    case 'phone':
      parsed = parsePhone(content);
      break;
    case 'sms':
      parsed = parseSMS(content);
      break;
    case 'contact':
      parsed = parseVCard(content);
      break;
    case 'wifi':
      parsed = parseWiFi(content);
      break;
    case 'geo':
      parsed = parseGeo(content);
      break;
    case 'calendar':
      parsed = parseCalendar(content);
      break;
    case 'crypto':
      parsed = parseCrypto(content);
      break;
    case 'actionhub':
      parsed = parseActionHub(content);
      break;
    default:
      parsed = { text: content };
  }
  
  return {
    raw: content,
    type,
    parsed,
    scannedAt: new Date(),
  };
}

function parseURL(content: string): ParsedQRData {
  let url = content.trim();
  // Add https:// if missing
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return { url };
}

function parseEmail(content: string): ParsedQRData {
  let emailContent = content.trim();
  
  // Handle plain email addresses
  if (!/^mailto:/i.test(emailContent)) {
    return { email: emailContent };
  }
  
  // Handle mailto: format
  const match = emailContent.match(/^mailto:([^?]+)(?:\?(.*))?/i);
  if (!match) return { email: emailContent };
  
  const email = match[1];
  const params = new URLSearchParams(match[2] || '');
  
  return {
    email,
    emailSubject: params.get('subject') || undefined,
    emailBody: params.get('body') || undefined,
  };
}

function parsePhone(content: string): ParsedQRData {
  const phone = content.replace(/^tel:/i, '').trim();
  return { phone };
}

function parseSMS(content: string): ParsedQRData {
  const match = content.match(/^(?:sms|smsto):([^?:]+)(?:[?:](.*))?/i);
  if (!match) return { text: content };
  
  const smsNumber = match[1];
  let smsBody: string | undefined;
  
  if (match[2]) {
    const params = new URLSearchParams(match[2]);
    smsBody = params.get('body') || match[2];
  }
  
  return { smsNumber, smsBody };
}

function parseVCard(content: string): ParsedQRData {
  const parsed: ParsedQRData = {};
  
  // Check if it's MECARD format
  if (/^MECARD:/i.test(content)) {
    return parseMECARD(content);
  }
  
  // Parse VCARD format
  // Parse name
  const nameMatch = content.match(/FN:(.+)/i);
  if (nameMatch) parsed.contactName = nameMatch[1].trim();
  
  // Parse phone
  const telMatch = content.match(/TEL[;:]([^\r\n]+)/i);
  if (telMatch) {
    parsed.contactPhone = telMatch[1].replace(/^[^:]*:/, '').trim();
  }
  
  // Parse email
  const emailMatch = content.match(/EMAIL[;:]([^\r\n]+)/i);
  if (emailMatch) {
    parsed.contactEmail = emailMatch[1].replace(/^[^:]*:/, '').trim();
  }
  
  // Parse organization
  const orgMatch = content.match(/ORG:(.+)/i);
  if (orgMatch) parsed.contactOrg = orgMatch[1].trim();
  
  // Parse title
  const titleMatch = content.match(/TITLE:(.+)/i);
  if (titleMatch) parsed.contactTitle = titleMatch[1].trim();
  
  // Parse address
  const adrMatch = content.match(/ADR[;:]([^\r\n]+)/i);
  if (adrMatch) {
    parsed.contactAddress = adrMatch[1].replace(/^[^:]*:/, '').replace(/;/g, ', ').trim();
  }
  
  return parsed;
}

function parseMECARD(content: string): ParsedQRData {
  const parsed: ParsedQRData = {};
  
  // MECARD format: MECARD:N:LastName,FirstName;TEL:123456789;EMAIL:email@example.com;;
  // Parse name (N:LastName,FirstName or N:FullName)
  const nameMatch = content.match(/N:([^;]+)/i);
  if (nameMatch) {
    const nameParts = nameMatch[1].split(',');
    if (nameParts.length > 1) {
      parsed.contactName = `${nameParts[1].trim()} ${nameParts[0].trim()}`;
    } else {
      parsed.contactName = nameParts[0].trim();
    }
  }
  
  // Parse phone
  const telMatch = content.match(/TEL:([^;]+)/i);
  if (telMatch) parsed.contactPhone = telMatch[1].trim();
  
  // Parse email
  const emailMatch = content.match(/EMAIL:([^;]+)/i);
  if (emailMatch) parsed.contactEmail = emailMatch[1].trim();
  
  // Parse URL
  const urlMatch = content.match(/URL:([^;]+)/i);
  if (urlMatch) parsed.contactUrl = urlMatch[1].trim();
  
  // Parse address
  const adrMatch = content.match(/ADR:([^;]+)/i);
  if (adrMatch) parsed.contactAddress = adrMatch[1].trim();
  
  // Parse note
  const noteMatch = content.match(/NOTE:([^;]+)/i);
  if (noteMatch) parsed.contactNote = noteMatch[1].trim();
  
  return parsed;
}

function parseWiFi(content: string): ParsedQRData {
  const parsed: ParsedQRData = {};
  
  // Parse SSID
  const ssidMatch = content.match(/S:([^;]+)/);
  if (ssidMatch) parsed.wifiSSID = ssidMatch[1];
  
  // Parse password
  const passMatch = content.match(/P:([^;]+)/);
  if (passMatch) parsed.wifiPassword = passMatch[1];
  
  // Parse type
  const typeMatch = content.match(/T:([^;]+)/);
  if (typeMatch) {
    const type = typeMatch[1].toUpperCase();
    if (type === 'WPA' || type === 'WEP' || type === 'nopass') {
      parsed.wifiType = type as 'WPA' | 'WEP' | 'nopass';
    }
  }
  
  // Parse hidden
  const hiddenMatch = content.match(/H:([^;]+)/);
  if (hiddenMatch) {
    parsed.wifiHidden = hiddenMatch[1].toLowerCase() === 'true';
  }
  
  return parsed;
}

function parseGeo(content: string): ParsedQRData {
  const match = content.match(/^geo:(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (!match) return { text: content };
  
  return {
    latitude: parseFloat(match[1]),
    longitude: parseFloat(match[2]),
  };
}

function parseCalendar(content: string): ParsedQRData {
  const parsed: ParsedQRData = {};
  
  // Parse summary/title
  const summaryMatch = content.match(/SUMMARY:(.+)/i);
  if (summaryMatch) parsed.eventTitle = summaryMatch[1].trim();
  
  // Parse start date
  const startMatch = content.match(/DTSTART:(.+)/i);
  if (startMatch) parsed.eventStart = startMatch[1].trim();
  
  // Parse end date
  const endMatch = content.match(/DTEND:(.+)/i);
  if (endMatch) parsed.eventEnd = endMatch[1].trim();
  
  // Parse location
  const locationMatch = content.match(/LOCATION:(.+)/i);
  if (locationMatch) parsed.eventLocation = locationMatch[1].trim();
  
  // Parse description
  const descMatch = content.match(/DESCRIPTION:(.+)/i);
  if (descMatch) parsed.eventDescription = descMatch[1].trim();
  
  return parsed;
}

/**
 * Generate QR code content string from structured data
 */
export function generateQRContent(type: QRContentType, data: ParsedQRData): string {
  switch (type) {
    case 'url':
      return data.url || '';
      
    case 'email':
      let emailUrl = `mailto:${data.email || ''}`;
      const emailParams: string[] = [];
      if (data.emailSubject) emailParams.push(`subject=${encodeURIComponent(data.emailSubject)}`);
      if (data.emailBody) emailParams.push(`body=${encodeURIComponent(data.emailBody)}`);
      if (emailParams.length) emailUrl += '?' + emailParams.join('&');
      return emailUrl;
      
    case 'phone':
      return `tel:${data.phone || ''}`;
      
    case 'sms':
      let smsUrl = `sms:${data.smsNumber || ''}`;
      if (data.smsBody) smsUrl += `?body=${encodeURIComponent(data.smsBody)}`;
      return smsUrl;
      
    case 'contact':
      return generateVCard(data);
      
    case 'wifi':
      return generateWiFi(data);
      
    case 'geo':
      return `geo:${data.latitude || 0},${data.longitude || 0}`;
      
    case 'calendar':
      return generateCalendar(data);
      
    case 'crypto':
      return generateCrypto(data);
      
    default:
      return data.text || '';
  }
}

function generateVCard(data: ParsedQRData): string {
  let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
  
  if (data.contactName) {
    vcard += `FN:${data.contactName}\n`;
    vcard += `N:${data.contactName};;;\n`;
  }
  if (data.contactPhone) vcard += `TEL:${data.contactPhone}\n`;
  if (data.contactEmail) vcard += `EMAIL:${data.contactEmail}\n`;
  if (data.contactOrg) vcard += `ORG:${data.contactOrg}\n`;
  if (data.contactTitle) vcard += `TITLE:${data.contactTitle}\n`;
  if (data.contactAddress) vcard += `ADR:;;${data.contactAddress};;;;\n`;
  
  vcard += 'END:VCARD';
  return vcard;
}

function generateWiFi(data: ParsedQRData): string {
  let wifi = 'WIFI:';
  wifi += `T:${data.wifiType || 'WPA'};`;
  wifi += `S:${data.wifiSSID || ''};`;
  if (data.wifiPassword) wifi += `P:${data.wifiPassword};`;
  if (data.wifiHidden) wifi += 'H:true;';
  wifi += ';';
  return wifi;
}

function generateCalendar(data: ParsedQRData): string {
  let cal = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n';
  
  if (data.eventTitle) cal += `SUMMARY:${data.eventTitle}\n`;
  if (data.eventStart) cal += `DTSTART:${data.eventStart}\n`;
  if (data.eventEnd) cal += `DTEND:${data.eventEnd}\n`;
  if (data.eventLocation) cal += `LOCATION:${data.eventLocation}\n`;
  if (data.eventDescription) cal += `DESCRIPTION:${data.eventDescription}\n`;
  
  cal += 'END:VEVENT\nEND:VCALENDAR';
  return cal;
}

function parseCrypto(content: string): ParsedQRData {
  const trimmed = content.trim();
  const result: ParsedQRData = {};
  
  // Parse crypto URI format: currency:address?param1=value1&param2=value2
  const match = trimmed.match(/^([a-z0-9]+):([^?]+)(\?.*)?$/i);
  
  if (match) {
    const [, currency, address, queryString] = match;
    result.cryptoCurrency = currency.toUpperCase();
    result.cryptoAddress = address;
    
    // Parse query parameters
    if (queryString) {
      const params = new URLSearchParams(queryString.substring(1));
      if (params.has('amount')) result.cryptoAmount = params.get('amount') || undefined;
      if (params.has('label')) result.cryptoLabel = params.get('label') || undefined;
      if (params.has('message')) result.cryptoMessage = params.get('message') || undefined;
    }
    
    // Validate address using multicoin-address-validator
    try {
      const isValid = WAValidator.validate(address, currency);
      if (!isValid) {
        // If invalid, try to auto-detect currency
        const detected = detectCryptoCurrency(address);
        if (detected) {
          result.cryptoCurrency = detected;
        }
      }
    } catch (error) {
      // Validation failed, keep parsed values
      console.warn('Crypto validation error:', error);
    }
  } else {
    // No URI format, try to parse as plain address
    result.cryptoAddress = trimmed;
    const detected = detectCryptoCurrency(trimmed);
    if (detected) {
      result.cryptoCurrency = detected;
    }
  }
  
  return result;
}

/**
 * Detect cryptocurrency type from address
 */
function detectCryptoCurrency(address: string): string | undefined {
  const currencies = [
    'BTC', 'ETH', 'LTC', 'DOGE', 'XRP', 'BCH', 'ADA', 'DOT', 'SOL', 
    'MATIC', 'TRX', 'AVAX', 'ATOM', 'XLM', 'ALGO', 'VET', 'XTZ', 
    'FIL', 'NEAR', 'ICP', 'APT', 'ARB', 'OP', 'SUI'
  ];
  
  for (const currency of currencies) {
    try {
      if (WAValidator.validate(address, currency)) {
        return currency;
      }
    } catch (error) {
      // Continue to next currency
    }
  }
  
  return undefined;
}

function generateCrypto(data: ParsedQRData): string {
  if (!data.cryptoAddress || !data.cryptoCurrency) return '';
  
  let uri = `${data.cryptoCurrency.toLowerCase()}:${data.cryptoAddress}`;
  
  const params = new URLSearchParams();
  if (data.cryptoAmount) params.append('amount', data.cryptoAmount);
  if (data.cryptoLabel) params.append('label', data.cryptoLabel);
  if (data.cryptoMessage) params.append('message', data.cryptoMessage);
  
  const queryString = params.toString();
  if (queryString) uri += `?${queryString}`;
  
  return uri;
}

/**
 * Parse Action Hub QR code content
 * Format: actionhub://CODE or https://hub.qrmaster.io/s/CODE
 */
function parseActionHub(content: string): ParsedQRData {
  // Use the centralized extraction function
  const code = extractActionHubCode(content);
  if (code) {
    return { actionHubCode: code };
  }
  // Fallback - treat entire content as code
  return { actionHubCode: content };
}

/**
 * Get display label for QR content type
 */
export function getTypeLabel(type: QRContentType): string {
  const labels: Record<QRContentType, string> = {
    url: '🔗 URL',
    email: '📧 Email',
    phone: '📞 Phone',
    sms: '💬 SMS',
    contact: '👤 Contact',
    wifi: '📶 WiFi',
    geo: '📍 Location',
    calendar: '📅 Event',
    crypto: '💰 Crypto Wallet',
    actionhub: '⚡ Action Hub',
    text: '📝 Text',
  };
  return labels[type];
}

/**
 * Get icon name for QR content type (Ionicons)
 */
export function getTypeIcon(type: QRContentType): string {
  const icons: Record<QRContentType, string> = {
    url: 'link-outline',
    email: 'mail-outline',
    phone: 'call-outline',
    sms: 'chatbubble-outline',
    contact: 'person-outline',
    wifi: 'wifi-outline',
    geo: 'location-outline',
    calendar: 'calendar-outline',
    crypto: 'wallet-outline',
    actionhub: 'flash-outline',
    text: 'document-text-outline',
  };
  return icons[type];
}
