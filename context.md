# QR Master - Monetization Plan

## 📱 App Overview
- **App Name:** QR Master
- **Platform:** Android (Expo SDK 54)
- **Contact:** team.agora.hub@gmail.com
- **Purpose:** QR Code scanning & generation utility

---

## 🎯 Monetization Strategy: Non-Intrusive Ads

### Philosophy
> "Respect the user's time and experience. Ads should feel like a natural part of the app, not an interruption."

### Key Principles
1. **Never interrupt core functionality** (scanning/generating QR codes)
2. **Reward users for optional ad engagement**
3. **Ads appear only at natural pause points**
4. **Keep the free experience fully functional**

---

## 📊 Ad Types & Placement Strategy

### 1. ✅ Banner Ads (LOW INTRUSION) - **RECOMMENDED**

**Best Placement:** Bottom of History screen
- Users browse history casually - a small banner won't disrupt
- Use `ANCHORED_ADAPTIVE_BANNER` for best sizing
- Only show after user has created 3+ history items

**Implementation Priority:** HIGH ⭐⭐⭐

```
┌─────────────────────────┐
│      History Screen     │
├─────────────────────────┤
│  [QR] URL - google.com  │
│  [QR] WiFi - HomeNet    │
│  [QR] Contact - John    │
│         ...             │
├─────────────────────────┤
│  [    Banner Ad     ]   │  ← Anchored at bottom
└─────────────────────────┘
```

### 2. ✅ Interstitial Ads (MEDIUM INTRUSION) - **USE SPARINGLY**

**Best Placement:** After GENERATING a QR code (not scanning!)
- Natural pause point - user just completed an action
- Show only every 3rd-5th generation (frequency cap)
- NEVER show after scanning (disrupts workflow)

**Frequency Rules:**
- Max 1 interstitial per 3 minutes
- Max 1 interstitial per 5 QR generations
- Skip if user just opened app (< 30 seconds)

**Implementation Priority:** MEDIUM ⭐⭐

### 3. ✅ Rewarded Ads (ZERO INTRUSION) - **BEST USER EXPERIENCE**

**Best Placement:** Optional features/unlocks
- "Watch ad to remove watermark from QR export"
- "Watch ad to unlock premium QR colors/styles"
- "Watch ad to export QR in high resolution"

**Benefits:**
- User CHOOSES to watch
- User gets VALUE in exchange
- Higher engagement and eCPM
- No negative user sentiment

**Implementation Priority:** HIGH ⭐⭐⭐

### 4. ❌ App Open Ads - **NOT RECOMMENDED**

**Why avoid for this app:**
- QR scanning needs to be INSTANT
- Users often open app briefly to scan
- Disrupts the utility nature of the app
- Will cause negative reviews

---

## 🛠️ Technical Implementation

### Step 1: Install Dependencies

```bash
npx expo install react-native-google-mobile-ads
```

### Step 2: Configure app.json

Add to `app.json`:
```json
{
  "expo": {
    ...
  },
  "react-native-google-mobile-ads": {
    "android_app_id": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
  }
}
```

### Step 3: Create AdMob Account

