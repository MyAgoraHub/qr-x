import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAuth } from '../context';
import { actionHubApi, API_CONFIG } from '../services/api';

/**
 * Generate the scan URL for an Action Hub QR code
 * This URL is what gets encoded in the QR code and works with ANY scanner
 */
function getQRCodeScanUrl(code: string): string {
  return `${API_CONFIG.SCAN_URL_BASE}${API_CONFIG.SCAN_URL_PATH}${code}`;
}
import { ActionHubQRCode, AnalyticsOverview, Action, ActionTypeInfo } from '../types/actionHub';

// ============ Auth Screen ============

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const { login, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    console.log('[AuthScreen] handleSubmit called, isLogin:', isLogin);
    setError('');
    
    if (!email || !password || (!isLogin && !username)) {
      console.log('[AuthScreen] Validation failed - missing fields');
      setError('Please fill in all fields');
      return;
    }

    console.log('[AuthScreen] Attempting auth with email:', email);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
      console.log('[AuthScreen] Auth successful, calling onAuthSuccess');
      onAuthSuccess();
    } catch (err: any) {
      console.error('[AuthScreen] Auth error:', err.message);
      if (err.message === 'UNAUTHORIZED') {
        setError('Unauthorized');
      } else {
        setError('Server error');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.authContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authHeader}>
          <Ionicons name="flash" size={60} color={Colors.primary} />
          <Text style={styles.authTitle}>Action Hub</Text>
          <Text style={styles.authSubtitle}>
            Create smart QR codes that trigger actions
          </Text>
        </View>

        <View style={styles.authForm}>
          <View style={styles.authTabs}>
            <TouchableOpacity
              style={[styles.authTab, isLogin && styles.authTabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.authTabText, isLogin && styles.authTabTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authTab, !isLogin && styles.authTabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.authTabText, !isLogin && styles.authTabTextActive]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={Colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.authButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <Text style={styles.authButtonText}>
                {isLogin ? 'Login' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============ Dashboard ============

interface DashboardProps {
  analytics: AnalyticsOverview | null;
  qrCodes: ActionHubQRCode[];
  onCreateQR: () => void;
  onSelectQR: (qr: ActionHubQRCode) => void;
  onRefresh: () => void;
  refreshing: boolean;
  loading: boolean;
}

function Dashboard({
  analytics,
  qrCodes,
  onCreateQR,
  onSelectQR,
  onRefresh,
  refreshing,
  loading,
}: DashboardProps) {
  const insets = useSafeAreaInsets();

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.dashboardContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.dashboardHeader}>
        <Text style={styles.sectionTitle}>Action Hub</Text>
        <TouchableOpacity style={styles.createButton} onPress={onCreateQR}>
          <Ionicons name="add" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Analytics Cards */}
      {analytics && (
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsRow}>
            <AnalyticsCard
              icon="qr-code"
              label="QR Codes"
              value={analytics.totalQRCodes}
              color={Colors.primary}
            />
            <AnalyticsCard
              icon="scan"
              label="Total Scans"
              value={analytics.totalScans}
              color={Colors.secondary}
            />
          </View>
          <View style={styles.analyticsRow}>
            <AnalyticsCard
              icon="time"
              label="Last 24h"
              value={analytics.scansLast24Hours}
              color={Colors.success}
            />
            <AnalyticsCard
              icon="flash"
              label="Active Actions"
              value={analytics.activeActions}
              color={Colors.warning}
            />
          </View>
        </View>
      )}

      {/* QR Code List */}
      <Text style={styles.listTitle}>Your QR Codes</Text>
      
      {qrCodes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="qr-code-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyStateText}>No QR codes yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first Action Hub QR code to get started
          </Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={onCreateQR}>
            <Ionicons name="add" size={20} color={Colors.text} />
            <Text style={styles.emptyStateButtonText}>Create QR Code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        qrCodes.map((qr) => (
          <QRCodeCard key={qr.id} qrCode={qr} onPress={() => onSelectQR(qr)} />
        ))
      )}
    </ScrollView>
  );
}

// ============ Analytics Card ============

interface AnalyticsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}

