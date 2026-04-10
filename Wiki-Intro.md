# QR-X Wiki: Quick Introduction

## What QR-X Is
QR-X is a mobile QR utility app built with Expo and React Native. It helps users scan, understand, create, save, and share QR codes from one place.

The app is designed for everyday utility use: quick scanning, fast QR generation for common formats, and simple history management without requiring account setup for core features.

## What Users Can Do
- Scan QR codes with the device camera.
- Auto-detect and parse common QR content types.
- Create QR codes for popular use cases.
- Save and share generated QR images.
- Keep a local history of scanned and generated items.
- Favorite, filter, and manage saved history entries.

## Supported QR Content
QR-X currently supports a wide range of content, including:
- Text
- URLs
- Contacts (vCard/MECARD)
- WiFi credentials
- Location coordinates
- Calendar events
- Crypto wallet/payment formats
- Email, phone, and SMS payloads

## Product Direction
QR-X includes a Smart QR / Action Hub mode in the codebase. This mode is intended to support dynamic, action-driven QR experiences (for example, routed links and backend-triggered actions), but it is currently feature-flagged and not enabled in the default user flow.

## Privacy and Data Model (Current)
- Core scan history and app settings are stored locally on-device.
- Camera access is used for scanning.
- Clipboard, media library, and sharing are used only when users trigger related actions.

## Tech Snapshot
- Framework: Expo + React Native + TypeScript
- Navigation: React Navigation (bottom tabs)
- Local persistence: AsyncStorage
- QR rendering: react-native-qrcode-svg

## Audience
QR-X is built for users who need a practical QR toolbox: individuals, small businesses, and teams that frequently scan or generate QR content for daily workflows.