1. Go to [Google AdMob](https://admob.google.com/)
2. Create new app "QR Master"
3. Create Ad Units:
   - Banner Ad Unit (for History screen)
   - Interstitial Ad Unit (for post-generation)
   - Rewarded Ad Unit (for premium features)
4. Note down all Ad Unit IDs

### Step 4: Create Ad Service Module

Create `/src/services/adService.ts`:
- Initialize AdMob SDK
- Manage ad loading/showing
- Track frequency caps
- Handle European consent (GDPR)

### Step 5: Create Ad Components

Create `/src/components/ads/`:
- `BannerAdComponent.tsx` - Wrapper for banner ads
- `useInterstitialAd.ts` - Hook for interstitial logic
- `useRewardedAd.ts` - Hook for rewarded ad logic

### Step 6: Implement Consent Flow

For EU users (GDPR compliance):
- Use Google's UMP (User Messaging Platform)
- Show consent dialog on first launch
- Respect user's ad preferences

---

## 📋 Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Create Google AdMob account
- [ ] Register "QR Master" app in AdMob
- [ ] Create Banner Ad Unit
- [ ] Create Interstitial Ad Unit  
- [ ] Create Rewarded Ad Unit
- [ ] Install `react-native-google-mobile-ads`
- [ ] Configure `app.json` with App ID
- [ ] Create new development build with ads

### Phase 2: Banner Implementation (Day 2)
- [ ] Create `BannerAdComponent.tsx`
- [ ] Add banner to bottom of History screen
- [ ] Test with Test IDs
- [ ] Verify banner loads correctly

### Phase 3: Interstitial Implementation (Day 3)
- [ ] Create `useInterstitialAd.ts` hook
- [ ] Add frequency cap logic (every 5 generates)
- [ ] Preload interstitial on app start
- [ ] Show after QR generation (with caps)
- [ ] Test timing and user flow

### Phase 4: Rewarded Ads (Day 4)
- [ ] Create `useRewardedAd.ts` hook
- [ ] Add "Premium Export" button in Generate screen
- [ ] Reward: High-res QR export (512x512 or larger)
- [ ] Reward: Custom QR colors
- [ ] Track rewards earned

### Phase 5: Polish & Consent (Day 5)
- [ ] Implement GDPR consent flow
- [ ] Add "Remove Ads" IAP option (future)
- [ ] Test all ad placements thoroughly
- [ ] Monitor ad fill rates
- [ ] Submit update to Play Store

---

## 📍 Specific Placement Locations

### History Screen (`HistoryScreen.tsx`)
```
Location: Bottom of screen (above tab bar)
Type: Banner (ANCHORED_ADAPTIVE_BANNER)
Condition: Show only if history.length >= 3
```

### Generate Screen (`GenerateScreen.tsx`)
```
Location: After successful QR generation
Type: Interstitial (full screen)
Condition: Every 5th generation, max 1 per 3 min
Timing: After QR is saved to history, before scroll
```

### Generate Screen - Premium Features
```
Location: Below QR code display
Type: Rewarded Ad button
Label: "🎁 Watch ad for HD Export"
Reward: 1024x1024 PNG export
```

### Settings Screen (`SettingsScreen.tsx`)
```
Location: New section "Premium Features"
Type: Rewarded Ad buttons
Options:
  - "Unlock custom QR colors"
  - "Remove watermark"
```

---

## 💰 Expected Revenue (Estimates)

Based on utility app benchmarks:

| Ad Type | eCPM (Est.) | Daily Impressions | Daily Revenue |
|---------|-------------|-------------------|---------------|
| Banner | $0.50-1.50 | 500 | $0.25-0.75 |
| Interstitial | $2-5 | 50 | $0.10-0.25 |
| Rewarded | $5-15 | 20 | $0.10-0.30 |
| **Total** | - | - | **$0.45-1.30/day** |

*Per 1,000 DAU (Daily Active Users)*

---

## ⚠️ Important Reminders

### DO:
- ✅ Use Test IDs during development
- ✅ Respect user's consent choices
- ✅ Preload ads for instant display
- ✅ Handle ad failures gracefully
- ✅ Track which placements perform best

### DON'T:
- ❌ Show ads during/before QR scanning
- ❌ Show interstitials immediately on app open
- ❌ Show more than 1 interstitial per session for light users
- ❌ Block app functionality behind mandatory ads
- ❌ Use deceptive ad placements

---

## 🔑 Test Ad Unit IDs

Use these during development:

```typescript
const TestIds = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/5354046379',
};
```

---

## 📁 File Structure After Implementation

```
src/
├── services/
│   └── adService.ts          # Ad initialization & management
├── components/
│   └── ads/
│       ├── BannerAdComponent.tsx
│       └── AdConsentModal.tsx
├── hooks/
│   ├── useInterstitialAd.ts
│   └── useRewardedAd.ts
├── utils/
│   └── adFrequency.ts        # Frequency cap logic
```

---

## 🚀 Next Steps

1. **Create AdMob account** and get real Ad Unit IDs
2. **Run:** `npx expo install react-native-google-mobile-ads`
3. **Update `app.json`** with AdMob App ID
4. **Create new development build** (ads require native code)
5. **Implement ads** following the phases above

---

## 📱 Google Play Store Deployment Guide

### Prerequisites Checklist

- [ ] Google Play Developer Account ($25 one-time fee)
- [ ] App icon (512x512 PNG, no transparency)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (min 2, recommended 8)
  - Phone: 1080x1920 or 1920x1080
  - 7" Tablet (optional): 1200x1920
  - 10" Tablet (optional): 1600x2560
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Privacy Policy URL (required for camera permission)
- [ ] App category selected

### Step 1: Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay the $25 one-time registration fee
3. Complete identity verification (can take 24-48 hours)
4. Accept the Developer Distribution Agreement

### Step 2: Prepare App Assets

#### App Icon (512x512)
- PNG format, no alpha/transparency
- No badges or text that won't scale well
- Should match the icon in your app

#### Feature Graphic (1024x500)
- Displayed at the top of your store listing
- Make it eye-catching and branded
- Can include app name and key features

#### Screenshots
- Capture actual screens from your app
- Show key features: Scan, Generate, History
- Add captions/annotations if desired
- Minimum 2, maximum 8 per device type

### Step 3: Prepare Store Listing Text

#### Short Description (80 chars)
```
Scan & create QR codes instantly. Smart detection for URLs, WiFi, contacts & more!
```

#### Full Description (Example)
```
📱 QR MASTER - Your All-in-One QR Code Solution

Scan any QR code instantly with smart content detection. Generate beautiful QR codes for URLs, WiFi networks, contacts, and more!

✨ KEY FEATURES:

🔍 SMART SCANNING
• Instant QR code recognition
• Auto-detects content type (URL, WiFi, Contact, etc.)
• One-tap actions: Open links, connect to WiFi, save contacts
• Copy to clipboard with one tap

📝 EASY QR GENERATION
• Create QR codes for 7+ content types
• URLs, WiFi passwords, contacts, phone numbers
• Email, SMS, and plain text
• Save and share your QR codes

📚 HISTORY & FAVORITES
• All scanned and created codes saved
• Mark favorites for quick access
• Share QR codes with anyone
• Filter by type: Scanned, Generated, Favorites

⚡ FAST & RELIABLE
• Works offline for generating codes
• No account required
• Clean, modern interface
• Dark theme for comfortable use

🔒 PRIVACY FOCUSED
• Camera used only for scanning
• No data sent to external servers
• Your QR codes stay on your device

Perfect for:
• Connecting to WiFi networks
• Sharing contact information
• Opening website links
• Saving event details
• And much more!

Download QR Master now and make QR codes simple!
```

### Step 4: Build Production APK/AAB

```bash
# Build Android App Bundle (recommended for Play Store)
npx eas build --platform android --profile production
```

Make sure your `eas.json` has a production profile:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Step 5: Create App in Play Console

1. Go to Play Console → **Create app**
2. Fill in:
   - App name: `QR Master`
   - Default language: English
   - App or game: App
   - Free or paid: Free
3. Accept declarations

### Step 6: Complete Store Listing

1. **Main store listing** → Add all text and graphics
2. **App content** → Complete all sections:
   - Privacy policy URL
   - Ads declaration (contains ads: Yes)
   - App access (no special access)
   - Content rating questionnaire
   - Target audience (not for children)
   - News app: No
   - COVID-19 apps: No
   - Data safety (camera, storage permissions)
   - Government apps: No

### Step 7: Data Safety Declaration

For QR Master, declare:
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Photos/Videos | No | No | - |
| Device ID | Yes (ads) | Yes (ads) | Advertising |
| Crash logs | Yes | Yes | Analytics |

### Step 8: Set Up Releases

1. Go to **Production** → **Create new release**
2. Upload your `.aab` file
3. Add release notes:
```
🎉 Initial Release!
• Scan QR codes with smart content detection
• Generate QR codes for URLs, WiFi, contacts & more
• Save history and mark favorites
• Share QR codes easily
```
4. Review and submit

### Step 9: Review Process

- Initial review typically takes 1-3 days
- May take up to 7 days for new developer accounts
- You'll receive email notification when approved/rejected

### Post-Launch Checklist

- [ ] Update "Rate this App" link with real Play Store URL
- [ ] Monitor crash reports in Play Console
- [ ] Respond to user reviews
- [ ] Plan first update based on feedback

---

## ⭐ Rate This App Feature

### Implementation Notes

The "Rate this App" button can be added to Settings now. It uses:
- **Before Play Store launch:** Opens a placeholder or does nothing
- **After Play Store launch:** Opens the real Play Store listing

### Play Store URL Format
```
https://play.google.com/store/apps/details?id=com.yourcompany.qrmaster
```

### Package Name
Check your `app.json` for the package name:
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.qrmaster"
    }
  }
}
```

### expo-store-review (Optional)

For native in-app review dialog (shows Google's review UI inside the app):
```bash
npx expo install expo-store-review
```

```typescript
import * as StoreReview from 'expo-store-review';

