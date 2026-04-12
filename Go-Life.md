# QR-X Play Store Go-Live Checklist

This document tracks release readiness for the Android Play Store launch.

## Current Status

- [x] Play Store developer account is set up
- [x] Store graphics are prepared (banners + screenshots)
- [x] Privacy Policy is available online
- [x] Terms of Service is available online

## Release Checklist

### 1. Store Listing

- [x] App name finalized: QR-X
- [x] Feature graphic uploaded (1024x500)
- [x] Phone screenshots uploaded (minimum 2)
- [x] Short description drafted (max 80 chars)
- [x] Full description drafted (max 4000 chars)
- [ ] App category and tags confirmed

### 2. Legal and Compliance

- [x] Privacy Policy URL is live
- [x] Terms of Service URL is live
- [ ] Data Safety form completed in Play Console
- [ ] Content rating questionnaire (IARC) completed

### 3. Build and Signing

- [ ] Production Android build generated (AAB)
- [ ] Signing keystore verified and backed up
- [ ] Version name verified (app.json)
- [ ] Version code increment confirmed

### 4. Release Submission

- [ ] AAB uploaded to Play Console (or submitted via EAS Submit)
- [x] Release notes drafted
- [ ] Release saved in Production track
- [ ] Policy checks show no blocking issues
- [ ] Release sent for review

### 5. Post-Submission

- [ ] Monitor Play Console review feedback
- [ ] Address any rejection notes if needed
- [ ] Publish rollout after approval

## Store Listing Draft Copy

### Short Description (80 chars max)

Scan, create, and manage QR codes for links, Wi-Fi, contacts, crypto, and more.

### Full Description

QR-X is your all-in-one QR toolkit for daily use.

Scan QR codes instantly, generate your own in seconds, and keep everything organized in one clean app.

What you can do with QR-X:

- Scan QR codes quickly with a simple camera interface
- Generate QR codes for text, links, contacts, Wi-Fi, events, crypto, and more
- Save and review scan history
- Copy results fast and share generated codes
- Use a clean experience with no ads

Built for speed and reliability, QR-X helps you move from scan to action without friction.

Whether you need to connect to Wi-Fi, share contact info, open links, or create professional QR codes, QR-X keeps the process simple and secure.

### Suggested Category and Tags

- Category: Tools
- Tags: Productivity, Utilities

## Release Notes Draft (v1.0)

- Initial public release of QR-X
- Fast QR scanning with improved camera flow
- QR generation for text, URL, contact, Wi-Fi, location, event, crypto, email, phone, and SMS
- Save, share, and manage generated QR codes
- Cleaner Settings experience with linked Help Center and online legal pages
- Performance and stability improvements for production release

## Quick Commands

```bash
# Build production Android AAB
eas build --platform android --profile production

# Optional: submit directly to Play Console
eas submit --platform android --profile production
```

## Important URLs

- Help Center: https://myagorahub.github.io/qr-x-wiki/
- Privacy Policy: https://myagorahub.github.io/qr-x-wiki/legal/privacy-policy
- Terms of Service: https://myagorahub.github.io/qr-x-wiki/legal/terms-of-service

## Notes for This Release

- Removed Beta/Preview badges from Settings header
- Version is displayed in a dedicated badge in Settings
- Legal pages in Settings now open hosted online versions
- Help Center in Settings now points to the wiki
