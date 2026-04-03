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

interface TermsOfServiceScreenProps {
  onClose: () => void;
}

export function TermsOfServiceScreen({ onClose }: TermsOfServiceScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>
        
        <Section title="1. Acceptance of Terms">
          By downloading, installing, or using QR-X ("the App"), you agree to be 
          bound by these Terms of Service. If you do not agree to these terms, please 
          do not use the App.
        </Section>

        <Section title="2. Description of Service">
          QR-X is a mobile application that allows users to:
          {'\n\n'}
          <BulletPoint>Scan QR codes and barcodes using your device camera</BulletPoint>
          <BulletPoint>Generate QR codes for various content types</BulletPoint>
          <BulletPoint>Save and share generated QR codes</BulletPoint>
          <BulletPoint>View scan and generation history</BulletPoint>
        </Section>

        <Section title="3. User Responsibilities">
          You agree to:
          {'\n\n'}
          <BulletPoint>Use the App only for lawful purposes</BulletPoint>
          <BulletPoint>Not use the App to create QR codes containing malicious content, links to harmful websites, or illegal material</BulletPoint>
          <BulletPoint>Not attempt to reverse engineer, modify, or tamper with the App</BulletPoint>
          <BulletPoint>Not use the App in any way that could damage or impair the service</BulletPoint>
        </Section>

        <Section title="4. Intellectual Property">
          The App and its original content, features, and functionality are owned by 
          QR-X and are protected by international copyright, trademark, and other 
          intellectual property laws. The App is provided under license, not sold.
        </Section>

        <Section title="5. QR Code Content">
          You are solely responsible for the content of QR codes you create using the App. 
          We do not monitor or control the content of user-generated QR codes. You warrant 
          that any content you create does not violate any applicable laws or third-party rights.
        </Section>

        <Section title="6. Advertisements">
          The App displays advertisements from third-party ad networks. By using the App, 
          you acknowledge and agree that:
          {'\n\n'}
          <BulletPoint>Advertisements may be displayed during app usage</BulletPoint>
          <BulletPoint>We are not responsible for the content of third-party advertisements</BulletPoint>
          <BulletPoint>Clicking on advertisements may redirect you to external websites</BulletPoint>
          <BulletPoint>Ad networks may collect certain data as described in our Privacy Policy</BulletPoint>
        </Section>

        <Section title="7. Third-Party Links">
          QR codes you scan may contain links to third-party websites or services. 
          We have no control over and assume no responsibility for the content, 
          privacy policies, or practices of any third-party sites or services. 
          You access third-party content at your own risk.
        </Section>

        <Section title="8. Disclaimer of Warranties">
          THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
          EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, 
          ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          {'\n\n'}
          We do not guarantee the accuracy of QR code scanning results. Always verify 
          important information independently.
        </Section>

        <Section title="9. Limitation of Liability">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS 
          OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, 
          GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
          {'\n\n'}
          <BulletPoint>Your use or inability to use the App</BulletPoint>
          <BulletPoint>Any content obtained from QR codes scanned through the App</BulletPoint>
          <BulletPoint>Unauthorized access to your data</BulletPoint>
          <BulletPoint>Any third-party conduct or content</BulletPoint>
        </Section>

        <Section title="10. Indemnification">
          You agree to indemnify and hold harmless QR-X and its affiliates from any 
          claims, damages, losses, or expenses arising from your use of the App or violation 
          of these Terms.
        </Section>

        <Section title="11. Modifications to Terms">
          We reserve the right to modify these Terms at any time. We will notify users of 
          significant changes by updating the app or through in-app notifications. Continued 
          use of the App after changes constitutes acceptance of the new Terms.
        </Section>

        <Section title="12. Termination">
          We may terminate or suspend your access to the App immediately, without prior 
          notice, for any reason, including breach of these Terms. Upon termination, 
          your right to use the App will cease immediately.
        </Section>

        <Section title="13. Governing Law">
          These Terms shall be governed by and construed in accordance with applicable laws, 
          without regard to conflict of law principles.
        </Section>

        <Section title="14. Severability">
          If any provision of these Terms is found to be unenforceable, the remaining 
          provisions will continue in full force and effect.
        </Section>

        <Section title="15. Contact Information">
          For questions about these Terms, please contact us at:
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
