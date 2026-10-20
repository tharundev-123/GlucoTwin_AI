"""
GlucoTwin AI - FastAPI Application
Digital Twin Challenge 2026 - Unstop

Time-series virtual patient digital twin with 2-hour glucose trend forecasting,
uncertainty quantification, and what-if simulation scenarios.
Educational and research demonstration only. Not a medical device.
"""

from pathlib import Path
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.schemas import HealthResponse
from backend.services import twin_service
from backend.routers import twin, forecast, simulation, model

app = FastAPI(
    title="GlucoTwin AI API",
    version="1.0.0",
    description=(
        "Educational & Research Digital Twin for Glucose Trend Forecasting (2 Hours Ahead). "
        "Built for Unstop Digital Twin Challenge 2026. "
        "Strictly uses synthetic demonstration telemetry. Never for clinical diagnosis or treatment."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Versioned Routers (Recommended API)
app.include_router(twin.router)
app.include_router(forecast.router)
app.include_router(simulation.router)
app.include_router(model.router)


# Health check endpoint
@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """System health check and regulatory scope declaration."""
    return HealthResponse(
        status="ok",
        project="GlucoTwin AI",
        version="1.0.0",
        data_mode="synthetic",
        forecast_horizon_minutes=120,
        notice="Educational prototype for Unstop Digital Twin Challenge 2026. Not a medical device."
    )


# Backward-compatible convenience aliases
@app.get("/twin/demo-patient", tags=["Legacy Compatibility"])
def legacy_twin_state():
    return twin_service.get_state()


@app.get("/twin/demo-patient/history", tags=["Legacy Compatibility"])
def legacy_twin_history(limit: int = 48):
    return {
        "patient_id": "demo-patient",
        "count": min(limit, len(twin_service.raw_df)),
        "history": twin_service.get_history(limit=limit)
    }


@app.get("/forecast/demo-patient", tags=["Legacy Compatibility"])
def legacy_forecast(horizon_minutes: int = 120):
    return twin_service.get_forecast(horizon_minutes=horizon_minutes)


@app.post("/twin/demo-patient/simulate", tags=["Legacy Compatibility"])
def legacy_simulate():
    state, fc = twin_service.step(steps=1)
    return {"message": "Advanced twin by 5 minutes.", "state": state, "forecast": fc}


@app.post("/twin/demo-patient/reset", tags=["Legacy Compatibility"])
def legacy_reset():
    twin_service.reset()
    return {"message": "Digital twin reset to baseline state.", "state": twin_service.get_state()}


@app.get("/ml/metrics", tags=["Legacy Compatibility"])
def legacy_metrics():
    return twin_service.get_metrics()


# Mount frontend static distribution
FRONTEND_DIST = ROOT / "frontend" / "dist"
FRONTEND_DIR = ROOT / "frontend"

if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend_dist")
elif FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend_static")
