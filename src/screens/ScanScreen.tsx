import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { ScanResult } from '../components';
import { parseQRContent, addToHistory, getSettings, AppSettings } from '../utils';
import { QRCodeData } from '../types';
import { actionHubApi } from '../services/api';
import { ScanExecuteResponse } from '../types/actionHub';
import { SMART_QR_ENABLED } from '../config/features';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export function ScanScreen() {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState<QRCodeData | null>(null);
  const [executingActionHub, setExecutingActionHub] = useState(false);
  const [actionHubResult, setActionHubResult] = useState<ScanExecuteResponse | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  // Load settings when screen focuses
  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const settings = await getSettings();
        setAppSettings(settings);
        if (!settingsLoaded) {
          setCameraActive(settings.autoOpenCamera);
          setFlashOn(settings.autoFlash);
          setSettingsLoaded(true);
        }
      };
      loadSettings();
      
      // Cleanup: Stop camera when screen loses focus
      return () => {
        setCameraActive(false);
        setFlashOn(false);
      };
    }, [settingsLoaded])
  );

  const handleBarCodeScanned = async (scanResult: any) => {
    if (scanned) return;
    
    // Use 'raw' property for full data, fallback to 'data' if raw is not available
    const rawData = scanResult.raw || scanResult.data || '';
    
    console.log('=== QR SCAN DEBUG ===');
    console.log('Barcode type:', scanResult.type);
    console.log('Raw data length:', rawData.length);
    console.log('Raw data:', rawData);
    console.log('Detected type:', scanResult.extra?.type);
    
    setScanned(true);
    setFlashOn(false); // Turn off flash when QR is scanned
    
    const parsedData = parseQRContent(rawData);
    console.log('Parsed QR type:', parsedData.type);
    console.log('Parsed QR data:', JSON.stringify(parsedData, null, 2));
    
    setScanData(parsedData);
    
    // Auto copy to clipboard if enabled
    if (appSettings?.autoCopyToClipboard) {
      await Clipboard.setStringAsync(rawData);
    }
    
    // If it's an Action Hub QR code, execute the scan (don't save to history)
    console.log('[ActionHub] Checking if actionhub type:', parsedData.type);
    console.log('[ActionHub] actionHubCode:', parsedData.parsed.actionHubCode);
    if (SMART_QR_ENABLED && parsedData.type === 'actionhub' && parsedData.parsed.actionHubCode) {
      console.log('[ActionHub] Calling executeActionHubScan...');
      executeActionHubScan(parsedData.parsed.actionHubCode);
    } else {
      // Only save non-Action Hub QR codes to history
      await addToHistory(parsedData, 'scan');
      console.log('[ActionHub] NOT an actionhub QR or missing code');
    }
  };

  const executeActionHubScan = async (code: string) => {
    console.log('[ActionHub] Starting scan for code:', code);
    setExecutingActionHub(true);
    setActionHubResult(null);
    
    try {
      // Step 1: GET - Fetch QR code info and configured actions
      console.log('[ActionHub] Step 1: Fetching QR code info...');
      const scanInfo = await actionHubApi.getScan(code);
      console.log('[ActionHub] QR code info:', JSON.stringify(scanInfo, null, 2));
      
      if (!scanInfo.success) {
        throw new Error('QR code not found or inactive');
      }
      
      // Step 2: POST - Execute actions with device metadata
      console.log('[ActionHub] Step 2: Executing actions...');
      const executeResponse = await actionHubApi.executeScan({
        code,
        metadata: {
          device: Platform.OS,
          userAgent: `QRMaster/1.0 ${Platform.OS}/${Platform.Version}`,
          // TODO: Add location if permission granted
          // latitude: location?.coords.latitude,
          // longitude: location?.coords.longitude,
        },
      });
      
      console.log('[ActionHub] Execute response:', JSON.stringify(executeResponse, null, 2));
      setActionHubResult(executeResponse);
      
      // Check if backend returned a redirect URL
      if (executeResponse.redirect) {
        let redirectUrl = executeResponse.redirect;
        
        // Ensure URL has a protocol
        if (!redirectUrl.match(/^https?:\/\//i)) {
          redirectUrl = 'https://' + redirectUrl;
        }
        
        console.log('[ActionHub] Redirecting to:', redirectUrl);
        
        // Show brief notification then redirect
        Alert.alert(
          'Action Hub ⚡',
          `${executeResponse.qrCode.name}\n\nOpening...`,
          [{ text: 'OK' }],
          { cancelable: true }
        );
        
        // Auto-open the redirect URL
        setTimeout(() => {
          Linking.openURL(redirectUrl);
        }, 500);
      } else if (executeResponse.actionsExecuted > 0) {
        Alert.alert(
          'Action Hub ⚡',
          `${executeResponse.qrCode.name}\n\n${executeResponse.actionsExecuted} action(s) executed!`
        );
      } else {
        Alert.alert(
          'Action Hub',
          `${executeResponse.qrCode.name}\n\nNo actions configured.`
        );
      }
    } catch (error: any) {
      console.error('[ActionHub] Scan failed:', error.message);
      Alert.alert(
        'Action Hub Error',
        error.message || 'Failed to process QR code.'
      );
    } finally {
      setExecutingActionHub(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanData(null);
    setActionHubResult(null);
    setCameraActive(true);
  };

  const handleStartCamera = () => {
    setCameraActive(true);
  };

  const handleStopCamera = () => {
    setCameraActive(false);
    setScanned(false);
    setScanData(null);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan QR codes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show start scanning button when camera is not active
  if (!cameraActive) {
    return (
      <View style={styles.container}>
        <View style={styles.startContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="qr-code-outline" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.startTitle}>QR-X</Text>
          <Text style={styles.startText}>
            Tap the button below to open the camera and scan a QR code
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartCamera}>
            <Ionicons name="scan-outline" size={24} color={Colors.text} />
            <Text style={styles.startButtonText}>Start Scanning</Text>
          </TouchableOpacity>
          <View style={styles.actionHubHint}>
            <Ionicons name="flash-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionHubHintText}>
              {SMART_QR_ENABLED ? 'Smart QR Actions are enabled.' : 'Smart QR Actions are coming soon.'}
              {' '}
              <Text style={styles.actionHubHintLink}>
                {SMART_QR_ENABLED ? 'Switch mode in Settings to use Action Hub.' : 'Stay tuned for the next release.'}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        flash={flashOn ? 'on' : 'off'}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'aztec', 'datamatrix', 'pdf417'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop}>
            <Text style={styles.instructionText}>
              Align QR code within the frame
            </Text>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleStopCamera}
            >
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Middle section with scan area */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanArea}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.overlayBottom}>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={() => setFlashOn(!flashOn)}
            >
              <Ionicons
                name={flashOn ? 'flash' : 'flash-outline'}
                size={28}
                color={flashOn ? Colors.warning : Colors.text}
              />
              <Text style={styles.flashText}>
                {flashOn ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Result Modal */}
      <Modal visible={scanned && scanData !== null} animationType="slide">
        {scanData && (
          <ScanResult
            data={scanData}
            onClose={handleScanAgain}
            onScanAgain={handleScanAgain}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  flashButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  flashText: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionTitle: {
    ...Typography.h2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    ...Typography.bodySecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  permissionButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  text: {
    ...Typography.body,
    textAlign: 'center',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  startTitle: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  startText: {
    ...Typography.bodySecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  startButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 18,
  },
  actionHubHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionHubHintText: {
    ...Typography.caption,
    flexShrink: 1,
  },
  actionHubHintLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
