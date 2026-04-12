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
import { SMART_QR_ENABLED } from '../config/features';
import { DonationScreen } from './DonationScreen';
import { DonationCryptoScreen } from './DonationCryptoScreen';
import { DonationFiatScreen } from './DonationFiatScreen';

export function SettingsScreen() {
  const { appMode, setAppMode } = useAppMode();
  const navigation = useNavigation<any>();
  const [showDonation, setShowDonation] = useState(false);
  const [showDonationCrypto, setShowDonationCrypto] = useState(false);
  const [showDonationFiat, setShowDonationFiat] = useState(false);
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
    const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.qrx.app';
    Alert.alert(
      'Enjoying QR-X? ⭐',
      'Your rating helps us grow and improve. It only takes a second!',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Rate on Play Store',
          onPress: () =>
            Linking.openURL(PLAY_STORE_URL).catch(() =>
              Alert.alert('Error', 'Unable to open the Play Store. Please try again later.')
            ),
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://myagorahub.github.io/qr-x-wiki/legal/privacy-policy');
  };


  const handleDonate = () => {
    setShowDonation(true);
  };

  const handleDonationCrypto = () => {
    setShowDonation(false);
    setShowDonationCrypto(true);
  };

  const handleDonationFiat = () => {
    setShowDonation(false);
    setShowDonationFiat(true);
  };

  const closeDonationScreens = () => {
    setShowDonation(false);
    setShowDonationCrypto(false);
    setShowDonationFiat(false);
  };
  const handleTermsOfService = () => {
    Linking.openURL('https://myagorahub.github.io/qr-x-wiki/legal/terms-of-service');
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
        <View style={styles.versionBadge}>
          <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
          <Text style={styles.versionBadgeText}>
            v{Constants.expoConfig?.version || '1.0.0'}
          </Text>
        </View>
        <View style={styles.buildInfoRow}>
          <Text style={styles.buildInfoText}>
            Build {Application.nativeBuildVersion || '1'}
          </Text>
          <View style={styles.buildInfoDot} />
          <Text style={styles.buildInfoText}>Android</Text>
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
          <View
            style={[
              styles.modeCard,
              appMode === 'actionhub' && styles.modeCardActive,
              !SMART_QR_ENABLED && styles.modeCardDisabled,
            ]}
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
            {!SMART_QR_ENABLED && (
              <View style={styles.comingSoonPill}>
                <Text style={styles.comingSoonText}>COMING SOON</Text>
              </View>
            )}
          </View>
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
          onPress={() => Linking.openURL('https://myagorahub.github.io/qr-x-wiki/')}
        />
      </SettingsSection>

      <SettingsSection title="Support Us">
        <SettingsItem
          icon="heart-outline"
          label="Donate"
          onPress={handleDonate}
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

      {/* Donation Options Modal */}
      <Modal
        visible={showDonation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDonation(false)}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <DonationScreen
            onClose={() => setShowDonation(false)}
            onSelectCrypto={handleDonationCrypto}
            onSelectFiat={handleDonationFiat}
          />
        </View>
      </Modal>

      {/* Donation Crypto Modal */}
      <Modal
        visible={showDonationCrypto}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => closeDonationScreens()}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <DonationCryptoScreen onClose={() => closeDonationScreens()} />
        </View>
      </Modal>

      {/* Donation Fiat Modal */}
      <Modal
        visible={showDonationFiat}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => closeDonationScreens()}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <DonationFiatScreen onClose={() => closeDonationScreens()} />
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
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '18',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  versionBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  buildInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  buildInfoText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  buildInfoDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
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
  modeCardDisabled: {
    opacity: 0.7,
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
  comingSoonPill: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.warning + '2A',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.warning,
    letterSpacing: 0.7,
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
