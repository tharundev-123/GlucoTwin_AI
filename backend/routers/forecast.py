"""
Router for glucose trend forecasting and uncertainty bounds.
"""

from fastapi import APIRouter, Query
from backend.services import twin_service
from backend.schemas import ForecastResponse

router = APIRouter(prefix="/api/v1/forecast", tags=["Forecasting"])


@router.get("/demo-patient", response_model=ForecastResponse)
def get_forecast(horizon_minutes: int = Query(120, description="Forecast horizon in minutes (default: 120)")):
    """
    Generate 2-hour ahead glucose trend forecast with defensible uncertainty quantification.
    Uses time-series features strictly derived from available observations without future leakage.
    """
    return twin_service.get_forecast(horizon_minutes=horizon_minutes)
