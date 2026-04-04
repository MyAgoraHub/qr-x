import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { HistoryItem } from '../types';
import { getTypeLabel, getTypeIcon, canAddToWallet, addToWallet } from '../utils';

interface HistoryCardProps {
  item: HistoryItem;
  onPress: () => void;
  onFavoritePress: () => void;
  onDeletePress: () => void;
}

export function HistoryCard({
  item,
  onPress,
  onFavoritePress,
  onDeletePress,
}: HistoryCardProps) {
  const { data, isFavorite, source } = item;
  const typeColor = Colors.typeColors[data.type] || Colors.textSecondary;
  const viewShotRef = useRef<ViewShot>(null);
  const walletSupported = canAddToWallet(data);
  
  const handleShare = async () => {
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share QR Code',
          });
        }
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };
  
  const getDisplayText = (): string => {
    const { parsed, type } = data;
    switch (type) {
      case 'url':
        return parsed.url || data.raw;
      case 'email':
        return parsed.email || data.raw;
      case 'phone':
        return parsed.phone || data.raw;
      case 'sms':
        return parsed.smsNumber || data.raw;
      case 'contact':
        return parsed.contactName || 'Contact';
      case 'wifi':
        return parsed.wifiSSID || 'WiFi Network';
      case 'geo':
        return `${parsed.latitude?.toFixed(4)}, ${parsed.longitude?.toFixed(4)}`;
      case 'calendar':
        return parsed.eventTitle || 'Event';
      default:
        return data.raw.substring(0, 50);
    }
  };
  
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
      
      {/* QR Code Preview */}
      <View style={styles.qrPreview}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          <View style={styles.qrContainer}>
            <QRCode
              value={data.raw || ' '}
              size={48}
              backgroundColor="white"
              color="black"
            />
          </View>
        </ViewShot>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <Ionicons
              name={getTypeIcon(data.type) as any}
              size={16}
              color={typeColor}
            />
            <Text style={[styles.typeLabel, { color: typeColor }]}>
              {getTypeLabel(data.type)}
            </Text>
          </View>
          
          <View style={styles.meta}>
            <Ionicons
              name={source === 'scan' ? 'scan-outline' : 'create-outline'}
              size={12}
              color={Colors.textMuted}
            />
            <Text style={styles.date}>{formatDate(data.scannedAt)}</Text>
          </View>
        </View>
        
        <Text style={styles.text} numberOfLines={2}>
          {getDisplayText()}
        </Text>
      </View>
      
      <View style={styles.actions}>
        {walletSupported && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => addToWallet(data)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="wallet-outline" size={20} color={Colors.success} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="share-outline" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onFavoritePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={20}
            color={isFavorite ? Colors.warning : Colors.textMuted}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDeletePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    overflow: 'hidden',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 4,
    alignSelf: 'stretch',
  },
  qrPreview: {
    padding: Spacing.sm,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: BorderRadius.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    ...Typography.small,
  },
  text: {
    ...Typography.body,
    color: Colors.text,
  },
  actions: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
});
