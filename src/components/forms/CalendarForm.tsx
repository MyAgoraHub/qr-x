import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { ParsedQRData } from '../../types';

interface CalendarFormProps {
  onDataChange: (data: ParsedQRData) => void;
  initialData?: ParsedQRData;
}

function formatICalDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    '00'
  );
}

type PickerTarget = 'start' | 'end';
type PickerMode = 'date' | 'time';

export default function CalendarForm({ onDataChange, initialData }: CalendarFormProps) {
  const defaultStart = new Date();
  const defaultEnd = new Date(Date.now() + 60 * 60 * 1000); // +1 hour

  const [title, setTitle] = useState(initialData?.eventTitle || '');
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [location, setLocation] = useState(initialData?.eventLocation || '');
  const [description, setDescription] = useState(initialData?.eventDescription || '');

  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>('start');
  const [pickerMode, setPickerMode] = useState<PickerMode>('date');

  useEffect(() => {
    onDataChange({
      eventTitle: title,
      eventStart: formatICalDate(startDate),
      eventEnd: formatICalDate(endDate),
      eventLocation: location || undefined,
      eventDescription: description || undefined,
    });
  }, [title, startDate, endDate, location, description]);

  const openPicker = (target: PickerTarget, mode: PickerMode) => {
    setPickerTarget(target);
    setPickerMode(mode);
    setShowPicker(true);
  };

  const currentPickerDate = pickerTarget === 'start' ? startDate : endDate;

  const handlePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !selected) return;

    const base = pickerTarget === 'start' ? new Date(startDate) : new Date(endDate);
    let merged: Date;

    if (pickerMode === 'date') {
      merged = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        base.getHours(),
        base.getMinutes(),
        0
      );
    } else {
      merged = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        selected.getHours(),
        selected.getMinutes(),
        0
      );
    }

    if (pickerTarget === 'start') {
      setStartDate(merged);
    } else {
      setEndDate(merged);
    }
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.field}>
        <Text style={styles.label}>Event Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Team Sync"
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Start date/time */}
      <View style={styles.field}>
        <Text style={styles.label}>Start</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => openPicker('start', 'date')}
          >
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => openPicker('start', 'time')}
          >
            <Ionicons name="time-outline" size={16} color={Colors.secondary} />
            <Text style={styles.timeButtonText}>{formatTime(startDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* End date/time */}
      <View style={styles.field}>
        <Text style={styles.label}>End</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => openPicker('end', 'date')}
          >
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => openPicker('end', 'time')}
          >
            <Ionicons name="time-outline" size={16} color={Colors.secondary} />
            <Text style={styles.timeButtonText}>{formatTime(endDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location */}
      <View style={styles.field}>
        <Text style={styles.label}>Location (optional)</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Cape Town, ZA"
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Event details..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Android: renders picker inline when visible */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={currentPickerDate}
          mode={pickerMode}
          display="default"
          onChange={handlePickerChange}
        />
      )}

      {/* iOS: picker in a bottom sheet modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.iosOverlay}>
            <View style={styles.iosSheet}>
              <TouchableOpacity
                style={styles.iosDoneButton}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.iosDoneText}>Done</Text>
              </TouchableOpacity>
              <DateTimePicker
                value={currentPickerDate}
                mode={pickerMode}
                display="spinner"
                onChange={handlePickerChange}
                textColor={Colors.text}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  field: {
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    gap: Spacing.xs,
  },
  dateButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.secondary + '60',
    gap: Spacing.xs,
  },
  timeButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  iosOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iosSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingBottom: Spacing.xl,
  },
  iosDoneButton: {
    alignSelf: 'flex-end',
    padding: Spacing.md,
    paddingRight: Spacing.lg,
  },
  iosDoneText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '600',
  },
});