function AnalyticsCard({ icon, label, value, color }: AnalyticsCardProps) {
  return (
    <View style={[styles.analyticsCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.analyticsValue}>{value}</Text>
      <Text style={styles.analyticsLabel}>{label}</Text>
    </View>
  );
}

// ============ QR Code Card ============

interface QRCodeCardProps {
  qrCode: ActionHubQRCode;
  onPress: () => void;
}

function QRCodeCard({ qrCode, onPress }: QRCodeCardProps) {
  return (
    <TouchableOpacity style={styles.qrCard} onPress={onPress}>
      <View style={styles.qrCardLeft}>
        <View style={styles.qrPreview}>
          <QRCode
            value={getQRCodeScanUrl(qrCode.code)}
            size={50}
            backgroundColor={Colors.surface}
            color={Colors.text}
          />
        </View>
      </View>
      <View style={styles.qrCardContent}>
        <Text style={styles.qrCardName}>{qrCode.name}</Text>
        {qrCode.description && (
          <Text style={styles.qrCardDescription} numberOfLines={1}>
            {qrCode.description}
          </Text>
        )}
        <View style={styles.qrCardMeta}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: qrCode.is_active ? Colors.success + '20' : Colors.error + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: qrCode.is_active ? Colors.success : Colors.error }
            ]}>
              {qrCode.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <Text style={styles.qrCardCode}>{qrCode.code}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ============ Create QR Modal ============

interface CreateQRModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (qr: ActionHubQRCode) => void;
}

