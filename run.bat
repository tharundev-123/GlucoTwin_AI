@echo off
title GlucoTwin AI - Digital Twin Dashboard
echo ========================================================
echo   GlucoTwin AI: Time-Series Digital Twin & Forecaster
echo ========================================================
cd /d "%~dp0"

IF NOT EXIST ".venv" (
    echo [1/3] Creating virtual environment (.venv)...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    echo [2/3] Installing dependencies from requirements.txt...
    pip install -r requirements.txt
) ELSE (
    call .venv\Scripts\activate.bat
)

IF NOT EXIST "ml\model.joblib" (
    echo [3/3] Training Random Forest digital twin model...
    python ml\train.py
)

echo.
echo Launching GlucoTwin AI web app in default browser...
start "" "http://127.0.0.1:8000/"
echo Server running at http://127.0.0.1:8000/ (Press Ctrl+C to stop)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