// Check if available and request review
if (await StoreReview.hasAction()) {
  await StoreReview.requestReview();
}
```

**Note:** The native review dialog has limitations:
- Google controls when/if it shows
- Can't be tested without a published app
- Use sparingly (Google may ignore frequent requests)

### Simple Approach (Recommended for Now)

Just open the Play Store listing directly:
```typescript
import { Linking } from 'react-native';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME';

const handleRateApp = () => {
  Linking.openURL(PLAY_STORE_URL);
};
```

---

*Last Updated: December 14, 2025*
*Contact: team.agora.hub@gmail.com*

---

## 💰 Crypto Wallet Feature (Planned)

### Overview
Add cryptocurrency wallet address QR code generation and validation.

### Features
1. **Address Validation** - Validate any crypto address before generating QR
2. **Auto-detect Coin** - Determine cryptocurrency from address format
3. **150+ Coins Supported** - Bitcoin, Ethereum, Solana, USDT, and more
4. **QR Generation** - Create scannable wallet address QR codes
5. **History Integration** - Save crypto QR codes to history

### Library: multicoin-address-validator
```bash
npm install multicoin-address-validator
```

**Supported Coins (Top 20):**
- Bitcoin (BTC)
- Ethereum (ETH) + all ERC-20 tokens
- Binance Smart Chain (BNB/BSC)
- Solana (SOL)
- Cardano (ADA)
- Ripple (XRP)
- Polkadot (DOT)
- Dogecoin (DOGE)
- Litecoin (LTC)
- Tron (TRX)
- Avalanche (AVAX)
- Polygon/Matic (MATIC)
- Chainlink (LINK)
- Uniswap (UNI)
- Tether (USDT)
- USD Coin (USDC)
- Stellar (XLM)
- Monero (XMR)
- And 130+ more...

### Implementation Plan

#### Step 1: Install Library
```bash
npm install multicoin-address-validator
```

#### Step 2: Add Crypto Type to QR Types
Update `src/types/qr.ts`:
```typescript
export type QRContentType = 
  | 'url'
  | 'email'
  | 'phone'
  | 'sms'
  | 'contact'
  | 'wifi'
  | 'geo'
  | 'calendar'
  | 'crypto'  // ← NEW
  | 'text';

