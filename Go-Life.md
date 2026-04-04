# 🚀 Google Play Store Deployment Guide
### QR-X — Advanced QR Code Scanning, Creating & Classification

> A complete step-by-step guide to publishing your QR app on the Google Play Store,
> from zero setup to live listing.

> **This project uses Expo + EAS Build.** Many manual Android/Gradle steps are
> replaced by EAS commands. Each phase notes what's already handled.

---

## 📋 Table of Contents

1. [Pre-Flight Checklist](#-pre-flight-checklist)
2. [Phase 1 — Developer Account Setup](#-phase-1--developer-account-setup)
3. [Phase 2 — Prepare Your APK/AAB](#-phase-2--prepare-your-apkaab)
4. [Phase 3 — Store Listing](#-phase-3--store-listing)
5. [Phase 4 — Permissions & Data Safety](#-phase-4--permissions--data-safety)
6. [Phase 5 — Content Rating](#-phase-5--content-rating)
7. [Phase 6 — Privacy Policy](#-phase-6--privacy-policy)
8. [Phase 7 — Screenshots & Graphics](#-phase-7--screenshots--graphics)
9. [Phase 8 — ASO & Keywords](#-phase-8--aso--keywords)
10. [Phase 9 — Upload & Release](#-phase-9--upload--release)
11. [Phase 10 — Review & Go Live](#-phase-10--review--go-live)
12. [⚠️ Potential Review Risks](#️-potential-review-risks)

---

## ✅ Pre-Flight Checklist

Track your progress before submission:

| Item | Details | Done |
|---|---|---|
| Google Developer Account | $25 one-time fee | ⬜ |
| Release keystore created & backed up | Run `eas credentials` or create `.jks` — `credentials.json` currently has placeholder values | ⬜ |
| Signed AAB ready | Run `eas build --platform android --profile production` | ⬜ |
| `debuggable false` confirmed | ✅ Expo/EAS production builds set this automatically | ✅ |
| Version name & code set | ✅ `1.0.0` in `app.json`; `appVersionSource: remote` + `autoIncrement: true` in `eas.json` | ✅ |
| App icon (512×512 PNG) | ⚠️ `assets/android-icon-512.png` is 512×512 but has **alpha channel (RGBA)** — Play Store requires no alpha. Export a flat PNG. | ⚠️ |
| Feature graphic (1024×500 PNG/JPG) | Banner shown on store page — not yet created | ⬜ |
| Screenshots (min. 2, up to 8) | Phone screenshots required | ⬜ |
| Short description written | Max 80 characters | ⬜ |
| Full description written | Max 4,000 characters | ⬜ |
| Privacy Policy URL live | Screen exists in-app (`PrivacyPolicyScreen.tsx`) but needs a hosted public URL | ⬜ |
| Content rating questionnaire done | IARC rating | ⬜ |
| Data Safety form completed | All permissions declared in `app.json` already | ⬜ |
| Release notes written | "What's new" for v1.0 | ⬜ |

---

## 🧑‍💻 Phase 1 — Developer Account Setup

1. Go to [play.google.com/console](https://play.google.com/console)
2. Sign in with a Google account dedicated to your app/business
3. Pay the **one-time $25 USD registration fee**
4. Complete **identity verification** — can take 24–48 hours
5. Accept the Developer Distribution Agreement

> 💡 **Tip:** Use a business or dedicated Google account, not a personal one. This keeps
> your developer identity separate and more professional.

---

## 📦 Phase 2 — Prepare Your APK/AAB

### Why AAB over APK?

Google **strongly prefers** Android App Bundles (`.aab`) over APKs since August 2021.
AABs are smaller for end users and required for new apps on Play.

> ✅ **This project uses Expo + EAS Build.** You do NOT need Gradle, Android Studio,
> or manual keystore commands. EAS handles signing, AAB generation, version incrementing,
> and `debuggable false` automatically.

### Step 1 — Set Up Signing Credentials

> ⚠️ **CRITICAL:** Back up your keystore file and passwords somewhere safe (e.g. password
> manager + cloud backup). If you lose it, you can **never update your app** on Play.

`credentials.json` exists in the repo but currently has **placeholder values**. You have two options:

**Option A — Let EAS manage credentials (recommended):**
```bash
eas credentials
# Choose Android → production → set up new keystore
# EAS stores it securely in Expo servers
```

**Option B — Use a local keystore (already wired via `credentials.json`):**
```bash
# Generate a keystore manually once:
keytool -genkey -v \
  -keystore keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias

# Then fill in credentials.json with real values:
# keystorePath, keystorePassword, keyAlias, keyPassword
```
> The `preview` profile in `eas.json` uses `credentialsSource: local` — it will read
> `credentials.json` directly. The `production` profile defaults to EAS-managed.

### Step 2 — Build Your Release AAB

```bash
# Production build (uploads to EAS, autoIncrements version code)
eas build --platform android --profile production

# Or preview build (local credentials, internal distribution)
eas build --platform android --profile preview
```

EAS outputs a signed `.aab` file. Download it from the EAS dashboard or use
`eas submit` to send directly to Play Store.

### Step 3 — Verify Before Upload

- [x] `debuggable false` — set automatically by EAS for non-development profiles
- [x] Version code auto-incremented — `autoIncrement: true` in `eas.json` production profile
- [x] Version name `1.0.0` — set in `app.json`
- [ ] No test credentials or API keys hardcoded — review before building
- [ ] `credentials.json` has real values (not placeholders)

### (Reference) Manual Gradle approach — not needed with EAS

<details>
<summary>Show legacy Gradle/keytool instructions</summary>

```bash
# Keytool (manual)
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

```groovy
// android/app/build.gradle
android {
    signingConfigs { release { ... } }
    buildTypes { release { signingConfig signingConfigs.release; minifyEnabled true; debuggable false } }
}
```

```bash
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

</details>

---

## 🏪 Phase 3 — Store Listing

> ✅ App name is set to **"QR-X"** in `app.json`. The suggestions below are alternatives
> if you want a more descriptive Play Store title (you can differ from the `app.json` name).

### App Name Suggestions

| Option | Name |
|---|---|
| 1 | QR Master — Scan, Create & Classify |
| 2 | QRify — Scanner & Generator |
| 3 | SmartQR — Scan, Create, Manage |
| 4 | **QR-X — Scan, Create & Classify** ← current `app.json` name |

### Short Description (80 chars max)

```
Scan, create & auto-classify QR codes — SMS, Email, WiFi, Crypto & more
```

### Full Description Template (adapt as needed)

```
📷 SCAN ANY QR CODE INSTANTLY
Point your camera at any QR code and SmartQR automatically detects
and classifies it — no guessing, no extra taps.

🏷️ SMART CLASSIFICATION ENGINE
Supports all major QR types:
• 🌐 URL / Website links
• 📧 Email addresses
• 📱 Phone numbers
• 💬 SMS messages
• 📶 WiFi credentials (auto-connect!)
• 💰 Crypto wallet addresses (Bitcoin, Ethereum & more)
• 👤 vCard / Contact cards
• 📅 Calendar events
• 📍 Geo locations
• 📄 Plain text

🎨 POWERFUL QR GENERATOR
Create professional QR codes for any type in seconds.
Share, save, or print instantly.

📚 SCAN HISTORY & MANAGEMENT
Every scan is saved and organised by type for easy retrieval.

🔒 PRIVACY FIRST
All data stays on your device. No tracking. No ads.

Download SmartQR and take control of your QR code world.
```

### App Category

| Field | Value |
|---|---|
| Primary Category | Tools |
| Tags | Productivity, Utilities |
| Free or Paid | Free (donation-supported — no ads) |

---

## 🔐 Phase 4 — Permissions & Data Safety

> ✅ All permissions below are already declared in `app.json` under `android.permissions`
> and the Expo plugin configs. No manual `AndroidManifest.xml` edits needed.

### Permissions Your App Likely Uses

| Permission | Purpose | Risk Level |
|---|---|---|
| `CAMERA` | QR scanning | Medium — must justify |
| `VIBRATE` | Scan haptic feedback | Low |
| `INTERNET` | URL handling, crypto lookup | Low |
| `ACCESS_WIFI_STATE` | Read current WiFi info | Medium |
| `CHANGE_WIFI_STATE` | Auto-connect via WiFi QR | Medium — must justify |
| `READ_CONTACTS` *(if used)* | vCard QR auto-fill | High — avoid if possible |
| `SEND_SMS` *(avoid)* | Only use Intent, not direct send | Very High — likely rejection |

> ✅ SMS is handled via `expo-linking` with `sms:` URI scheme — no `SEND_SMS` permission
> is used or declared. Safe from this rejection risk.

> ⚠️ **For SMS:** Never use the `SEND_SMS` permission directly. Instead, launch the
> system SMS app using an `Intent`. This avoids a high-risk permission flag:
>
> ```kotlin
> val intent = Intent(Intent.ACTION_SENDTO).apply {
>     data = Uri.parse("smsto:$phoneNumber")
>     putExtra("sms_body", message)
> }
> startActivity(intent)
> ```

### Data Safety Form Answers

| Question | Your Answer |
|---|---|
| Does app collect data? | Only if you have scan history sync/backup |
| Is data shared with third parties? | No |
| Is data encrypted in transit? | Yes (if using HTTPS) |
| Can users request data deletion? | Yes (local — delete history in app) |
| Camera data stored/transmitted? | No |
| WiFi credentials stored/transmitted? | No |

---

## 📊 Phase 5 — Content Rating

> ⬜ **TODO:** Complete the IARC questionnaire in Play Console.

Complete the **IARC questionnaire** in Play Console under *Policy → App Content*.

| Category | Your Answer |
|---|---|
| Violence | None |
| Sexual content | None |
| Profanity | None |
| Controlled substances | None |
| Financial transactions | ⚠️ Yes, if crypto QR can initiate payments |
| User-generated content | No (unless users share QR codes) |

**Expected Rating: Everyone (3+)** ✅

> 💡 If your crypto feature only reads/displays wallet addresses and doesn't process
> payments, you can answer **No** to financial transactions.

> ✅ The donation feature displays crypto addresses only — no payments are processed
> in-app. Answer **No** to financial transactions.

---

## 🛡️ Phase 6 — Privacy Policy

A **Privacy Policy is mandatory** — even for simple apps. It must be publicly hosted.

> ⚠️ **Partially done:** `PrivacyPolicyScreen.tsx` exists in the app and covers all
> required topics. You still need to **host it publicly** (e.g. GitHub Pages) and
> submit the URL to Play Console. The in-app screen alone does not satisfy this requirement.

### Free Generators

- [app-privacy-policy-generator.firebaseapp.com](https://app-privacy-policy-generator.firebaseapp.com)
- [privacypolicygenerator.info](https://privacypolicygenerator.info)

### Free Hosting Options

- GitHub Pages (free, reliable)
- Notion (publish a page publicly)
- Google Sites

### Your Privacy Policy Must Cover

- **Camera:** Used for QR scanning only; images are not stored or transmitted
- **Scan history:** Stored locally on device only
- **WiFi credentials:** Used only to connect; never stored or transmitted
- **Crypto addresses:** Displayed only; no financial processing
- **No third-party data sharing**
- **No advertising SDKs** ✅ (no ads — donation-supported)
- **User data deletion:** User can clear scan history in-app

---

## 📸 Phase 7 — Screenshots & Graphics

> ⬜ **TODO:** All assets below still need to be created.

> ⚠️ **Icon alpha channel:** `assets/android-icon-512.png` is 512×512 but exported as
> **RGBA (has alpha)**. Google Play rejects icons with transparency. Re-export it as a
> flat RGB PNG with the dark background `#0F0F1A` baked in.

### Required Assets

| Asset | Size | Format | Notes |
|---|---|---|---|
| App Icon | 512×512 px | PNG (no alpha) | ⚠️ Re-export `android-icon-512.png` as flat RGB |
| Feature Graphic | 1024×500 px | PNG or JPG | Banner on store page |
| Phone Screenshots | Min 1080×1920 px | PNG or JPG | Min 2, up to 8 |
| Tablet Screenshots *(optional)* | Min 1200×1920 px | PNG or JPG | Recommended |

### Recommended Screenshot Flow (6 screens)

| # | Screen | What to Show |
|---|---|---|
| 1 | **Scanner** | Camera view actively scanning a QR, with type badge appearing |
| 2 | **Classification Result** | Result screen showing detected type (e.g. WiFi) with action buttons |
| 3 | **QR Creator — Type Picker** | Grid of all supported QR types |
| 4 | **WiFi QR Flow** | WiFi QR scanned → auto-connect confirmation |
| 5 | **Crypto QR Result** | Crypto address displayed with copy/open wallet options |
| 6 | **Scan History** | Organised history with type icons and filters |

### Screenshot Tools

- [screenshots.pro](https://screenshots.pro) — device frames
- [Figma](https://figma.com) — custom mockups
- [Mockuphone.com](https://mockuphone.com) — free device frames

---

## 🔍 Phase 8 — ASO & Keywords

ASO (App Store Optimisation) helps users discover your app organically.

### Target Keywords (use naturally in your description)

```
QR code scanner        QR generator          QR reader
WiFi QR code           crypto QR scanner     barcode scanner
QR creator             SMS QR code           email QR code
QR classifier          QR history            vCard QR
QR code maker          scan QR code          QR code app
```

### ASO Tips

- Put the most important keywords in your **app title** (highest weight)
- Repeat key terms naturally 2–3 times in the full description
- Use **bullet points** in your description for scannability
- Localise your listing for additional languages if possible (boosts reach)

---

## ⬆️ Phase 9 — Upload & Release

> ✅ You can use `eas submit` to upload directly from EAS to Play Console instead of
> manually uploading the `.aab` file.

### In Play Console:

1. Open your app → **Release → Production**
2. Click **"Create new release"**
3. Upload your signed `.aab` file (or use `eas submit --platform android --profile production`)
4. Write **release notes** (what's new):

```
Welcome to QR-X v1.0!

• Instant QR scanning with smart classification
• Supports 10+ QR types: URL, SMS, Email, Phone, WiFi, Crypto, vCard & more
• Built-in QR code generator for all types
• Full scan history with type filtering
• Lightning-fast and fully offline
• Donation-supported — no ads, ever
```

5. Choose your rollout strategy:

| Strategy | Best For |
|---|---|
| **Staged rollout (10–20%)** | Safer — catch issues before full release ✅ |
| **Full rollout (100%)** | If you're confident in stability |

6. Click **"Review release"** then **"Start rollout to Production"**

---

## ✅ Phase 10 — Review & Go Live

| Stage | Timeline |
|---|---|
| Submitted for review | Day 0 |
| Google review period | 3–7 days (first-time apps) |
| Approved & live on Play Store | Day 3–7 |
| Indexed in search results | Up to 24hrs after approval |

### If Rejected

- Read the **policy violation email** carefully
- Fix the flagged issue (most common: permissions, privacy policy, metadata)
- Resubmit — subsequent reviews are usually faster (1–3 days)

---

## ⚠️ Potential Review Risks

Watch out for these common rejection reasons specific to your app:

| Risk | Reason | Mitigation |
|---|---|---|
| `CAMERA` permission | Sensitive permission | Justify clearly in Data Safety form |
| `CHANGE_WIFI_STATE` | Can modify device settings | Explain WiFi QR auto-connect feature |
| Crypto QR feature | Flagged as financial | State clearly: address display only, not a wallet |
| SMS launching | High-risk if `SEND_SMS` used | Use `Intent` only — do NOT auto-send SMS |
| Missing privacy policy | Mandatory | Host it before submitting |
| Misleading screenshots | Policy violation | Ensure screenshots match actual app UI |

---

## 📚 Useful Links

| Resource | URL |
|---|---|
| Google Play Console | https://play.google.com/console |
| Play Policy Centre | https://play.google.com/about/developer-content-policy |
| EAS Build docs | https://docs.expo.dev/build/introduction/ |
| EAS Submit docs | https://docs.expo.dev/submit/introduction/ |
| EAS Credentials docs | https://docs.expo.dev/app-signing/managed-credentials/ |
| App signing docs (reference) | https://developer.android.com/studio/publish/app-signing |
| Data Safety guidance | https://support.google.com/googleplay/android-developer/answer/10787469 |
| Privacy Policy Generator | https://app-privacy-policy-generator.firebaseapp.com |
| Screenshot mockups | https://screenshots.pro |

---

## 🚧 EAS Todo Summary

Quick reference of what's left to do with Expo/EAS before submitting:

| Task | Command / Action |
|---|---|
| Set up signing credentials | `eas credentials` (or fill `credentials.json` + add `keystore.jks`) |
| Build production AAB | `eas build --platform android --profile production` |
| Submit to Play Console | `eas submit --platform android --profile production` |
| Fix icon alpha channel | Re-export `assets/android-icon-512.png` as flat RGB PNG |
| Host Privacy Policy | Deploy `PrivacyPolicyScreen` content to GitHub Pages or similar |
| Create feature graphic | 1024×500 px banner for Play Store listing |
| Take screenshots | Min 2 phone screenshots (see Phase 7 for recommended flow) |
| Fill store listing | Short description, full description, category in Play Console |
| Complete IARC questionnaire | Play Console → Policy → App Content |
| Complete Data Safety form | Play Console → Policy → Data Safety |

*Generated for QR Master — Advanced QR Scanning, Creating & Classification App*
*Covers: SMS • Email • Phone • WiFi • Crypto • URL • vCard • and more*