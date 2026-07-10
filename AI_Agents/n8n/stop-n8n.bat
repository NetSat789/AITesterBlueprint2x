@echo off
echo ==========================================
echo   n8n - Stopping Container
echo ==========================================
echo.

docker stop n8n-local
echo.
echo [OK] n8n has been stopped.
echo     Your workflows and data are saved.
echo     Run launch-n8n.bat to start again.
echo.
pause