function CreateQRModal({ visible, onClose, onCreated }: CreateQRModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await actionHubApi.createQRCode({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onCreated(response.qrCode);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>New QR Code</Text>
          <TouchableOpacity onPress={handleCreate} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.modalCreate}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.inputLabel}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Front Door Doorbell"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional description..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              After creating, you can add actions like notifications, webhooks, or redirects.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ============ QR Detail Modal ============

interface QRDetailModalProps {
  visible: boolean;
  qrCode: ActionHubQRCode | null;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: (qr: ActionHubQRCode) => void;
}

function QRDetailModal({ visible, qrCode, onClose, onDeleted, onUpdated }: QRDetailModalProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [actionTypes, setActionTypes] = useState<ActionTypeInfo[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [showAddAction, setShowAddAction] = useState(false);
  const qrViewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (visible && qrCode) {
      loadActions();
      loadActionTypes();
    }
  }, [visible, qrCode]);

  const loadActions = async () => {
    if (!qrCode) return;
    setLoadingActions(true);
    try {
      const response = await actionHubApi.listActions(qrCode.id);
      setActions(response.actions);
    } catch (err) {
      console.error('Failed to load actions:', err);
    } finally {
      setLoadingActions(false);
    }
  };

  const loadActionTypes = async () => {
    try {
      const response = await actionHubApi.getActionTypes();
      setActionTypes(response.actionTypes);
    } catch (err) {
      console.error('Failed to load action types:', err);
    }
  };

  const handleToggleActive = async () => {
    if (!qrCode) return;
    try {
      const response = await actionHubApi.updateQRCode(qrCode.id, {
        is_active: !qrCode.is_active,
      });
      onUpdated(response.qrCode);
    } catch (err) {
      Alert.alert('Error', 'Failed to update QR code');
    }
  };

  const handleDelete = () => {
    if (!qrCode) return;
    Alert.alert(
      'Delete QR Code',
      'Are you sure you want to delete this QR code? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await actionHubApi.deleteQRCode(qrCode.id);
              onDeleted();
              onClose();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete QR code');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAction = (actionId: string) => {
    Alert.alert(
      'Delete Action',
      'Are you sure you want to delete this action?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await actionHubApi.deleteAction(actionId);
              loadActions();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete action');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      if (!qrViewShotRef.current?.capture) {
        Alert.alert('Error', 'Unable to capture QR code');
        return;
      }

      const uri = await qrViewShotRef.current.capture();
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Share QR Code: ${qrCode?.name}`,
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handlePrint = async () => {
    if (!qrCode) return;
    
    try {
      // First, capture the QR code as base64
      let qrImageBase64 = '';
      if (qrViewShotRef.current?.capture) {
        const uri = await qrViewShotRef.current.capture();
        // Read the file and convert to base64
        const response = await fetch(uri);
        const blob = await response.blob();
        qrImageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      
      // QR code size: 6cm for good scannability
      const qrSizeCm = 6;
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @page {
                size: auto;
                margin: 10mm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
              }
              .qr-container {
                text-align: center;
                padding: 20px;
                border: 2px dashed #ccc;
                border-radius: 12px;
                background: #fff;
              }
              .qr-code {
                width: ${qrSizeCm}cm;
                height: ${qrSizeCm}cm;
                margin: 0 auto 15px;
              }
              .qr-code img {
                width: 100%;
                height: 100%;
              }
              .qr-name {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 8px;
              }
              .qr-code-id {
                font-size: 12px;
                color: #666;
                font-family: monospace;
                background: #f5f5f5;
                padding: 4px 8px;
                border-radius: 4px;
              }
              .qr-description {
                font-size: 14px;
                color: #666;
                margin-top: 10px;
                max-width: 300px;
              }
              .scan-instruction {
                margin-top: 15px;
                font-size: 12px;
                color: #999;
              }
              .size-note {
                margin-top: 20px;
                font-size: 10px;
                color: #bbb;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-code">
                <img src="${qrImageBase64}" alt="QR Code" />
              </div>
              <div class="qr-name">${qrCode.name}</div>
              <div class="qr-code-id">${qrCode.code}</div>
              ${qrCode.description ? `<div class="qr-description">${qrCode.description}</div>` : ''}
              <div class="scan-instruction">Scan with QR-X app</div>
            </div>
            <div class="size-note">QR Code size: ${qrSizeCm}cm × ${qrSizeCm}cm</div>
          </body>
        </html>
      `;

      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.error('Error printing QR code:', error);
      Alert.alert('Error', 'Failed to print QR code');
    }
  };

  if (!qrCode) return null;

  const qrContent = getQRCodeScanUrl(qrCode.code);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{qrCode.name}</Text>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* QR Code Display */}
          <View style={styles.qrDisplayContainer}>
            <ViewShot
              ref={qrViewShotRef}
              options={{ format: 'png', quality: 1 }}
            >
              <View style={styles.qrDisplayWrapper}>
                <QRCode
                  value={qrContent}
                  size={180}
                  backgroundColor={Colors.text}
                  color={Colors.background}
                />
              </View>
            </ViewShot>
            <Text style={styles.qrCodeText}>{qrCode.code}</Text>
            
            {/* Share & Print Buttons */}
            <View style={styles.qrActionButtons}>
              <TouchableOpacity style={styles.qrActionButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={Colors.primary} />
                <Text style={styles.qrActionButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrActionButton} onPress={handlePrint}>
                <Ionicons name="print-outline" size={22} color={Colors.primary} />
                <Text style={styles.qrActionButtonText}>Print</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Toggle */}
          <TouchableOpacity style={styles.statusToggle} onPress={handleToggleActive}>
            <View>
              <Text style={styles.statusToggleLabel}>Status</Text>
              <Text style={styles.statusToggleValue}>
                {qrCode.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <View style={[
              styles.statusDot,
              { backgroundColor: qrCode.is_active ? Colors.success : Colors.error }
            ]} />
          </TouchableOpacity>

          {/* Description */}
          {qrCode.description && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{qrCode.description}</Text>
            </View>
          )}

          {/* Actions Section */}
          <View style={styles.actionsSection}>
            <View style={styles.actionsSectionHeader}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <TouchableOpacity 
                style={styles.addActionButton}
                onPress={() => setShowAddAction(true)}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
                <Text style={styles.addActionText}>Add</Text>
              </TouchableOpacity>
            </View>

            {loadingActions ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
            ) : actions.length === 0 ? (
              <View style={styles.noActionsContainer}>
                <Ionicons name="flash-outline" size={40} color={Colors.textMuted} />
                <Text style={styles.noActionsText}>No actions configured</Text>
                <Text style={styles.noActionsSubtext}>
                  Add actions to trigger when this QR is scanned
                </Text>
              </View>
            ) : (
              actions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onDelete={() => handleDeleteAction(action.id)}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Add Action Modal */}
        <AddActionModal
          visible={showAddAction}
          qrCodeId={qrCode.id}
          actionTypes={actionTypes}
          onClose={() => setShowAddAction(false)}
          onCreated={() => {
            setShowAddAction(false);
            loadActions();
          }}
        />
      </View>
    </Modal>
  );
}

// ============ Action Card ============

interface ActionCardProps {
  action: Action;
  onDelete: () => void;
}

