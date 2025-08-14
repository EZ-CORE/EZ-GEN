@echo off
REM APK Signature Checker - Simple Batch Wrapper
REM Usage: check-apk-signature.bat "path\to\your\app.apk"

if "%~1"=="" (
    echo.
    echo APK Signature Checker
    echo ==================== 
    echo.
    echo Usage: %~nx0 "path\to\your\app.apk"
    echo.
    echo Examples:
    echo   %~nx0 "app-release.apk"
    echo   %~nx0 "generated-apps\app-id\android\app\build\outputs\apk\release\app-release.apk"
    echo.
    goto :end
)

REM Check if PowerShell script exists
if not exist "%~dp0check-apk-signature.ps1" (
    echo ERROR: check-apk-signature.ps1 not found in the same directory!
    goto :end
)

REM Run the PowerShell script
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-apk-signature.ps1" "%~1"

:end
pause
