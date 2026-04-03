import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

interface PrivacyPolicyScreenProps {
  onClose: () => void;
}

export function PrivacyPolicyScreen({ onClose }: PrivacyPolicyScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>
        
        <Section title="1. Introduction">
          QR-X ("we", "our", or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and safeguard your information 
          when you use our mobile application.
        </Section>

        <Section title="2. Information We Collect">
          <BulletPoint>Camera Access: We access your device camera solely to scan QR codes. Camera data is processed locally and never transmitted to our servers.</BulletPoint>
          <BulletPoint>Contacts Access: If you choose to save contact information from QR codes, we request access to your contacts. This data remains on your device.</BulletPoint>
          <BulletPoint>Storage Access: We access device storage to save generated QR code images when you choose to save them.</BulletPoint>
          <BulletPoint>Scan History: Your scan history is stored locally on your device and is not transmitted to any external servers.</BulletPoint>
        </Section>

        <Section title="3. Advertising">
          Our app displays advertisements provided by third-party advertising networks. 
          These networks may collect certain information about your device and app usage 
          to serve relevant ads. This may include:
          {'\n\n'}
          <BulletPoint>Device identifiers (such as advertising ID)</BulletPoint>
          <BulletPoint>General location information</BulletPoint>
          <BulletPoint>App usage data</BulletPoint>
          {'\n'}
          You can opt out of personalized advertising through your device settings.
        </Section>

        <Section title="4. Data Storage">
          All user data, including scan history and generated QR codes, is stored 
          locally on your device. We do not maintain servers that store your personal 
          data. If you uninstall the app, all locally stored data will be deleted.
        </Section>

        <Section title="5. Third-Party Services">
          Our app may contain links to external websites or services through QR codes 
          you scan. We are not responsible for the privacy practices of these external 
          sites. We encourage you to review the privacy policies of any website you visit.
        </Section>

        <Section title="6. Data Security">
          We implement appropriate security measures to protect your information. 
          Since all data is stored locally on your device, security is primarily 
          dependent on your device's security settings.
        </Section>

        <Section title="7. Children's Privacy">
          Our app is not intended for children under 13 years of age. We do not 
          knowingly collect personal information from children under 13.
        </Section>

        <Section title="8. Your Rights">
          You have the right to:
          {'\n\n'}
          <BulletPoint>Access your scan history within the app</BulletPoint>
          <BulletPoint>Delete your scan history at any time through Settings</BulletPoint>
          <BulletPoint>Revoke app permissions through your device settings</BulletPoint>
        </Section>

        <Section title="9. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you 
          of any changes by updating the "Last Updated" date at the top of this policy.
        </Section>

        <Section title="10. Contact Us">
          If you have questions about this Privacy Policy, please contact us at:
          {'\n'}team.agora.hub@gmail.com
        </Section>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{children}</Text>
    </View>
  );
}

function BulletPoint({ children }: { children: React.ReactNode }) {
  return (
    <Text style={styles.bulletPoint}>• {children}</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginLeft: Spacing.sm,
  },
  bottomPadding: {
    height: 40,
  },
});
