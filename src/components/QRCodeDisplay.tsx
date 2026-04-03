import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
  logo?: any;
  logoSize?: number;
  onCapture?: (uri: string) => void;
}

export const QRCodeDisplay = React.forwardRef<ViewShot, QRCodeDisplayProps>(
  (
    {
      value,
      size = 200,
      backgroundColor = '#FFFFFF',
      color = '#000000',
      logo,
      logoSize = 40,
    },
    ref
  ) => {
    return (
      <ViewShot
        ref={ref}
        options={{ format: 'png', quality: 1 }}
        style={styles.container}
      >
        <View style={[styles.qrWrapper, { backgroundColor }]}>
          <QRCode
            value={value || ' '}
            size={size}
            backgroundColor={backgroundColor}
            color={color}
            logo={logo}
            logoSize={logoSize}
            logoBackgroundColor={backgroundColor}
          />
        </View>
      </ViewShot>
    );
  }
);

export async function saveQRCode(viewShotRef: React.RefObject<ViewShot | null>): Promise<boolean> {
  console.log('[SaveQR] Starting save process...');
  try {
    if (!viewShotRef.current?.capture) {
      console.error('[SaveQR] ViewShot ref not available');
      Alert.alert('Error', 'Unable to capture QR code');
      return false;
    }

    console.log('[SaveQR] Capturing QR code...');
    const uri = await viewShotRef.current.capture();
    console.log('[SaveQR] Captured URI:', uri);

    // Try to save directly to library
    try {
      console.log('[SaveQR] Requesting media library permissions...');
      const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
      console.log('[SaveQR] Permission status:', status, 'canAskAgain:', canAskAgain);
      
      if (status === 'granted') {
        console.log('[SaveQR] Saving to library...');
        const asset = await MediaLibrary.saveToLibraryAsync(uri);
        console.log('[SaveQR] Saved successfully:', asset);
        Alert.alert('Saved!', 'QR code saved to your gallery');
        return true;
      }
    } catch (mediaError: any) {
      console.log('[SaveQR] Media library error, falling back to share:', mediaError?.message);
      // Fall through to share fallback
    }

    // Fallback: Use share functionality (works in Expo Go)
    console.log('[SaveQR] Using share fallback...');
    if (await Sharing.isAvailableAsync()) {
      Alert.alert(
        'Save via Share',
        'Due to Expo Go limitations, use the share menu to save the image. Select "Save Image" or "Download" from the options.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share to Save', 
            onPress: async () => {
              await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Save QR Code - Select "Save Image"',
              });
            }
          }
        ]
      );
      return true;
    } else {
      Alert.alert(
        'Permission Required', 
        'Please create a development build to enable saving QR codes directly. For now, use the Share button instead.'
      );
      return false;
    }
  } catch (error: any) {
    console.error('[SaveQR] Error:', error);
    console.error('[SaveQR] Error message:', error?.message);
    Alert.alert('Error', `Failed to save QR code: ${error?.message || 'Unknown error'}`);
    return false;
  }
}

export async function shareQRCode(viewShotRef: React.RefObject<ViewShot | null>): Promise<boolean> {
  try {
    if (!viewShotRef.current?.capture) {
      Alert.alert('Error', 'Unable to capture QR code');
      return false;
    }

    const uri = await viewShotRef.current.capture();
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share QR Code',
      });
      return true;
    } else {
      Alert.alert('Sharing not available', 'Sharing is not available on this device');
      return false;
    }
  } catch (error) {
    console.error('Error sharing QR code:', error);
    Alert.alert('Error', 'Failed to share QR code');
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
});
