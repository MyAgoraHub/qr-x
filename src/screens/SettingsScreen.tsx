import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius } from '../theme';
import { clearHistory, getSettings, saveSettings, AppSettings } from '../utils';
import { useAppMode } from '../context';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './TermsOfServiceScreen';

export function SettingsScreen() {
  const { appMode, setAppMode } = useAppMode();
  const navigation = useNavigation<any>();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    autoOpenCamera: false,
    autoFlash: false,
    autoCopyToClipboard: false,
    appMode: 'qrx',
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await getSettings();
    setSettings(loaded);
  };

  const handleToggleSetting = async (key: keyof AppSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await saveSettings({ [key]: value });
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your scan history and generated QR codes. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearHistory(false);
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    // Play Store URL for QR-X
    const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.qrx.app';
    
    Linking.canOpenURL(PLAY_STORE_URL)
      .then((supported) => {
        if (supported) {
          Linking.openURL(PLAY_STORE_URL);
        } else {
          Alert.alert(
            'Rate App', 
            'Unable to open Play Store. The app will be available soon!'
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'Rate App',
          'Unable to open Play Store. Thank you for your support!'
        );
      });
  };

  const handlePrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  const handleTermsOfService = () => {
    setShowTermsOfService(true);
  };

  const SettingsSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingsItem = ({
    icon,
    label,
    value,
    onPress,
    danger = false,
    showArrow = true,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
          <Ionicons
            name={icon as any}
            size={20}
            color={danger ? Colors.error : Colors.primary}
          />
        </View>
        <Text style={[styles.settingsItemLabel, danger && styles.dangerText]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingsItemRight}>
        {value && <Text style={styles.settingsItemValue}>{value}</Text>}
        {onPress && showArrow && (
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.appIcon}>
          <Ionicons name="qr-code" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.appName}>QR-X</Text>
        <Text style={styles.appVersion}>
          Version {Constants.expoConfig?.version || '1.0.0'}
        </Text>
        <View style={styles.badgeRow}>
          {Constants.expoConfig?.extra?.isBeta && (
            <View style={[styles.badge, styles.badgeBeta]}>
              <Text style={styles.badgeText}>BETA</Text>
            </View>
          )}
          {Constants.expoConfig?.extra?.environment && (
            <View style={[styles.badge, styles.badgeEnv]}>
              <Text style={styles.badgeText}>
                {String(Constants.expoConfig.extra.environment).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <SettingsSection title="App Mode">
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeCard, appMode === 'qrx' && styles.modeCardActive]}
            onPress={async () => {
              await setAppMode('qrx');
              navigation.navigate('Scan');
            }}
          >
            <Ionicons
              name="qr-code"
              size={28}
              color={appMode === 'qrx' ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.modeCardTitle, appMode === 'qrx' && styles.modeCardTitleActive]}>
              QR-X
            </Text>
            <Text style={styles.modeCardSubtitle}>Scanner &amp; Generator</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeCard, appMode === 'actionhub' && styles.modeCardActive]}
            onPress={async () => {
              await setAppMode('actionhub');
              navigation.navigate('ActionHub');
            }}
          >
            <Ionicons
              name="flash"
              size={28}
              color={appMode === 'actionhub' ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.modeCardTitle, appMode === 'actionhub' && styles.modeCardTitleActive]}>
              Smart QR
            </Text>
            <Text style={styles.modeCardSubtitle}>Action Hub</Text>
          </TouchableOpacity>
        </View>
      </SettingsSection>

      <SettingsSection title="Scanner">
        <View style={styles.settingsItem}>
          <View style={styles.settingsItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.settingsItemLabel}>Auto-open Camera</Text>
          </View>
          <Switch
            value={settings.autoOpenCamera}
            onValueChange={(value) => handleToggleSetting('autoOpenCamera', value)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>
        <View style={styles.settingsItem}>
          <View style={styles.settingsItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="flashlight-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.settingsItemLabel}>Auto Flash</Text>
          </View>
          <Switch
            value={settings.autoFlash}
            onValueChange={(value) => handleToggleSetting('autoFlash', value)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>
        <View style={styles.settingsItem}>
          <View style={styles.settingsItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="copy-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.settingsItemLabel}>Auto Copy to Clipboard</Text>
          </View>
          <Switch
            value={settings.autoCopyToClipboard}
            onValueChange={(value) => handleToggleSetting('autoCopyToClipboard', value)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Data">
        <SettingsItem
          icon="cloud-download-outline"
          label="Export History"
          onPress={() => Alert.alert('Coming Soon', 'Export feature is coming soon!')}
        />
        <SettingsItem
          icon="trash-outline"
          label="Clear All Data"
          onPress={handleClearHistory}
          danger
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsItem
          icon="star-outline"
          label="Rate App"
          onPress={handleRateApp}
        />
        <SettingsItem
          icon="chatbubble-outline"
          label="Send Feedback"
          onPress={() => Linking.openURL('mailto:team.agora.hub@gmail.com')}
        />
        <SettingsItem
          icon="help-circle-outline"
          label="Help Center"
          onPress={() => Alert.alert('Coming Soon', 'Help center is coming soon!')}
        />
      </SettingsSection>

      <SettingsSection title="Legal">
        <SettingsItem
          icon="document-text-outline"
          label="Privacy Policy"
          onPress={handlePrivacyPolicy}
        />
        <SettingsItem
          icon="shield-outline"
          label="Terms of Service"
          onPress={handleTermsOfService}
        />
      </SettingsSection>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for QR enthusiasts</Text>
        <Text style={styles.footerCopyright}>© 2025 QR-X</Text>
      </View>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyPolicy}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyPolicy(false)}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <PrivacyPolicyScreen onClose={() => setShowPrivacyPolicy(false)} />
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsOfService}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsOfService(false)}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <TermsOfServiceScreen onClose={() => setShowTermsOfService(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  appVersion: {
    ...Typography.caption,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeBeta: {
    backgroundColor: Colors.warning + '30',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  badgeEnv: {
    backgroundColor: Colors.secondary + '20',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 0.8,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDanger: {
    backgroundColor: Colors.error + '20',
  },
  settingsItemLabel: {
    ...Typography.body,
  },
  dangerText: {
    color: Colors.error,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  settingsItemValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.xs,
  },
  modeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  modeCardTitle: {
    ...Typography.body,
    fontWeight: 'bold' as const,
    color: Colors.textSecondary,
  },
  modeCardTitleActive: {
    color: Colors.primary,
  },
  modeCardSubtitle: {
    ...Typography.small,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  footerCopyright: {
    ...Typography.small,
  },
});