function ActionCard({ action, onDelete }: ActionCardProps) {
  const getActionIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'webhook': return 'link';
      case 'push_notification': return 'notifications';
      case 'email': return 'mail';
      case 'sms': return 'chatbubble';
      case 'redirect': return 'arrow-forward';
      case 'custom': return 'code-slash';
      default: return 'flash';
    }
  };

  const getActionColor = (type: string): string => {
    switch (type) {
      case 'webhook': return Colors.secondary;
      case 'push_notification': return Colors.warning;
      case 'email': return Colors.error;
      case 'sms': return Colors.success;
      case 'redirect': return Colors.primary;
      default: return Colors.textMuted;
    }
  };

  return (
    <View style={styles.actionCard}>
      <View style={[styles.actionIconContainer, { backgroundColor: getActionColor(action.action_type) + '20' }]}>
        <Ionicons name={getActionIcon(action.action_type)} size={20} color={getActionColor(action.action_type)} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionType}>{action.action_type.replace('_', ' ')}</Text>
        <Text style={styles.actionConfig} numberOfLines={1}>
          {JSON.stringify(action.config).substring(0, 50)}...
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete}>
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );
}

// ============ Add Action Modal ============

interface AddActionModalProps {
  visible: boolean;
  qrCodeId: string;
  actionTypes: ActionTypeInfo[];
  onClose: () => void;
  onCreated: () => void;
}

