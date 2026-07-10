@echo off
echo ==========================================
echo   n8n AI Automation Platform - Launcher
echo ==========================================
echo.

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is NOT running!
    echo Please start Docker Desktop first, then run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running.
echo.

:: Check if n8n container already exists
docker ps -a --filter "name=n8n-local" --format "{{.Names}}" 2>nul | findstr /i "n8n-local" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Found existing n8n container. Starting it...
    docker start n8n-local
) else (
    echo [INFO] Creating new n8n container...
    docker run -d ^
        --name n8n-local ^
        -p 5678:5678 ^
        -v n8n_data:/home/node/.n8n ^
        -e GENERIC_TIMEZONE=Asia/Kolkata ^
        -e TZ=Asia/Kolkata ^
        --restart unless-stopped ^
        n8nio/n8n
)

:: Wait for n8n to be ready
echo.
echo [WAIT] Waiting for n8n to start...
timeout /t 5 /nobreak > nul

:: Open browser
echo [OK] Opening n8n in browser...
start http://localhost:5678

echo.
echo ==========================================
echo   n8n is running!
echo   URL: http://localhost:5678
echo ==========================================
echo.
echo   To STOP n8n later, run:
echo     docker stop n8n-local
echo.
echo   To view logs:
echo     docker logs n8n-local -f
echo ==========================================
echo.
pause
