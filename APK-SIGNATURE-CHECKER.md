# APK Signature Checker

A comprehensive script to check if an Android APK file is properly signed for distribution.

## Files

- `check-apk-signature.ps1` - PowerShell script with full functionality
- `check-apk-signature.bat` - Batch file wrapper for easy usage

## Features

✅ **Dual Verification Methods:**
- ZIP analysis of META-INF directory
- Java keytool certificate verification

✅ **Detailed Information:**
- Lists all signing files (.RSA, .DSA, .SF, MANIFEST.MF)
- Shows certificate details (owner, validity, algorithm, key size)
- Displays APK file information (size, path, modification date)

✅ **Clear Results:**
- Color-coded output (Green = signed, Red = not signed)
- Helpful recommendations for unsigned APKs
- Error handling for missing files or tools

## Usage

### PowerShell (Recommended)
```powershell
.\check-apk-signature.ps1 "path\to\your\app.apk"
```

### Batch File (Simple)
```cmd
check-apk-signature.bat "path\to\your\app.apk"
```

## Examples

```powershell
# Check a specific APK
.\check-apk-signature.ps1 "app-release.apk"

# Check generated APK from EZ-GEN
.\check-apk-signature.ps1 "generated-apps\6ee3ca69-c412-49af-bbc0-7f28a5ba8345\android\app\build\outputs\apk\release\app-release.apk"
```

## Sample Output

### Signed APK
```
APK Signature Checker
====================

APK File Information:
   File: app-release.apk
   Size: 1.22 MB (1279946 bytes)
   Modified: 07/23/2025 11:16:21

Method 1: Checking META-INF directory...
APK IS SIGNED

Signing files found:
   Manifest : META-INF/MANIFEST.MF
   Signature File : META-INF/RELEASE-.SF
   RSA Certificate : META-INF/RELEASE-.RSA

Method 2: Using keytool verification...
Keytool verification: SIGNED

Certificate details:
   Owner: CN=Test Play Store App, OU=Mobile Development, O=Test Play Store App, L=City, ST=State, C=US
   Valid: Tue Jul 22 13:19:31 SGT 2025 until Sat Dec 07 13:19:31 SGT 2052
   Algorithm: SHA384withRSA
   Key size: 2048-bit

FINAL RESULT:
APK IS SIGNED - Ready for distribution!

This APK can be:
   • Uploaded to Google Play Store
   • Distributed through other app stores
   • Side-loaded on devices
```

### Unsigned APK
```
APK Signature Checker
====================

Method 1: Checking META-INF directory...
APK IS NOT SIGNED

FINAL RESULT:
APK IS NOT SIGNED - Cannot be distributed!

To sign this APK:
   • Use jarsigner: jarsigner -keystore keystore.jks app.apk alias
   • Or rebuild with signing configuration in Gradle
```

## Requirements

- Windows PowerShell 5.1 or later
- Java JDK (for keytool command) - optional but recommended
- .NET Framework (for ZIP file handling)

## Error Handling

The script handles various error conditions:
- Missing APK files
- Invalid APK format
- Missing Java/keytool
- Corrupted ZIP files
- Access permission issues

## Integration with EZ-GEN

This script is designed to work with the EZ-GEN build system to verify that generated APKs are properly signed before distribution to app stores.

For automated checking in build pipelines, use the PowerShell script directly:

```powershell
$result = .\check-apk-signature.ps1 "path\to\app.apk"
if ($LASTEXITCODE -eq 0) {
    Write-Host "APK is signed and ready for distribution"
} else {
    Write-Host "APK is not signed - build failed"
    exit 1
}
```
