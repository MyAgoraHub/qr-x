import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, QRCodeData } from '../types';

const HISTORY_KEY = '@qrx_history';
const SETTINGS_KEY = '@qrx_settings';
const MAX_HISTORY_ITEMS = 100;

/**
 * App Settings
 */
export type AppMode = 'qrx' | 'actionhub';

export interface AppSettings {
  autoOpenCamera: boolean;
  autoFlash: boolean;
  autoCopyToClipboard: boolean;
  appMode: AppMode;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoOpenCamera: false,
  autoFlash: false,
  autoCopyToClipboard: false,
  appMode: 'qrx',
};

/**
 * Get app settings
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save app settings
 */
export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get all history items
 */
export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    if (json) {
      const items = JSON.parse(json) as HistoryItem[];
      // Convert date strings back to Date objects
      return items.map(item => ({
        ...item,
        data: {
          ...item.data,
          scannedAt: new Date(item.data.scannedAt),
        },
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

/**
 * Add item to history
 */
export async function addToHistory(
  data: QRCodeData,
  source: 'scan' | 'generate'
): Promise<HistoryItem> {
  try {
    const history = await getHistory();
    
    const newItem: HistoryItem = {
      id: generateId(),
      data,
      isFavorite: false,
      source,
    };
    
    // Add to beginning of array
    history.unshift(newItem);
    
    // Limit history size
    if (history.length > MAX_HISTORY_ITEMS) {
      // Keep favorites, remove oldest non-favorites
      const favorites = history.filter(item => item.isFavorite);
      const nonFavorites = history.filter(item => !item.isFavorite);
      const trimmedNonFavorites = nonFavorites.slice(0, MAX_HISTORY_ITEMS - favorites.length);
      const trimmedHistory = [...favorites, ...trimmedNonFavorites].sort(
        (a, b) => new Date(b.data.scannedAt).getTime() - new Date(a.data.scannedAt).getTime()
      );
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    } else {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
    
    return newItem;
  } catch (error) {
    console.error('Error adding to history:', error);
    throw error;
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(id: string): Promise<boolean> {
  try {
    const history = await getHistory();
    const index = history.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    history[index].isFavorite = !history[index].isFavorite;
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    return history[index].isFavorite;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
}

/**
 * Delete history item
 */
export async function deleteFromHistory(id: string): Promise<boolean> {
  try {
    const history = await getHistory();
    const filtered = history.filter(item => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting from history:', error);
    return false;
  }
}

/**
 * Clear all history (optionally keep favorites)
 */
export async function clearHistory(keepFavorites: boolean = true): Promise<void> {
  try {
    if (keepFavorites) {
      const history = await getHistory();
      const favorites = history.filter(item => item.isFavorite);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(favorites));
    } else {
      await AsyncStorage.removeItem(HISTORY_KEY);
    }
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Get favorites only
 */
export async function getFavorites(): Promise<HistoryItem[]> {
  const history = await getHistory();
  return history.filter(item => item.isFavorite);
}

// ─── Donation Nudge ─────────────────────────────────────────────────────────

const ACTION_COUNT_KEY = '@qrx_action_count';
const DONATION_ACKNOWLEDGED_KEY = '@qrx_donation_acknowledged';
const DONATION_NUDGE_INTERVAL = 10;

/**
 * Increment action count and return whether the donation screen should show.
 * Returns false immediately if the user has already acknowledged a donation.
 */
export async function incrementActionCount(): Promise<boolean> {
  try {
    const acknowledged = await AsyncStorage.getItem(DONATION_ACKNOWLEDGED_KEY);
    if (acknowledged === 'true') return false;

    const raw = await AsyncStorage.getItem(ACTION_COUNT_KEY);
    const current = raw ? parseInt(raw, 10) : 0;
    const next = current + 1;
    await AsyncStorage.setItem(ACTION_COUNT_KEY, String(next));

    return next % DONATION_NUDGE_INTERVAL === 0;
  } catch (error) {
    console.error('Error incrementing action count:', error);
    return false;
  }
}

/**
 * Permanently silence the donation nudge (user acknowledged a donation).
 */
export async function acknowledgeDonation(): Promise<void> {
  try {
    await AsyncStorage.setItem(DONATION_ACKNOWLEDGED_KEY, 'true');
  } catch (error) {
    console.error('Error acknowledging donation:', error);
  }
}
