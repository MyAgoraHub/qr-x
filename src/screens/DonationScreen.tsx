import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

interface DonationScreenProps {
  onClose: () => void;
  onSelectCrypto: () => void;
  onSelectFiat: () => void;
}

export function DonationScreen({
  onClose,
  onSelectCrypto,
  onSelectFiat,
}: DonationScreenProps) {
  const insets = useSafeAreaInsets();

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
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Support & Donate</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Ionicons name="heart" size={48} color={Colors.warning} />
          <Text style={styles.welcomeTitle}>Help Us Keep Growing</Text>
          <Text style={styles.welcomeText}>
            QR-X is built with care and maintained ad-free, thanks to people like you.
            Every contribution helps us improve features, fix bugs, and keep the app free
            for everyone.
          </Text>
        </View>

        {/* Donation Options */}
        <Text style={styles.sectionTitle}>Choose Your Method</Text>

        {/* Crypto Option */}
        <TouchableOpacity
          style={[styles.optionCard, styles.cryptoCard]}
          onPress={onSelectCrypto}
          activeOpacity={0.8}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="wallet-outline" size={32} color={Colors.text} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Crypto Donation</Text>
              <Text style={styles.optionDescription}>
                Bitcoin, Solana, USDT, Cardano, Dogecoin, Litecoin
              </Text>
              <Text style={styles.optionNote}>Instant · Low fees · Private</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {/* Fiat Option */}
        <TouchableOpacity
          style={[styles.optionCard, styles.fiatCard]}
          onPress={onSelectFiat}
          activeOpacity={0.8}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="card-outline" size={32} color={Colors.text} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Fiat Donation</Text>
              <Text style={styles.optionDescription}>
                PayPal, card, or bank transfer
              </Text>
              <Text style={styles.optionNote}>Multiple methods available</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {/* Footer Info */}
        <View style={styles.infoContainer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={Colors.success}
          />
          <Text style={styles.infoText}>
            All donations are secure and processed by trusted partners. No data is
            shared with third parties beyond what's necessary for payment processing.
          </Text>
        </View>
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
    padding: Spacing.md,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  welcomeTitle: {
    ...Typography.h2,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  optionCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cryptoCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary + '40',
  },
  fiatCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.secondary + '40',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  optionNote: {
    ...Typography.small,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  infoContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  infoText: {
    ...Typography.small,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
