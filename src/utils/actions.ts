import * as Linking from 'expo-linking';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import { Alert, Platform } from 'react-native';
import { QRCodeData, QRContentType } from '../types';

/**
 * Open URL in browser
 */
export async function openURL(url: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', `Cannot open URL: ${url}`);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to open URL');
  }
}

/**
 * Open phone dialer
 */
export async function openPhone(phone: string): Promise<void> {
  const url = phone.startsWith('tel:') ? phone : `tel:${phone}`;
  await openURL(url);
}

/**
 * Open email client
 */
export async function openEmail(email: string, subject?: string, body?: string): Promise<void> {
  let url = `mailto:${email}`;
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  if (params.length) url += '?' + params.join('&');
  await openURL(url);
}

/**
 * Open SMS app
 */
export async function openSMS(number: string, body?: string): Promise<void> {
  let url = `sms:${number}`;
  if (body) {
    url += Platform.OS === 'ios' ? `&body=${encodeURIComponent(body)}` : `?body=${encodeURIComponent(body)}`;
  }
  await openURL(url);
}

/**
 * Open maps with coordinates
 */
export async function openMaps(latitude: number, longitude: number): Promise<void> {
  const url = Platform.select({
    ios: `maps:${latitude},${longitude}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
  }) || `https://maps.google.com/?q=${latitude},${longitude}`;
  await openURL(url);
}

/**
 * Add contact to phone
 */
export async function addContact(data: {
  name?: string;
  phone?: string;
  email?: string;
  org?: string;
  title?: string;
  address?: string;
}): Promise<boolean> {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant contacts permission to add contacts.');
      return false;
    }
    
    const contact: Contacts.Contact = {
      contactType: Contacts.ContactTypes.Person,
      name: data.name || 'Unknown',
      firstName: data.name?.split(' ')[0] || '',
      lastName: data.name?.split(' ').slice(1).join(' ') || '',
    };
    
    if (data.phone) {
      contact.phoneNumbers = [{
        label: 'mobile',
        number: data.phone,
      }];
    }
    
    if (data.email) {
      contact.emails = [{
        label: 'work',
        email: data.email,
      }];
    }
    
    if (data.org) {
      contact.company = data.org;
    }
    
    if (data.title) {
      contact.jobTitle = data.title;
    }
    
    // On iOS, we need to use presentFormAsync
    if (Platform.OS === 'ios') {
      await Contacts.presentFormAsync(null, contact, { isNew: true });
    } else {
      // On Android, we can add directly
      await Contacts.addContactAsync(contact);
      Alert.alert('Success', 'Contact added successfully!');
    }
    
    return true;
  } catch (error) {
    console.error('Error adding contact:', error);
    Alert.alert('Error', 'Failed to add contact');
    return false;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
  Alert.alert('Copied', 'Content copied to clipboard');
}

/**
 * Open WiFi settings page
 */
export async function openWiFiSettings(): Promise<void> {
  try {
    let opened = false;
    
    if (Platform.OS === 'android') {
      // Try Android WiFi settings intent
      try {
        await Linking.sendIntent('android.settings.WIFI_SETTINGS');
        opened = true;
      } catch (error) {
        console.log('Could not open WiFi settings via intent, trying URL...');
      }
    }
    
    // Fallback: try opening general settings
    if (!opened) {
      await Linking.openSettings();
    }
  } catch (error) {
    console.error('Error opening WiFi settings:', error);
    Alert.alert('Error', 'Unable to open WiFi settings. Please open Settings manually.');
  }
}

/**
 * Get action buttons based on QR content type
 */
export function getActions(data: QRCodeData): Array<{
  label: string;
  icon: string;
  action: () => Promise<void>;
  primary?: boolean;
}> {
  const actions: Array<{
    label: string;
    icon: string;
    action: () => Promise<void>;
    primary?: boolean;
  }> = [];
  
  const { type, parsed } = data;
  
  switch (type) {
    case 'url':
      if (parsed.url) {
        actions.push({
          label: 'Open URL',
          icon: 'open-outline',
          action: () => openURL(parsed.url!),
          primary: true,
        });
      }
      break;
      
    case 'email':
      if (parsed.email) {
        actions.push({
          label: 'Send Email',
          icon: 'mail-outline',
          action: () => openEmail(parsed.email!, parsed.emailSubject, parsed.emailBody),
          primary: true,
        });
      }
      break;
      
    case 'phone':
      if (parsed.phone) {
        actions.push({
          label: 'Call',
          icon: 'call-outline',
          action: () => openPhone(parsed.phone!),
          primary: true,
        });
      }
      break;
      
    case 'sms':
      if (parsed.smsNumber) {
        actions.push({
          label: 'Send SMS',
          icon: 'chatbubble-outline',
          action: () => openSMS(parsed.smsNumber!, parsed.smsBody),
          primary: true,
        });
      }
      break;
      
    case 'contact':
      actions.push({
        label: 'Add Contact',
        icon: 'person-add-outline',
        action: () => addContact({
          name: parsed.contactName,
          phone: parsed.contactPhone,
          email: parsed.contactEmail,
          org: parsed.contactOrg,
          title: parsed.contactTitle,
          address: parsed.contactAddress,
        }).then(() => {}),
        primary: true,
      });
      
      if (parsed.contactPhone) {
        actions.push({
          label: 'Call',
          icon: 'call-outline',
          action: () => openPhone(parsed.contactPhone!),
        });
      }
      
      if (parsed.contactEmail) {
        actions.push({
          label: 'Email',
          icon: 'mail-outline',
          action: () => openEmail(parsed.contactEmail!),
        });
      }
      break;
      
    case 'wifi':
      // Open WiFi settings so user can connect
      actions.push({
        label: 'Open WiFi Settings',
        icon: 'wifi-outline',
        action: async () => {
          // Show WiFi info first
          const wifiInfo = [
            `Network: ${parsed.wifiSSID || 'Unknown'}`,
            parsed.wifiPassword ? `Password: ${parsed.wifiPassword}` : '',
            parsed.wifiType ? `Security: ${parsed.wifiType}` : '',
          ].filter(Boolean).join('\n');
          
          Alert.alert(
            'WiFi Network',
            wifiInfo + '\n\nOpening WiFi settings...',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => openWiFiSettings()
              }
            ]
          );
        },
        primary: true,
      });
      
      // Also add copy password action
      if (parsed.wifiPassword) {
        actions.push({
          label: 'Copy Password',
          icon: 'key-outline',
          action: () => copyToClipboard(parsed.wifiPassword!),
        });
      }
      break;
      
    case 'geo':
      if (parsed.latitude !== undefined && parsed.longitude !== undefined) {
        actions.push({
          label: 'Open in Maps',
          icon: 'map-outline',
          action: () => openMaps(parsed.latitude!, parsed.longitude!),
          primary: true,
        });
      }
      break;
      
    case 'crypto':
      if (parsed.cryptoAddress) {
        actions.push({
          label: `Copy ${parsed.cryptoCurrency || 'Crypto'} Address`,
          icon: 'wallet-outline',
          action: () => copyToClipboard(parsed.cryptoAddress!),
          primary: true,
        });
      }
      
      if (parsed.cryptoAmount) {
        actions.push({
          label: 'Copy Amount',
          icon: 'cash-outline',
          action: () => copyToClipboard(parsed.cryptoAmount!),
        });
      }
      break;
      
    case 'calendar':
      // Calendar integration would require more setup
      // For now, just copy the event details
      actions.push({
        label: 'Copy Event',
        icon: 'copy-outline',
        action: () => copyToClipboard(
          `${parsed.eventTitle || 'Event'}\n${parsed.eventStart || ''} - ${parsed.eventEnd || ''}\n${parsed.eventLocation || ''}`
        ),
        primary: true,
      });
      break;
  }
  
  // Always add copy action
  actions.push({
    label: 'Copy',
    icon: 'copy-outline',
    action: () => copyToClipboard(data.raw),
  });
  
  return actions;
}
