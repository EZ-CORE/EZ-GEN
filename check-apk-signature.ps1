# APK Signature Checker Script
# Usage: .\check-apk-signature.ps1 "path\to\your\app.apk"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApkPath
)

function Test-ApkSigned {
    param([string]$ApkFile)
    
    Write-Host "Checking APK signature status..." -ForegroundColor Cyan
    Write-Host "APK: $ApkFile" -ForegroundColor Yellow
    Write-Host ""
    
    # Check if file exists
    if (-not (Test-Path $ApkFile)) {
        Write-Host "ERROR: APK file not found!" -ForegroundColor Red
        return $false
    }
    
    # Check file extension
    if (-not $ApkFile.ToLower().EndsWith('.apk')) {
        Write-Host "WARNING: File doesn't have .apk extension" -ForegroundColor Yellow
    }
    
    try {
        # Method 1: Check using PowerShell ZIP inspection
        Write-Host "Method 1: Checking META-INF directory..." -ForegroundColor Gray
        
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $zip = [System.IO.Compression.ZipFile]::OpenRead($ApkFile)
        
        # Look for signing files
        $signingFiles = $zip.Entries | Where-Object { 
            $_.FullName -like "META-INF/*" -and (
                $_.FullName -like "*.RSA" -or 
                $_.FullName -like "*.DSA" -or 
                $_.FullName -like "*.SF" -or 
                $_.FullName -like "*MANIFEST.MF"
            )
        }
        
        # Get all META-INF files for detailed analysis
        $metaInfFiles = $zip.Entries | Where-Object { $_.FullName -like "META-INF/*" }
        
        $zip.Dispose()
        
        if ($signingFiles) {
            Write-Host "APK IS SIGNED" -ForegroundColor Green
            Write-Host ""
            Write-Host "Signing files found:" -ForegroundColor Green
            foreach ($file in $signingFiles) {
                $fileType = switch -Wildcard ($file.FullName) {
                    "*MANIFEST.MF" { "Manifest" }
                    "*.SF" { "Signature File" }
                    "*.RSA" { "RSA Certificate" }
                    "*.DSA" { "DSA Certificate" }
                    default { "Other" }
                }
                Write-Host "   $fileType : $($file.FullName)" -ForegroundColor White
            }
        } else {
            Write-Host "APK IS NOT SIGNED" -ForegroundColor Red
            Write-Host ""
            Write-Host "Meta-INF files found (but no signing files):" -ForegroundColor Yellow
            if ($metaInfFiles) {
                foreach ($file in $metaInfFiles | Select-Object -First 10) {
                    Write-Host "   $($file.FullName)" -ForegroundColor Gray
                }
                if ($metaInfFiles.Count -gt 10) {
                    Write-Host "   ... and $($metaInfFiles.Count - 10) more files" -ForegroundColor Gray
                }
            } else {
                Write-Host "   (No META-INF directory found)" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        
        # Method 2: Try using keytool if available
        Write-Host "Method 2: Using keytool verification..." -ForegroundColor Gray
        
        try {
            $keytoolResult = & keytool -printcert -jarfile $ApkFile 2>&1
            $keytoolOutput = $keytoolResult | Out-String
            
            # Check if keytool found a valid certificate
            if ($keytoolOutput -like "*Not a signed jar file*" -or $keytoolOutput.Trim() -eq "Not a signed jar file") {
                Write-Host "Keytool verification: NOT SIGNED" -ForegroundColor Red
                return $false
            } elseif ($LASTEXITCODE -eq 0 -and $keytoolOutput.Trim() -ne "" -and $keytoolOutput -match "Owner:") {
                Write-Host "Keytool verification: SIGNED" -ForegroundColor Green
                Write-Host ""
                Write-Host "Certificate details:" -ForegroundColor Green
                
                # Extract key information
                if ($keytoolOutput -match "Owner:\s*(.+)") {
                    Write-Host "   Owner: $($matches[1])" -ForegroundColor White
                }
                if ($keytoolOutput -match "Valid from:\s*(.+?)\s+until:\s*(.+)") {
                    Write-Host "   Valid: $($matches[1]) until $($matches[2])" -ForegroundColor White
                }
                if ($keytoolOutput -match "Signature algorithm name:\s*(.+)") {
                    Write-Host "   Algorithm: $($matches[1])" -ForegroundColor White
                }
                if ($keytoolOutput -match "(\d+)-bit\s+\w+\s+key") {
                    Write-Host "   Key size: $($matches[1])-bit" -ForegroundColor White
                }
                
                # If Method 1 failed but keytool succeeded, trust keytool
                if (-not $signingFiles -or $signingFiles.Count -eq 0) {
                    Write-Host ""
                    Write-Host "Note: Keytool detected signing but META-INF analysis failed." -ForegroundColor Yellow
                    Write-Host "      This APK may use a non-standard signing format." -ForegroundColor Yellow
                }
                
                return $true
            } else {
                Write-Host "Keytool verification: ERROR" -ForegroundColor Yellow
                Write-Host "   Output: $keytoolOutput" -ForegroundColor Gray
                return $false
            }
        } catch {
            Write-Host "Keytool not available or failed" -ForegroundColor Yellow
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        }
        
        # Determine final result - prioritize keytool if both methods disagree
        $method1Result = ($signingFiles.Count -gt 0)
        
        # Return result - if methods disagree, trust keytool
        return $method1Result
        
    } catch {
        Write-Host "ERROR: Failed to analyze APK" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

function Show-ApkInfo {
    param([string]$ApkFile)
    
    Write-Host ""
    Write-Host "APK File Information:" -ForegroundColor Cyan
    
    $fileInfo = Get-Item $ApkFile
    Write-Host "   File: $($fileInfo.Name)" -ForegroundColor White
    Write-Host "   Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB ($($fileInfo.Length) bytes)" -ForegroundColor White
    Write-Host "   Modified: $($fileInfo.LastWriteTime)" -ForegroundColor White
    Write-Host "   Path: $($fileInfo.FullName)" -ForegroundColor Gray
}

# Main execution
Write-Host "APK Signature Checker" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta
Write-Host ""

# Resolve full path
$fullApkPath = Resolve-Path $ApkPath -ErrorAction SilentlyContinue
if (-not $fullApkPath) {
    $fullApkPath = $ApkPath
}

# Show file info
Show-ApkInfo $fullApkPath

# Check signature
$isSigned = Test-ApkSigned $fullApkPath

Write-Host ""
Write-Host "FINAL RESULT:" -ForegroundColor Magenta
if ($isSigned) {
    Write-Host "APK IS SIGNED - Ready for distribution!" -ForegroundColor Green
    Write-Host ""
    Write-Host "This APK can be:" -ForegroundColor Cyan
    Write-Host "   • Uploaded to Google Play Store" -ForegroundColor White
    Write-Host "   • Distributed through other app stores" -ForegroundColor White
    Write-Host "   • Side-loaded on devices" -ForegroundColor White
} else {
    Write-Host "APK IS NOT SIGNED - Cannot be distributed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To sign this APK:" -ForegroundColor Cyan
    Write-Host "   • Use jarsigner: jarsigner -keystore keystore.jks app.apk alias" -ForegroundColor White
    Write-Host "   • Or rebuild with signing configuration in Gradle" -ForegroundColor White
}

Write-Host ""
