"""
Router for ML model performance metrics and feature importance.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from backend.services import twin_service
from backend.schemas import ModelMetricsResponse

router = APIRouter(prefix="/api/v1/model", tags=["Model Analytics"])


@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    """
    Retrieve honest, reproducible evaluation metrics comparing the trained model
    to a simple persistence baseline on chronological holdout test data.
    """
    return twin_service.get_metrics()


@router.get("/feature-importance", response_model=List[Dict[str, Any]])
def get_feature_importance():
    """Retrieve ranked Gini importance scores across all time-series and contextual features."""
    return twin_service.get_feature_importance()
