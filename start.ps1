# GlucoTwin AI - Single Click PowerShell Launcher
$Host.UI.RawUI.WindowTitle = "GlucoTwin AI - Digital Twin Dashboard"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  GlucoTwin AI: Time-Series Digital Twin & Forecaster" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".venv")) {
    Write-Host "[1/3] Creating virtual environment (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "[2/3] Installing dependencies..." -ForegroundColor Yellow
    & .\.venv\Scripts\pip install -r requirements.txt
}

if (-not (Test-Path "ml\model.joblib")) {
    Write-Host "[3/3] Training Random Forest model..." -ForegroundColor Yellow
    & .\.venv\Scripts\python ml\train.py
}

Write-Host ""
Write-Host "Launching GlucoTwin AI web app in default browser..." -ForegroundColor Green
Start-Process "http://127.0.0.1:8000/"
Write-Host "Server running at http://127.0.0.1:8000/ (Press Ctrl+C to stop)" -ForegroundColor Green
& .\.venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
