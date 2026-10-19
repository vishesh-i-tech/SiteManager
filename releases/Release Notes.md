# SiteSaathi Release Notes

## Version Information
- **Application Name:** SiteSaathi (साइट साथी)
- **Application ID:** `com.sitesaathi.app`
- **Version Name:** `1.0`
- **Version Code:** `1`
- **Build Date:** October 20, 2026
- **Package File:** `SiteSaathi v1.0.apk`
- **File Size:** 7,021,020 bytes (~6.70 MB)
- **Minimum Android SDK:** 24 (Android 7.0 Nougat)
- **Target Android SDK:** 36 (Android 16 preview / Android 15 compatibility)

---

## Cryptographic Signature & Integrity Verification

| Verification Attribute | Value / Status |
| :--- | :--- |
| **APK SHA-256 Checksum** | `857617CD50E3CE3865F14EE2EF5C9FC0E7C7E5CADAEC9887F4B2877BEF6441E7` |
| **Signature Verification (`apksigner`)** | **`Verifies: true`** |
| **Signature Scheme** | **APK Signature Scheme v2 (Full-file binary verification)** |
| **Signer Certificate DN** | `CN=SiteSaathi, OU=Mobile Engineering, O=SiteSaathi, L=New Delhi, ST=Delhi, C=IN` |
| **Certificate SHA-256 Fingerprint** | `42:D1:C7:1F:37:B6:9A:A0:4B:89:9A:74:DB:34:5C:55:BD:B7:20:94:A6:77:8C:D8:B6:DF:DF:9C:0C:91:AD:A8` |
| **Certificate Validity** | October 19, 2026 until March 06, 2054 (10,000 days) |

---

## What Is Included in This Build

1. **Unique SiteSaathi Branding & Startup:**
   - Custom SiteSaathi logo, adaptive icons, and vector emblems.
   - Synchronized high-resolution splash screen (`splash.png`) and zero-flicker native-to-web startup transition.
2. **Offline-First Data Architecture:**
   - 100% offline functionality powered by IndexedDB (`Dexie.js v4`).
   - Multi-contractor account isolation and PIN security.
   - Automated cascade deletions for sites, materials, attendance, and bills.
3. **Core Field Management Features:**
   - Voice-to-form smart entry supporting Hindi and English.
   - Client-side handwritten muster roll photo OCR (`Tesseract.js`).
   - Multi-trade token theming (General Construction, Plumbing & Sanitary, Electrical & Wiring).
   - Tool and machinery tracker with rental calculations and overdue return alerts.
   - Persistent pending dues tracker decoupled from physical work completion.
   - Client PDF statements and muster roll CSV export.
   - Google Drive backup option.

---

## Installation Guidance

### Important Notice for Upgrades from Debug Builds
- **Incompatible Signatures:** The previous test builds were signed with Android's default debug key (`CN=Android Debug`), whereas this build is signed with the permanent **SiteSaathi Release Key** (`CN=SiteSaathi`).
- **Direct Update Not Allowed by Android:** Android OS strictly forbids updating an app signed with one key over an app signed with a different key (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`).
- **Action Required:** If a debug version of SiteSaathi is currently installed on the target device:
  1. If you have existing site data, export your data via **Settings -> Export Backup** first.
  2. Uninstall the existing debug version from the device.
  3. Install `SiteSaathi v1.0.apk`.
  4. Subsequent updates signed with this release key will install seamlessly as standard in-place updates.

### Manual Sideloading Instructions
1. Transfer `SiteSaathi v1.0.apk` to your Android device (via USB, Google Drive, or local file transfer).
2. Tap the APK file in your device's file manager.
3. If prompted, enable "Install unknown apps" for your file manager.
4. Tap **Install** to complete installation.

---

## Known Limitations & Security Considerations

1. **Camera / Microphone Runtime Permissions:**
   - For Play Store submission, camera and microphone runtime permission declarations should be explicitly verified in `AndroidManifest.xml` if direct native sensor capture is invoked outside HTML5 file inputs.
2. **Local Storage Security:**
   - Credentials and PINs are stored offline in client-side IndexedDB. A future security hardening roadmap (Web Crypto API SHA-256 hashing and AES-GCM encrypted backups) is documented in [`docs/Security.md`](../docs/Security.md).
3. **Distribution Status:**
   - This APK is a verified, signed standalone package ready for private distribution and internal testing. It has not yet been submitted to Google Play Store.
