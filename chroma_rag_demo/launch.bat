@echo off
title NeuralRAG Server
echo ============================================
echo       NeuralRAG - Local RAG System
echo ============================================
echo.
echo Starting NeuralRAG server...
echo.

cd /d "%~dp0"

echo Installing/checking dependencies...
pip install -r requirements.txt --quiet 2>nul

echo.
echo Server starting at: http://127.0.0.1:8000
echo.
echo Press Ctrl+C to stop the server.
echo ============================================

start "" http://127.0.0.1:8000

python main.py

pause
