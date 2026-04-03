import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import WAValidator from 'multicoin-address-validator';
import { ParsedQRData } from '../../types';

interface CryptoFormProps {
  onDataChange: (data: ParsedQRData) => void;
  initialData?: ParsedQRData;
}

// Popular cryptocurrencies - top 25 by market cap
const POPULAR_CURRENCIES = [
  { label: 'Bitcoin (BTC)', value: 'BTC' },
  { label: 'Ethereum (ETH)', value: 'ETH' },
  { label: 'Tether (USDT)', value: 'USDT' },
  { label: 'BNB (BNB)', value: 'BNB' },
  { label: 'Solana (SOL)', value: 'SOL' },
  { label: 'XRP (XRP)', value: 'XRP' },
  { label: 'USD Coin (USDC)', value: 'USDC' },
  { label: 'Cardano (ADA)', value: 'ADA' },
  { label: 'Dogecoin (DOGE)', value: 'DOGE' },
  { label: 'TRON (TRX)', value: 'TRX' },
  { label: 'Litecoin (LTC)', value: 'LTC' },
  { label: 'Polkadot (DOT)', value: 'DOT' },
  { label: 'Polygon (MATIC)', value: 'MATIC' },
  { label: 'Bitcoin Cash (BCH)', value: 'BCH' },
  { label: 'Avalanche (AVAX)', value: 'AVAX' },
  { label: 'Stellar (XLM)', value: 'XLM' },
  { label: 'Cosmos (ATOM)', value: 'ATOM' },
  { label: 'Algorand (ALGO)', value: 'ALGO' },
  { label: 'VeChain (VET)', value: 'VET' },
  { label: 'Tezos (XTZ)', value: 'XTZ' },
  { label: 'Filecoin (FIL)', value: 'FIL' },
  { label: 'NEAR Protocol (NEAR)', value: 'NEAR' },
  { label: 'Aptos (APT)', value: 'APT' },
  { label: 'Arbitrum (ARB)', value: 'ARB' },
  { label: 'Optimism (OP)', value: 'OP' },
];

export default function CryptoForm({ onDataChange, initialData }: CryptoFormProps) {
  const [currency, setCurrency] = useState(initialData?.cryptoCurrency || 'BTC');
  const [address, setAddress] = useState(initialData?.cryptoAddress || '');
  const [amount, setAmount] = useState(initialData?.cryptoAmount || '');
  const [label, setLabel] = useState(initialData?.cryptoLabel || '');
  const [message, setMessage] = useState(initialData?.cryptoMessage || '');
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);

  useEffect(() => {
    // Validate address when it changes
    if (address.trim()) {
      try {
        const isValid = WAValidator.validate(address, currency);
        setIsValidAddress(isValid);

        // If invalid, try to auto-detect currency
        if (!isValid) {
          const currencies = ['BTC', 'ETH', 'LTC', 'DOGE', 'XRP', 'BCH', 'ADA', 'DOT', 'SOL', 
                             'MATIC', 'TRX', 'AVAX', 'ATOM', 'XLM', 'ALGO', 'VET', 'XTZ'];
          
          for (const curr of currencies) {
            try {
              if (WAValidator.validate(address, curr)) {
                setDetectedCurrency(curr);
                break;
              }
            } catch (e) {
              // Continue to next
            }
          }
        } else {
          setDetectedCurrency(null);
        }
      } catch (error) {
        setIsValidAddress(false);
        setDetectedCurrency(null);
      }
    } else {
      setIsValidAddress(true);
      setDetectedCurrency(null);
    }
  }, [address, currency]);

  useEffect(() => {
    onDataChange({
      cryptoCurrency: currency,
      cryptoAddress: address,
      cryptoAmount: amount || undefined,
      cryptoLabel: label || undefined,
      cryptoMessage: message || undefined,
    });
  }, [currency, address, amount, label, message]);

  const handleDetectedCurrencyAccept = () => {
    if (detectedCurrency) {
      setCurrency(detectedCurrency);
      setDetectedCurrency(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Cryptocurrency *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={currency}
            onValueChange={setCurrency}
            style={styles.picker}
          >
            {POPULAR_CURRENCIES.map((curr) => (
              <Picker.Item key={curr.value} label={curr.label} value={curr.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Wallet Address *</Text>
        <TextInput
          style={[
            styles.input,
            !isValidAddress && address.trim() && styles.inputError
          ]}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter wallet address"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
        {!isValidAddress && address.trim() && (
          <Text style={styles.errorText}>
            Invalid {currency} address
          </Text>
        )}
        {detectedCurrency && (
          <View style={styles.detectionBox}>
            <Text style={styles.detectionText}>
              Detected {detectedCurrency} address. 
            </Text>
            <Text style={styles.detectionLink} onPress={handleDetectedCurrencyAccept}>
              Switch to {detectedCurrency}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Amount (optional)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.001"
          placeholderTextColor="#888"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Label (optional)</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Payment for..."
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Message (optional)</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Additional message"
          placeholderTextColor="#888"
          multiline
        />
      </View>

      <Text style={styles.hint}>
        QR code will contain: {currency.toLowerCase()}:{address || '<address>'}
        {amount && `?amount=${amount}`}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#fff',
  },
  pickerContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: 'transparent',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  detectionBox: {
    backgroundColor: '#1a4d2e',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  detectionText: {
    color: '#4ade80',
    fontSize: 13,
  },
  detectionLink: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