export interface ParsedQRData {
  // ... existing fields
  
  // Crypto Wallet
  cryptoAddress?: string;
  cryptoCurrency?: string;  // BTC, ETH, SOL, etc.
  cryptoAmount?: string;    // Optional payment amount
  cryptoLabel?: string;     // Optional label/memo
  cryptoMessage?: string;   // Optional message
}
```

#### Step 3: Add Generate Option
Add "Crypto Wallet" to Generate screen categories.

#### Step 4: Create Crypto Form Component
```typescript
// src/components/forms/CryptoForm.tsx
interface CryptoFormProps {
  onGenerate: (data: ParsedQRData) => void;
}

// Features:
- Currency dropdown (Bitcoin, Ethereum, Solana, etc.)
- Address input with validation
- Optional amount field
- Optional label/memo field
- Validate button (checks if address is valid for selected currency)
- Auto-detect currency from address
```

#### Step 5: Add Parser
```typescript
// src/utils/qrParser.ts
function detectCryptoAddress(address: string): string | null {
  const WAValidator = require('multicoin-address-validator');
  
  const currencies = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOGE', 'LTC', ...];
  
  for (const currency of currencies) {
    if (WAValidator.validate(address, currency)) {
      return currency;
    }
  }
  
  return null;
}
```

#### Step 6: Add Actions
```typescript
// Open wallet app / Copy address
case 'crypto':
  actions.push({
    label: 'Copy Address',
    icon: 'copy-outline',
    action: () => copyToClipboard(parsed.cryptoAddress!),
    primary: true,
  });
```

### QR Code Format
Standard crypto URI format:
```
bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.01&label=Donation
ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
solana:4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T
```

Components:
- `<currency>:<address>`
- Optional: `?amount=<value>`
- Optional: `&label=<text>`
- Optional: `&message=<text>`

### Security Considerations
1. **Validate before QR generation** - Prevent invalid addresses
2. **Show currency clearly** - Avoid sending to wrong network
3. **Warn about irreversibility** - Crypto transactions are final
4. **No private key generation** - App only handles addresses

### UI Mock
```
┌────────────────────────────┐
│   Generate Crypto Wallet   │
├────────────────────────────┤
│ Currency:                  │
│ [Bitcoin ▼]                │
│                            │
│ Wallet Address:            │
│ [1A1zP1eP5QGefi2DM...   ] │
│ [Validate] [Auto-detect]   │
│                            │
│ Amount (Optional):         │
│ [0.001                   ] │
│                            │
│ Label (Optional):          │
│ [Donation                ] │
│                            │
│ [Generate QR Code]         │
└────────────────────────────┘
```

---

*Last Updated: December 22, 2025*
*Contact: team.agora.hub@gmail.com*
