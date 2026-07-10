@echo off
echo ================================================
echo   Advanced RAG Explorer - Launcher
echo ================================================
echo.

cd /d "%~dp0backend"

echo [1/2] Installing Python dependencies...
pip install -r requirements.txt -q
if errorlevel 1 (
    echo ERROR: pip install failed.
    pause
    exit /b 1
)

echo [2/2] Starting FastAPI server on http://127.0.0.1:8001
echo.
echo  Open your browser to: http://127.0.0.1:8001
echo  Press Ctrl+C to stop.
echo.

timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8001"

python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload

pause
