import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { copyToClipboard } from '../utils/actions';
import { FIAT_PROVIDERS, BANK_DETAILS } from '../config/donations';
import * as Linking from 'expo-linking';

interface DonationFiatScreenProps {
  onClose: () => void;
}

export function DonationFiatScreen({ onClose }: DonationFiatScreenProps) {
  const insets = useSafeAreaInsets();

  const handleOpenLink = async (url: string, name: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${name}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${name}`);
    }
  };

  const handleCopyField = async (value: string) => {
    try {
      await copyToClipboard(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy');
    }
  };

  const handleCopyAllDetails = async () => {
    const details = `
QR-X Donation - Bank Transfer Details
Account Holder: ${BANK_DETAILS.accountHolder}
Bank Name: ${BANK_DETAILS.bankName}
Account Number: ${BANK_DETAILS.accountNumber}
Reference: ${BANK_DETAILS.reference}
    `.trim();

    try {
      await copyToClipboard(details);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy details');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Fiat Donations</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Support with Card or Bank</Text>
          <Text style={styles.introText}>
            Choose from multiple payment methods to send a donation. All payments are secure and processed by trusted partners.
          </Text>
        </View>

        {/* Hosted Checkout Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hosted Payment</Text>
          <Text style={styles.sectionDescription}>
            Fast and secure payment through trusted providers
          </Text>

          {FIAT_PROVIDERS.map((provider, index) => (
            <TouchableOpacity
              key={index}
              style={styles.providerButton}
              onPress={() =>
                handleOpenLink(provider.url, provider.name)
              }
              activeOpacity={0.7}
            >
              <View style={styles.providerContent}>
                <View
                  style={[
                    styles.providerIconContainer,
                    { backgroundColor: provider.color + '25' },
                  ]}
                >
                  <Ionicons
                    name={provider.icon as any}
                    size={24}
                    color={provider.color}
                  />
                </View>
                <View style={styles.providerTextContainer}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.providerDesc}>
                    Open donation page
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward-outline"
                  size={20}
                  color={Colors.textMuted}
                />
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.infoBox}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={Colors.success}
            />
            <Text style={styles.infoText}>
              Powered by external providers to keep processing safe
            </Text>
          </View>
        </View>

        {/* Bank Transfer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Transfer</Text>
          <Text style={styles.sectionDescription}>
            Direct bank transfer (coming soon)
          </Text>

          <View style={styles.bankDetailsBox}>
            <View style={styles.bankDetailRow}>
              <View style={styles.bankDetailLabel}>
                <Text style={styles.bankLabel}>Account Holder</Text>
              </View>
              <TouchableOpacity
                style={styles.bankDetailValue}
                onPress={() =>
                  handleCopyField(BANK_DETAILS.accountHolder)
                }
              >
                <Text style={styles.bankValue}>
                  {BANK_DETAILS.accountHolder}
                </Text>
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.bankDetailRow}>
              <View style={styles.bankDetailLabel}>
                <Text style={styles.bankLabel}>Bank Name</Text>
              </View>
              <TouchableOpacity
                style={styles.bankDetailValue}
                onPress={() => handleCopyField(BANK_DETAILS.bankName)}
              >
                <Text style={styles.bankValue}>{BANK_DETAILS.bankName}</Text>
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.bankDetailRow}>
              <View style={styles.bankDetailLabel}>
                <Text style={styles.bankLabel}>Account Number</Text>
              </View>
              <TouchableOpacity
                style={styles.bankDetailValue}
                onPress={() =>
                  handleCopyField(BANK_DETAILS.accountNumber)
                }
              >
                <Text style={styles.bankValue}>
                  {BANK_DETAILS.accountNumber}
                </Text>
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.bankDetailRow}>
              <View style={styles.bankDetailLabel}>
                <Text style={styles.bankLabel}>Reference</Text>
              </View>
              <TouchableOpacity
                style={styles.bankDetailValue}
                onPress={() =>
                  handleCopyField(BANK_DETAILS.reference)
                }
              >
                <Text style={styles.bankValue}>{BANK_DETAILS.reference}</Text>
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.copyAllButton}
            onPress={handleCopyAllDetails}
          >
            <Ionicons name="copy-outline" size={18} color={Colors.text} />
            <Text style={styles.copyAllButtonText}>Copy All Details</Text>
          </TouchableOpacity>

          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>COMING SOON - Details for reference only</Text>
          </View>
        </View>

        {/* Thank You Message */}
        <View style={styles.thankYouContainer}>
          <Ionicons name="heart" size={28} color={Colors.warning} />
          <Text style={styles.thankYouText}>
            Thank you for supporting QR-X! Your contribution means everything.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.h3,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  introContainer: {
    marginBottom: Spacing.lg,
  },
  introTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  introText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.small,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  providerButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  providerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  providerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerTextContainer: {
    flex: 1,
  },
  providerName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerDesc: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  infoBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  infoText: {
    ...Typography.small,
    color: Colors.success,
    flex: 1,
    lineHeight: 18,
  },
  bankDetailsBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  bankDetailRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bankDetailLabel: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  bankLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  bankDetailValue: {
    flex: 1.5,
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bankValue: {
    ...Typography.small,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  copyAllButtonText: {
    ...Typography.small,
    color: Colors.text,
    fontWeight: '600',
  },
  comingSoonBadge: {
    backgroundColor: Colors.warning + '20',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  comingSoonText: {
    ...Typography.small,
    color: Colors.warning,
    fontWeight: '600',
  },
  thankYouContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  thankYouText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: Spacing.lg,
  },
});
