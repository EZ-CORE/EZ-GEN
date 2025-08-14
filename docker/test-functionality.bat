@echo off
REM EZ-GEN Docker Functionality Test for Windows

echo 🧪 Testing EZ-GEN App Generation in Docker Container
echo =================================================
echo.

REM Test 1: Check if container is running
echo ℹ️ Test 1: Checking if EZ-GEN container is running...
docker ps | findstr ez-gen >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ EZ-GEN container is running
) else (
    echo ❌ EZ-GEN container is not running. Start it with: docker-manage.bat start
    pause
    exit /b 1
)
echo.

REM Test 2: Check API health
echo ℹ️ Test 2: Testing API health endpoint...
curl -s -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API health endpoint is responding
    for /f "delims=" %%i in ('curl -s http://localhost:3000/api/health') do echo     Response: %%i
) else (
    echo ❌ API health endpoint is not responding
    pause
    exit /b 1
)
echo.

REM Test 3: Check build environment inside container
echo ℹ️ Test 3: Checking build environment inside container...
docker exec ez-gen-app npm run check-environment
if %errorlevel% equ 0 (
    echo ✅ Build environment check completed
) else (
    echo ⚠️ Build environment has some issues, but continuing...
)
echo.

REM Test 4: Check if volumes are mounted correctly
echo ℹ️ Test 4: Checking volume mounts...
docker exec ez-gen-app ls -la /app/generated-apps >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Generated apps volume is mounted
) else (
    echo ❌ Generated apps volume mount issue
)

docker exec ez-gen-app ls -la /app/uploads >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Uploads volume is mounted
) else (
    echo ❌ Uploads volume mount issue
)

docker exec ez-gen-app ls -la /app/apks >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ APKs volume is mounted
) else (
    echo ❌ APKs volume mount issue
)
echo.

REM Test 5: Check Android SDK components
echo ℹ️ Test 5: Checking Android SDK components...
docker exec ez-gen-app test -d /opt/android-sdk/platform-tools >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Android platform-tools are installed
) else (
    echo ❌ Android platform-tools are missing
)

docker exec ez-gen-app test -d /opt/android-sdk/platforms/android-34 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Android platform-34 is installed
) else (
    echo ❌ Android platform-34 is missing
)
echo.

REM Test 6: Check if container can access external websites
echo ℹ️ Test 6: Testing external website access...
docker exec ez-gen-app curl -s -f https://www.google.com >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Container can access external websites
) else (
    echo ❌ Container cannot access external websites
)
echo.

echo ✅ 🎉 Docker functionality tests completed!
echo.
echo ℹ️ Next steps:
echo   1. Open http://localhost:3000 in your browser
echo   2. Try generating a test app
echo   3. Check logs with: docker logs -f ez-gen-app
echo   4. Access container shell with: docker exec -it ez-gen-app bash
echo.
pause
