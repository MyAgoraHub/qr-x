import React, { useRef } from 'react';
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
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { copyToClipboard, openURL } from '../utils/actions';
import { CRYPTO_DONATIONS } from '../config/donations';

interface DonationCryptoScreenProps {
  onClose: () => void;
}

export function DonationCryptoScreen({ onClose }: DonationCryptoScreenProps) {
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  const viewShotRefs = useRef<(ViewShot | null)[]>(new Array(CRYPTO_DONATIONS.length).fill(null));

  const handleCopyAddress = async (address: string, symbol: string) => {
    try {
      await copyToClipboard(address);
      Alert.alert(`${symbol} Copied`, 'Address copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const handleShareQR = async (index: number, address: string, symbol: string) => {
    try {
      if (viewShotRefs.current[index]?.capture) {
        const uri = await viewShotRefs.current[index]!.capture();
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: `Share ${symbol} Donation QR`,
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
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
        <Text style={styles.title}>Crypto Donations</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Choose a cryptocurrency</Text>
          <Text style={styles.introText}>
            Select your preferred coin to send a donation. Copy the address or scan the QR code with your wallet.
          </Text>
        </View>

        {/* Crypto Cards */}
        {CRYPTO_DONATIONS.map((crypto, index) => (
          <View key={index}>
            <TouchableOpacity
              style={[
                styles.cryptoCard,
                expandedIndex === index && styles.cryptoCardExpanded,
              ]}
              onPress={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Ionicons
                    name={crypto.icon as any}
                    size={28}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
                  <Text style={styles.cryptoName}>{crypto.name}</Text>
                </View>
                <Ionicons
                  name={
                    expandedIndex === index
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={24}
                  color={Colors.textMuted}
                />
              </View>

              {/* Expanded Content */}
              {expandedIndex === index && (
                <View style={styles.cardExpanded}>
                  {/* QR Code */}
                  <View style={styles.qrSection}>
                    <Text style={styles.addressLabel}>Address QR Code</Text>
                    <ViewShot
                      ref={(ref) => {
                        if (ref !== null) {
                          viewShotRefs.current[index] = ref;
                        }
                      }}
                      options={{ format: 'png', quality: 1 }}
                    >
                      <View style={styles.qrContainer}>
                        <QRCode
                          value={crypto.address}
                          size={160}
                          backgroundColor="white"
                          color="black"
                        />
                      </View>
                    </ViewShot>
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={() =>
                        handleShareQR(index, crypto.address, crypto.symbol)
                      }
                    >
                      <Ionicons
                        name="share-social-outline"
                        size={18}
                        color={Colors.text}
                      />
                      <Text style={styles.shareButtonText}>Share QR</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Address Display */}
                  <View style={styles.addressSection}>
                    <Text style={styles.addressLabel}>Wallet Address</Text>
                    <View style={styles.addressBox}>
                      <Text
                        style={styles.addressText}
                        numberOfLines={2}
                        selectable
                      >
                        {crypto.address}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() =>
                        handleCopyAddress(crypto.address, crypto.symbol)
                      }
                    >
                      <Ionicons
                        name="copy-outline"
                        size={18}
                        color={Colors.text}
                      />
                      <Text style={styles.copyButtonText}>Copy Address</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Info */}
                  <View style={styles.infoBox}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={Colors.textMuted}
                    />
                    <Text style={styles.infoText}>
                      Send any amount to this address. Your wallet will confirm
                      the transaction.
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}

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
  cryptoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cryptoCardExpanded: {
    borderColor: Colors.primary + '60',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cryptoSymbol: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  cryptoName: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  cardExpanded: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginVertical: Spacing.sm,
  },
  addressLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  shareButtonText: {
    ...Typography.small,
    color: Colors.text,
    fontWeight: '600',
  },
  addressSection: {
    gap: Spacing.sm,
  },
  addressBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  copyButtonText: {
    ...Typography.small,
    color: Colors.text,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoText: {
    ...Typography.small,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: Spacing.lg,
  },
});
