"""
Router for virtual digital twin state and historical telemetry.
"""

from fastapi import APIRouter, Query
from typing import Dict, Any, List
from backend.services import twin_service
from backend.schemas import TwinState

router = APIRouter(prefix="/api/v1/twin", tags=["Digital Twin"])


@router.get("/demo-patient/state", response_model=TwinState)
def get_twin_state():
    """Retrieve current virtual twin snapshot for demo patient."""
    return twin_service.get_state()


@router.get("/demo-patient/history")
def get_twin_history(limit: int = Query(48, ge=6, le=288, description="Number of past 5-minute ticks")):
    """Retrieve recent observed time-series data for the virtual patient."""
    history = twin_service.get_history(limit=limit)
    return {
        "patient_id": "demo-patient",
        "count": len(history),
        "limit_requested": limit,
        "sampling_minutes": 5,
        "history": history
    }
