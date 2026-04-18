@echo off
echo ================================
echo  Test Case Generator Launcher
echo ================================

:: Add Node.js to PATH
set PATH=%PATH%;C:\Program Files\nodejs\

:: Start Backend
echo [1/2] Starting Backend on port 3001...
start "Backend - TCG" cmd /k "cd /d C:\GrowWith\Project_001_TestCaseGenerator_LLLM\backend && set PATH=%PATH%;C:\Program Files\nodejs\ && npx ts-node index.ts"

:: Wait 2 seconds then start Frontend
timeout /t 2 /nobreak > nul

echo [2/2] Starting Frontend on port 5175...
start "Frontend - TCG" cmd /k "cd /d C:\GrowWith\Project_001_TestCaseGenerator_LLLM\frontend && set PATH=%PATH%;C:\Program Files\nodejs\ && npm run dev -- --host 127.0.0.1"

:: Wait then open browser
timeout /t 3 /nobreak > nul

echo Opening browser...
start http://127.0.0.1:5175

echo.
echo ================================
echo  App is launching!
echo  Frontend: http://127.0.0.1:5175
echo  Backend:  http://127.0.0.1:3001
echo ================================
echo  Make sure Ollama is running too.
echo  If not, open a terminal and run:
echo    ollama serve
echo ================================
