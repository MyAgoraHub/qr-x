import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { QRCodeDisplay, saveQRCode, shareQRCode, Button } from '../components';
import { generateQRContent, addToHistory, parseQRContent } from '../utils';
import { QRContentType, ParsedQRData } from '../types';

type GeneratorTab = QRContentType;

interface TabItem {
  type: GeneratorTab;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { type: 'text', label: 'Text', icon: 'document-text-outline' },
  { type: 'url', label: 'URL', icon: 'link-outline' },
  { type: 'contact', label: 'Contact', icon: 'person-outline' },
  { type: 'wifi', label: 'WiFi', icon: 'wifi-outline' },
  { type: 'crypto', label: 'Crypto', icon: 'wallet-outline' },
  { type: 'email', label: 'Email', icon: 'mail-outline' },
  { type: 'phone', label: 'Phone', icon: 'call-outline' },
  { type: 'sms', label: 'SMS', icon: 'chatbubble-outline' },
];

export function GenerateScreen() {
  const [activeTab, setActiveTab] = useState<GeneratorTab>('text');
  const [formData, setFormData] = useState<ParsedQRData>({});
  const [qrValue, setQrValue] = useState<string>('');
  const [generated, setGenerated] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const updateFormData = (key: keyof ParsedQRData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setGenerated(false);
  };

  const handleGenerate = async () => {
    const content = generateQRContent(activeTab, formData);
    if (content) {
      setQrValue(content);
      setGenerated(true);
      
      // Add to history
      const parsed = parseQRContent(content);
      await addToHistory(parsed, 'generate');
      
      // Scroll down to show the QR code
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSave = async () => {
    await saveQRCode(viewShotRef);
  };

  const handleShare = async () => {
    await shareQRCode(viewShotRef);
  };

  const handleClear = () => {
    setFormData({});
    setQrValue('');
    setGenerated(false);
  };

  const handleTabChange = (type: GeneratorTab) => {
    setActiveTab(type);
    setFormData({});
    setQrValue('');
    setGenerated(false);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'text':
        return (
          <View style={styles.formContainer}>
            <FormInput
              label="Text Content"
              placeholder="Enter any text..."
              value={formData.text || ''}
              onChangeText={(value) => updateFormData('text', value)}
              multiline
            />
          </View>
        );

      case 'url':
        return (
          <View style={styles.formContainer}>
            <FormInput
              label="Website URL"
              placeholder="https://example.com"
              value={formData.url || ''}
              onChangeText={(value) => updateFormData('url', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        );

      case 'contact':
        return (
          <View style={styles.formContainer}>
            <FormInput
              label="Full Name"
              placeholder="John Doe"
              value={formData.contactName || ''}
              onChangeText={(value) => updateFormData('contactName', value)}
            />
            <FormInput
              label="Phone Number"
              placeholder="+1 234 567 8900"
              value={formData.contactPhone || ''}
              onChangeText={(value) => updateFormData('contactPhone', value)}
              keyboardType="phone-pad"
            />
            <FormInput
              label="Email"
              placeholder="john@example.com"
              value={formData.contactEmail || ''}
              onChangeText={(value) => updateFormData('contactEmail', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              label="Organization"
              placeholder="Company Name"
              value={formData.contactOrg || ''}
              onChangeText={(value) => updateFormData('contactOrg', value)}
            />
            <FormInput
              label="Job Title"
              placeholder="Software Engineer"
              value={formData.contactTitle || ''}
              onChangeText={(value) => updateFormData('contactTitle', value)}
            />
          </View>
        );

      case 'wifi':
        return (
          <View style={styles.formContainer}>
            <View style={styles.wifiNote}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.secondary} />
              <Text style={styles.wifiNoteText}>
                Enter your WiFi network name and password to create a shareable QR code
              </Text>
            </View>
            <FormInput
              label="Network Name (SSID)"
              placeholder="Enter your WiFi network name"
              value={formData.wifiSSID || ''}
              onChangeText={(value) => updateFormData('wifiSSID', value)}
            />
            <FormInput
              label="Password"
              placeholder="Enter WiFi password"
              value={formData.wifiPassword || ''}
              onChangeText={(value) => updateFormData('wifiPassword', value)}
              isPassword
            />
            <View style={styles.segmentContainer}>
              <Text style={styles.label}>Security Type</Text>
              <View style={styles.segmentButtons}>
                {(['WPA', 'WEP', 'nopass'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.segmentButton,
                      (formData.wifiType === type || (!formData.wifiType && type === 'WPA')) && styles.segmentButtonActive,
                    ]}
                    onPress={() => updateFormData('wifiType', type)}
                  >
                    <Text
                      style={[
                        styles.segmentButtonText,
                        formData.wifiType === type && styles.segmentButtonTextActive,
                      ]}
                    >
                      {type === 'nopass' ? 'None' : type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 'crypto':
        const CryptoForm = require('../components/forms/CryptoForm').default;
        return (
          <CryptoForm
            onDataChange={setFormData}
            initialData={formData}
          />
        );

      case 'email':
        return (
          <View style={styles.formContainer}>
            <FormInput
              label="Email Address"
              placeholder="recipient@example.com"
              value={formData.email || ''}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              label="Subject"
              placeholder="Email subject..."
              value={formData.emailSubject || ''}
              onChangeText={(value) => updateFormData('emailSubject', value)}
            />
            <FormInput
              label="Message"
              placeholder="Email body..."
              value={formData.emailBody || ''}
              onChangeText={(value) => updateFormData('emailBody', value)}
              multiline
            />
          </View>
        );

      case 'phone':
        return (
          <View style={styles.formContainer}>
            <FormInput
              label="Phone Number"
              placeholder="+1 234 567 8900"
              value={formData.phone || ''}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        );

      case 'sms':
        return (
          <View style={styles.formContainer}>
            <FormInput
              label="Phone Number"
              placeholder="+1 234 567 8900"
              value={formData.smsNumber || ''}
              onChangeText={(value) => updateFormData('smsNumber', value)}
              keyboardType="phone-pad"
            />
            <FormInput
              label="Message"
              placeholder="Your message..."
              value={formData.smsBody || ''}
              onChangeText={(value) => updateFormData('smsBody', value)}
              multiline
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section Header */}
        <Text style={styles.sectionTitle}>Select QR Type</Text>
        
        {/* Tab Selector - Grid Layout */}
        <View style={styles.tabsGrid}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.type}
              style={[
                styles.tab,
                activeTab === tab.type && styles.tabActive,
              ]}
              onPress={() => handleTabChange(tab.type)}
            >
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={activeTab === tab.type ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.type && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        {renderForm()}

        {/* Generate Button */}
        <View style={styles.generateButtonContainer}>
          <Button
            title={generated ? 'Regenerate QR Code' : 'Generate QR Code'}
            onPress={handleGenerate}
            size="large"
            icon={<Ionicons name="qr-code-outline" size={20} color={Colors.text} />}
          />
        </View>

        {/* QR Code Display */}
        {generated && qrValue && (
          <View style={styles.qrContainer}>
            <QRCodeDisplay
              ref={viewShotRef}
              value={qrValue}
              size={200}
            />
            
            <View style={styles.qrActions}>
              <TouchableOpacity style={styles.qrAction} onPress={handleSave}>
                <Ionicons name="download-outline" size={24} color={Colors.primary} />
                <Text style={styles.qrActionText}>Save</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.qrAction} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color={Colors.primary} />
                <Text style={styles.qrActionText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.qrAction} onPress={handleClear}>
                <Ionicons name="trash-outline" size={24} color={Colors.error} />
                <Text style={[styles.qrActionText, { color: Colors.error }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  isPassword?: boolean;
}

function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  isPassword = false,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={isPassword ? styles.passwordContainer : undefined}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            isPassword && styles.passwordInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={isPassword && !showPassword}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.h3,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
    minHeight: 48,
    width: '31%',
  },
  tabActive: {
    backgroundColor: Colors.primary + '20',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  tabText: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  formContainer: {
    padding: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
  },
  passwordToggle: {
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wifiNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.secondary + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  wifiNoteText: {
    flex: 1,
    color: Colors.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  segmentContainer: {
    marginBottom: Spacing.md,
  },
  segmentButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  segmentButtonText: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: Colors.primary,
  },
  generateButtonContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  qrContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.lg,
  },
  qrActions: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    gap: Spacing.xl,
  },
  qrAction: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qrActionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
});