function AddActionModal({ visible, qrCodeId, actionTypes, onClose, onCreated }: AddActionModalProps) {
  const [selectedType, setSelectedType] = useState<ActionTypeInfo | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [priority, setPriority] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!selectedType) {
      setError('Please select an action type');
      return;
    }

    // Validate required fields
    const requiredFields = Object.entries(selectedType.configSchema)
      .filter(([_, schema]) => schema.required)
      .map(([field]) => field);

    for (const field of requiredFields) {
      if (!config[field]) {
        setError(`${field} is required`);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await actionHubApi.createAction({
        qr_code_id: qrCodeId,
        action_type: selectedType.type,
        config,
        priority: parseInt(priority) || 1,
      });
      setSelectedType(null);
      setConfig({});
      setPriority('1');
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Action</Text>
          <TouchableOpacity onPress={handleCreate} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.modalCreate}>Add</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {!selectedType ? (
            <>
              <Text style={styles.inputLabel}>Select Action Type</Text>
              {actionTypes.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={styles.actionTypeOption}
                  onPress={() => setSelectedType(type)}
                >
                  <View>
                    <Text style={styles.actionTypeTitle}>{type.name}</Text>
                    <Text style={styles.actionTypeDesc}>{type.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setSelectedType(null)}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.primary} />
                <Text style={styles.backButtonText}>Back to types</Text>
              </TouchableOpacity>

              <Text style={styles.selectedTypeTitle}>{selectedType.name}</Text>
              <Text style={styles.selectedTypeDesc}>{selectedType.description}</Text>

              {Object.entries(selectedType.configSchema).map(([field, schema]) => (
                <View key={field}>
                  <Text style={styles.inputLabel}>
                    {field} {schema.required && '*'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={schema.description}
                    placeholderTextColor={Colors.textMuted}
                    value={config[field] || ''}
                    onChangeText={(value) => setConfig(prev => ({ ...prev, [field]: value }))}
                  />
                </View>
              ))}

              <Text style={styles.inputLabel}>Priority</Text>
              <TextInput
                style={styles.input}
                placeholder="1 (lower = executes first)"
                placeholderTextColor={Colors.textMuted}
                value={priority}
                onChangeText={setPriority}
                keyboardType="numeric"
              />
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ============ Main Screen ============

export function ActionHubScreen() {
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const [qrCodes, setQrCodes] = useState<ActionHubQRCode[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<ActionHubQRCode | null>(null);
  const insets = useSafeAreaInsets();

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [qrResponse, analyticsResponse] = await Promise.all([
        actionHubApi.listQRCodes(),
        actionHubApi.getAnalyticsOverview(),
      ]);
      setQrCodes(qrResponse.qrCodes);
      setAnalytics(analyticsResponse.analytics);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleQRCreated = (qr: ActionHubQRCode) => {
    setQrCodes(prev => [qr, ...prev]);
    handleSelectQR(qr);
  };

  const handleQRUpdated = (updatedQR: ActionHubQRCode) => {
    setQrCodes(prev => prev.map(qr => qr.id === updatedQR.id ? updatedQR : qr));
    handleSelectQR(updatedQR);
  };

  const handleSelectQR = (qr: ActionHubQRCode) => {
    const qrUrl = getQRCodeScanUrl(qr.code);
    console.log('===========================================');
    console.log('[ActionHub] Selected QR Code:');
    console.log('[ActionHub]   Name:', qr.name);
    console.log('[ActionHub]   Code:', qr.code);
    console.log('[ActionHub]   URL:', qrUrl);
    console.log('===========================================');
    setSelectedQR(qr);
  };

  const handleQRDeleted = () => {
    if (selectedQR) {
      setQrCodes(prev => prev.filter(qr => qr.id !== selectedQR.id));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => loadData()} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back,</Text>
          <Text style={styles.headerUsername}>{user?.username || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Dashboard
        analytics={analytics}
        qrCodes={qrCodes}
        onCreateQR={() => setShowCreateModal(true)}
        onSelectQR={handleSelectQR}
        onRefresh={() => loadData(true)}
        refreshing={refreshing}
        loading={loading}
      />

      <CreateQRModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleQRCreated}
      />

      <QRDetailModal
        visible={!!selectedQR}
        qrCode={selectedQR}
        onClose={() => setSelectedQR(null)}
        onDeleted={handleQRDeleted}
        onUpdated={handleQRUpdated}
      />
    </View>
  );
}

// ============ Styles ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.md,
    color: Colors.textSecondary,
  },

  // Auth Styles
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  authTitle: {
    ...Typography.h1,
    marginTop: Spacing.md,
  },
  authSubtitle: {
    ...Typography.bodySecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  authForm: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  authTabs: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  authTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  authTabActive: {
    backgroundColor: Colors.primary,
  },
  authTabText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  authTabTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  authButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerGreeting: {
    ...Typography.caption,
  },
  headerUsername: {
    ...Typography.h3,
  },
  logoutButton: {
    padding: Spacing.sm,
  },

  // Dashboard Styles
  dashboardContent: {
    padding: Spacing.lg,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
  },
  createButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Analytics Styles
  analyticsContainer: {
    marginBottom: Spacing.lg,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
  },
  analyticsValue: {
    ...Typography.h2,
    marginTop: Spacing.sm,
  },
  analyticsLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },

  // QR Card Styles
  listTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  qrCardLeft: {
    marginRight: Spacing.md,
  },
  qrPreview: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },
  qrCardContent: {
    flex: 1,
  },
  qrCardName: {
    ...Typography.body,
    fontWeight: '600',
  },
  qrCardDescription: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  qrCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '600',
  },
  qrCardCode: {
    ...Typography.small,
    color: Colors.textMuted,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyStateText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyStateButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },

  // Input Styles
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text,
    marginBottom: Spacing.md,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
    color: Colors.textSecondary,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginBottom: Spacing.md,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h3,
  },
  modalCancel: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  modalCreate: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    ...Typography.caption,
    color: Colors.primary,
    flex: 1,
  },

  // QR Display
  qrDisplayContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  qrDisplayWrapper: {
    backgroundColor: Colors.text,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  qrCodeText: {
    ...Typography.caption,
    marginTop: Spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  qrActionButtons: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  qrActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  qrActionButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },

  // Status Toggle
  statusToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statusToggleLabel: {
    ...Typography.caption,
  },
  statusToggleValue: {
    ...Typography.body,
    fontWeight: '600',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Detail Section
  detailSection: {
    marginBottom: Spacing.lg,
  },
  detailLabel: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    ...Typography.body,
  },

  // Actions Section
  actionsSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addActionText: {
    ...Typography.body,
    color: Colors.primary,
  },
  noActionsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  noActionsText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  noActionsSubtext: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },

  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionType: {
    ...Typography.body,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionConfig: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },

  // Action Type Selection
  actionTypeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  actionTypeTitle: {
    ...Typography.body,
    fontWeight: '600',
  },
  actionTypeDesc: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.primary,
  },
  selectedTypeTitle: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  selectedTypeDesc: {
    ...Typography.caption,
    marginBottom: Spacing.lg,
  },
});
