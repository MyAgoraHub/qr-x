import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { ParsedQRData } from '../../types';

interface LocationFormProps {
  onDataChange: (data: ParsedQRData) => void;
  initialData?: ParsedQRData;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationForm({ onDataChange, initialData }: LocationFormProps) {
  const [latitude, setLatitude] = useState<number | undefined>(initialData?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialData?.longitude);
  const [selectedPlace, setSelectedPlace] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      onDataChange({ latitude, longitude });
    }
  }, [latitude, longitude]);

  const handleUseDeviceLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow location access so QR-X can embed your coordinates.'
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      setSelectedPlace('Current Location');
      setSearchResults([]);
    } catch {
      Alert.alert('Error', 'Could not get your location. Try searching for a place instead.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'QR-X App (com.qrx.app)',
            Accept: 'application/json',
          },
        }
      );
      const data: NominatimResult[] = await response.json();
      if (data.length === 0) {
        Alert.alert('No Results', 'No locations found — try a different search term.');
      }
      setSearchResults(data);
    } catch {
      Alert.alert('Search Failed', 'Could not search locations. Check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: NominatimResult) => {
    setLatitude(parseFloat(result.lat));
    setLongitude(parseFloat(result.lon));
    setSelectedPlace(result.display_name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const hasCoords = latitude !== undefined && longitude !== undefined;

  return (
    <View style={styles.container}>
      {/* GPS button */}
      <TouchableOpacity
        style={[styles.gpsButton, isFetchingLocation && styles.gpsButtonDisabled]}
        onPress={handleUseDeviceLocation}
        disabled={isFetchingLocation}
      >
        {isFetchingLocation ? (
          <ActivityIndicator size="small" color={Colors.text} />
        ) : (
          <Ionicons name="navigate-outline" size={20} color={Colors.text} />
        )}
        <Text style={styles.gpsButtonText}>
          {isFetchingLocation ? 'Getting Location…' : 'Use My Current Location'}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>or search a place</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Search row */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholder="City, address or landmark…"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color={Colors.text} />
          ) : (
            <Ionicons name="search-outline" size={20} color={Colors.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search results */}
      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={result.place_id}
              style={[
                styles.resultItem,
                index === searchResults.length - 1 && styles.resultItemLast,
              ]}
              onPress={() => handleSelectResult(result)}
            >
              <Ionicons name="location-outline" size={16} color={Colors.primary} />
              <Text style={styles.resultText} numberOfLines={2}>
                {result.display_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Selected location preview */}
      {hasCoords ? (
        <View style={styles.coordsBox}>
          <View style={styles.coordsHeader}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.coordsTitle} numberOfLines={1}>
              {selectedPlace || 'Selected Location'}
            </Text>
          </View>
          <Text style={styles.coordsText}>
            {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
          </Text>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="location-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No location selected yet</Text>
        </View>
      )}

      <Text style={styles.hint}>
        📍 Only coordinates are stored — no map images or addresses leave your device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  gpsButtonDisabled: {
    opacity: 0.6,
  },
  gpsButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerLabel: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  resultsContainer: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultItemLast: {
    borderBottomWidth: 0,
  },
  resultText: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  coordsBox: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  coordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  coordsTitle: {
    flex: 1,
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  coordsText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  emptyBox: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  hint: {
    marginTop: Spacing.lg,
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
