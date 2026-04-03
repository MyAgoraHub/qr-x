import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { QRCodeData } from '../types';
import { getTypeLabel, getTypeIcon, getActions } from '../utils';

interface ScanResultProps {
  data: QRCodeData;
  onClose: () => void;
  onScanAgain: () => void;
}

export function ScanResult({ data, onClose, onScanAgain }: ScanResultProps) {
  const typeColor = Colors.typeColors[data.type] || Colors.textSecondary;
  const actions = getActions(data);
  
  const renderParsedData = () => {
    const { parsed, type } = data;
    
    switch (type) {
      case 'contact':
        return (
          <View style={styles.parsedContainer}>
            {parsed.contactName && (
              <DataRow label="Name" value={parsed.contactName} />
            )}
            {parsed.contactPhone && (
              <DataRow label="Phone" value={parsed.contactPhone} />
            )}
            {parsed.contactEmail && (
              <DataRow label="Email" value={parsed.contactEmail} />
            )}
            {parsed.contactOrg && (
              <DataRow label="Organization" value={parsed.contactOrg} />
            )}
            {parsed.contactTitle && (
              <DataRow label="Title" value={parsed.contactTitle} />
            )}
            {parsed.contactAddress && (
              <DataRow label="Address" value={parsed.contactAddress} />
            )}
          </View>
        );
        
      case 'wifi':
        return (
          <View style={styles.parsedContainer}>
            {parsed.wifiSSID && (
              <DataRow label="Network" value={parsed.wifiSSID} />
            )}
            {parsed.wifiType && (
              <DataRow label="Security" value={parsed.wifiType} />
            )}
            {parsed.wifiPassword && (
              <DataRow label="Password" value={parsed.wifiPassword} isSecret />
            )}
            {parsed.wifiHidden && (
              <DataRow label="Hidden" value="Yes" />
            )}
          </View>
        );
        
      case 'email':
        return (
          <View style={styles.parsedContainer}>
            {parsed.email && (
              <DataRow label="Email" value={parsed.email} />
            )}
            {parsed.emailSubject && (
              <DataRow label="Subject" value={parsed.emailSubject} />
            )}
            {parsed.emailBody && (
              <DataRow label="Body" value={parsed.emailBody} />
            )}
          </View>
        );
        
      case 'sms':
        return (
          <View style={styles.parsedContainer}>
            {parsed.smsNumber && (
              <DataRow label="Number" value={parsed.smsNumber} />
            )}
            {parsed.smsBody && (
              <DataRow label="Message" value={parsed.smsBody} />
            )}
          </View>
        );
        
      case 'geo':
        return (
          <View style={styles.parsedContainer}>
            {parsed.latitude !== undefined && (
              <DataRow label="Latitude" value={parsed.latitude.toString()} />
            )}
            {parsed.longitude !== undefined && (
              <DataRow label="Longitude" value={parsed.longitude.toString()} />
            )}
          </View>
        );
        
      case 'calendar':
        return (
          <View style={styles.parsedContainer}>
            {parsed.eventTitle && (
              <DataRow label="Event" value={parsed.eventTitle} />
            )}
            {parsed.eventStart && (
              <DataRow label="Start" value={parsed.eventStart} />
            )}
            {parsed.eventEnd && (
              <DataRow label="End" value={parsed.eventEnd} />
            )}
            {parsed.eventLocation && (
              <DataRow label="Location" value={parsed.eventLocation} />
            )}
            {parsed.eventDescription && (
              <DataRow label="Description" value={parsed.eventDescription} />
            )}
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan Result</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.typeContainer, { backgroundColor: typeColor + '20' }]}>
          <Ionicons name={getTypeIcon(data.type) as any} size={32} color={typeColor} />
          <Text style={[styles.typeLabel, { color: typeColor }]}>
            {getTypeLabel(data.type)}
          </Text>
        </View>
        
        {renderParsedData()}
        
        <View style={styles.rawContainer}>
          <Text style={styles.rawLabel}>Raw Content</Text>
          <Text style={styles.rawContent} selectable>
            {data.raw}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                action.primary && styles.primaryAction,
              ]}
              onPress={action.action}
            >
              <Ionicons
                name={action.icon as any}
                size={20}
                color={action.primary ? Colors.text : Colors.primary}
              />
              <Text
                style={[
                  styles.actionText,
                  action.primary && styles.primaryActionText,
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity style={styles.scanAgainButton} onPress={onScanAgain}>
          <Ionicons name="scan-outline" size={20} color={Colors.primary} />
          <Text style={styles.scanAgainText}>Scan Another</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function DataRow({
  label,
  value,
  isSecret = false,
}: {
  label: string;
  value: string;
  isSecret?: boolean;
}) {
  const [revealed, setRevealed] = React.useState(!isSecret);
  
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <View style={styles.dataValueContainer}>
        <Text style={styles.dataValue} selectable>
          {revealed ? value : '••••••••'}
        </Text>
        {isSecret && (
          <TouchableOpacity onPress={() => setRevealed(!revealed)}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
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
  scrollView: {
    flex: 1,
    padding: Spacing.md,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  typeLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  parsedContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dataLabel: {
    ...Typography.caption,
    flex: 1,
  },
  dataValueContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  dataValue: {
    ...Typography.body,
    textAlign: 'right',
  },
  rawContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  rawLabel: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  rawContent: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.xs,
  },
  primaryAction: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  primaryActionText: {
    color: Colors.text,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  scanAgainText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});
