import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Colors, Spacing, Typography, BorderRadius } from '../theme';
import { HistoryCard, ScanResult } from '../components';
import {
  getHistory,
  toggleFavorite,
  deleteFromHistory,
  clearHistory,
} from '../utils';
import { HistoryItem, QRCodeData, QRContentType } from '../types';

type FilterType = 'all' | 'scanned' | 'generated' | 'favorites';
type CategoryFilter = 'all' | QRContentType;

export function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QRCodeData | null>(null);
  const [qrPreviewItem, setQrPreviewItem] = useState<HistoryItem | null>(null);
  const qrViewShotRef = useRef<ViewShot>(null);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleFavorite = async (id: string) => {
    await toggleFavorite(id);
    await loadHistory();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteFromHistory(id);
            await loadHistory();
          },
        },
      ]
    );
  };

  const handleShareQR = async () => {
    try {
      if (qrViewShotRef.current?.capture) {
        const uri = await qrViewShotRef.current.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share QR Code',
          });
        }
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleSaveQR = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save QR codes');
        return;
      }

      if (qrViewShotRef.current?.capture) {
        const uri = await qrViewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Saved!', 'QR code saved to your gallery');
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep Favorites',
          onPress: async () => {
            await clearHistory(true);
            await loadHistory();
          },
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearHistory(false);
            await loadHistory();
          },
        },
      ]
    );
  };

  const filteredHistory = history.filter((item) => {
    // Apply source filter
    let matchesSource = true;
    switch (filter) {
      case 'scanned':
        matchesSource = item.source === 'scan';
        break;
      case 'generated':
        matchesSource = item.source === 'generate';
        break;
      case 'favorites':
        matchesSource = item.isFavorite;
        break;
      default:
        matchesSource = true;
    }

    // Apply category filter
    const matchesCategory = categoryFilter === 'all' || item.data.type === categoryFilter;

    return matchesSource && matchesCategory;
  }).sort((a, b) => {
    // Sort by date, newest first
    const dateA = a.data.scannedAt ? new Date(a.data.scannedAt).getTime() : 0;
    const dateB = b.data.scannedAt ? new Date(b.data.scannedAt).getTime() : 0;
    return dateB - dateA;
  });

  const FilterButton = ({
    type,
    label,
    icon,
  }: {
    type: FilterType;
    label: string;
    icon: string;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === type && styles.filterButtonActive]}
      onPress={() => setFilter(type)}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={filter === type ? Colors.primary : Colors.textMuted}
      />
      <Text
        style={[
          styles.filterButtonText,
          filter === type && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CategoryButton = ({
    type,
    label,
    icon,
  }: {
    type: CategoryFilter;
    label: string;
    icon: string;
  }) => (
    <TouchableOpacity
      style={[styles.categoryButton, categoryFilter === type && styles.categoryButtonActive]}
      onPress={() => setCategoryFilter(type)}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={categoryFilter === type ? Colors.primary : Colors.textMuted}
      />
      <Text
        style={[
          styles.categoryButtonText,
          categoryFilter === type && styles.categoryButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>History</Text>
          {history.length > 0 && (
            <Text style={styles.subtitle}>
              {filteredHistory.length} {filteredHistory.length === 1 ? 'item' : 'items'}
              {filteredHistory.length !== history.length && ` of ${history.length}`}
            </Text>
          )}
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton type="scanned" label="Scanned" icon="scan-outline" />
        <FilterButton type="generated" label="Created" icon="create-outline" />
        <FilterButton type="favorites" label="Favorites" icon="star-outline" />
      </View>

      {/* Category Filters */}
      <View style={styles.categoryContainer}>
        <CategoryButton type="all" label="All" icon="grid-outline" />
        <CategoryButton type="url" label="URL" icon="link-outline" />
        <CategoryButton type="contact" label="Contact" icon="person-outline" />
        <CategoryButton type="wifi" label="WiFi" icon="wifi-outline" />
        <CategoryButton type="geo" label="Location" icon="location-outline" />
        <CategoryButton type="calendar" label="Event" icon="calendar-outline" />
        <CategoryButton type="crypto" label="Crypto" icon="wallet-outline" />
        <CategoryButton type="text" label="Text" icon="document-text-outline" />
      </View>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={
              filter === 'favorites'
                ? 'star-outline'
                : filter === 'scanned'
                ? 'scan-outline'
                : filter === 'generated'
                ? 'create-outline'
                : 'time-outline'
            }
            size={64}
            color={Colors.textMuted}
          />
          <Text style={styles.emptyTitle}>
            {filter === 'favorites'
              ? 'No Favorites Yet'
              : filter === 'scanned'
              ? 'No Scanned Codes'
              : filter === 'generated'
              ? 'No Generated Codes'
              : 'No History Yet'}
          </Text>
          <Text style={styles.emptyText}>
            {filter === 'favorites'
              ? 'Star items to add them to your favorites'
              : filter === 'scanned'
              ? 'Scanned QR codes will appear here'
              : filter === 'generated'
              ? 'Generated QR codes will appear here'
              : 'Your scanned and generated QR codes will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onPress={() => setQrPreviewItem(item)}
              onFavoritePress={() => handleFavorite(item.id)}
              onDeletePress={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {/* QR Preview Modal */}
      <Modal 
        visible={qrPreviewItem !== null} 
        animationType="fade"
        transparent={true}
        onRequestClose={() => setQrPreviewItem(null)}
      >
        {qrPreviewItem && (
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModalContent}>
              {/* Close Button */}
              <TouchableOpacity 
                style={styles.qrModalClose}
                onPress={() => setQrPreviewItem(null)}
              >
                <Ionicons name="close" size={28} color={Colors.text} />
              </TouchableOpacity>

              {/* QR Code */}
              <ViewShot ref={qrViewShotRef} options={{ format: 'png', quality: 1 }}>
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={qrPreviewItem.data.raw || ' '}
                    size={qrSize}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
              </ViewShot>

              {/* Content Preview */}
              <Text style={styles.qrModalLabel} numberOfLines={2}>
                {qrPreviewItem.data.raw}
              </Text>

              {/* Action Buttons */}
              <View style={styles.qrModalActions}>
                <TouchableOpacity 
                  style={styles.qrModalButton}
                  onPress={handleShareQR}
                >
                  <Ionicons name="share-outline" size={24} color={Colors.primary} />
                  <Text style={styles.qrModalButtonText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.qrModalButton}
                  onPress={handleSaveQR}
                >
                  <Ionicons name="download-outline" size={24} color={Colors.primary} />
                  <Text style={styles.qrModalButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.qrModalButton}
                  onPress={() => {
                    setSelectedItem(qrPreviewItem.data);
                    setQrPreviewItem(null);
                  }}
                >
                  <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
                  <Text style={styles.qrModalButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal visible={selectedItem !== null} animationType="slide">
        {selectedItem && (
          <ScanResult
            data={selectedItem}
            onClose={() => setSelectedItem(null)}
            onScanAgain={() => setSelectedItem(null)}
          />
        )}
      </Modal>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const qrSize = Math.min(screenWidth * 0.65, 280);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.primary,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: Colors.primary,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodySecondary,
    textAlign: 'center',
  },
  // QR Preview Modal Styles
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '85%',
    maxWidth: 360,
  },
  qrModalClose: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
    zIndex: 1,
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  qrModalLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  qrModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  qrModalButton: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  qrModalButtonText: {
    ...Typography.small,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
});
