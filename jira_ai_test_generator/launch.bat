@echo off
echo Starting Jira AI Test Case Generator...

:: Start the FastAPI backend in a new command window
echo Starting backend server on port 8000...
start "Backend Server" cmd /k "cd backend && if not exist venv (python -m venv venv && call venv\Scripts\activate && pip install -r requirements.txt) else (call venv\Scripts\activate) && uvicorn main:app --reload --port 8000"

:: Start the Vite frontend in a new command window
echo Starting frontend server on port 5173...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Application launched! 
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo.
