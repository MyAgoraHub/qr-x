/**
 * Donation Configuration
 * Centralized source for all donation addresses and provider links
 */

export interface DonationAddress {
  symbol: string;
  name: string;
  address: string;
  icon: string;
}

export interface DonationProvider {
  name: string;
  url: string;
  icon: string;
  color: string;
}

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  reference: string;
}

export const CRYPTO_DONATIONS: DonationAddress[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    address: '13KpEDknRnCBxGe36gXQLaskT3Uay9Dpi6',
    icon: 'logo-bitcoin',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    address: 'CP87LkimAkmQQK4NQKjA7LrjjCC7jk5pHroj9CkD3NLC',
    icon: 'logo-solana',
  },
  {
    symbol: 'USDT',
    name: 'Tether (Solana)',
    address: 'CP87LkimAkmQQK4NQKjA7LrjjCC7jk5pHroj9CkD3NLC',
    icon: 'cash-outline',
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    address: 'addr1v9z8w8r0matnthwytd82nug0a9akekmcffttn9xs8kvj36cx90c6z',
    icon: 'wallet-outline',
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    address: 'DCTWNMBoV8jdsYf7kVEhq5BeXNpr5KiS3n',
    icon: 'paw-outline',
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    address: 'LXWkSFCqL2XxjnVyshgoDXhAEjepWsgNiF',
    icon: 'logo-litecoin',
  },
];

export const FIAT_PROVIDERS: DonationProvider[] = [
  {
    name: 'Buy Me a Coffee',
    url: 'https://buymeacoffee.com/qr.x.team',
    icon: 'heart-outline',
    color: '#FFDD00',
  },
];

export const BANK_DETAILS: BankDetails = {
  accountHolder: 'QR-X Team',
  bankName: 'Coming Soon',
  accountNumber: 'N/A',
  reference: 'QR-X Donation',
};
