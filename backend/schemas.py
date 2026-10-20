"""
Pydantic schemas for GlucoTwin AI API endpoints.
All data models include strict typing, field descriptions, and illustrative constraints.
Notice: Educational digital twin demonstration. Not clinical data or medical devices.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field("ok", description="API health status")
    project: str = Field("GlucoTwin AI", description="Project name")
    version: str = Field("1.0.0", description="API semantic version")
    data_mode: str = Field("synthetic", description="Underlying time-series data source mode")
    forecast_horizon_minutes: int = Field(120, description="Standard model forecast horizon in minutes")
    notice: str = Field(
        "Educational prototype for Unstop Digital Twin Challenge 2026. Not a medical device.",
        description="Safety disclaimer"
    )


class TwinState(BaseModel):
    patient_id: str = Field("demo-patient", description="Unique identifier for demo virtual patient")
    virtual_twin_status: str = Field("simulated", description="Digital twin operational status")
    timestamp: str = Field(..., description="ISO 8601 timestamp of current virtual state")
    current_glucose_mg_dl: float = Field(..., description="Current simulated glucose in mg/dL")
    rate_of_change_mg_dl_min: float = Field(0.0, description="Estimated glucose velocity (rate of change)")
    glucose_status_label: str = Field(..., description="Illustrative demo status: in_target, low_caution, elevated_caution")
    heart_rate_bpm: float = Field(..., description="Simulated heart rate in beats per minute")
    activity_level_0_1: float = Field(..., description="Simulated exertion level (0.0 to 1.0 scale)")
    estimated_meal_carbs_g: float = Field(..., description="Recent carbohydrate intake estimate in grams")
    sleep_hours: float = Field(..., description="Recorded sleep duration in hours")
    simulation_running: bool = Field(False, description="Whether background simulation stream is running")
    notice: str = Field(
        "Synthetic demo patient telemetry. Strictly for research and education.",
        description="Medical disclaimer"
    )


class HistoryRecord(BaseModel):
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    time_str: str = Field(..., description="Formatted clock time HH:MM")
    glucose: float = Field(..., description="Observed simulated glucose in mg/dL")
    heart_rate: float = Field(..., description="Heart rate in bpm")
    activity: float = Field(..., description="Activity level 0-1")
    meal_carbs_g: float = Field(..., description="Meal carbohydrate intake in grams")
    sleep_hours: float = Field(..., description="Sleep hours")
    is_forecast: bool = Field(False, description="Flag indicating whether point is an observed value or forecast")


class ForecastResponse(BaseModel):
    patient_id: str = Field("demo-patient", description="Patient ID")
    forecast_horizon_minutes: int = Field(120, description="Prediction horizon in minutes")
    forecast_timestamp: str = Field(..., description="Target future timestamp predicted")
    predicted_glucose_mg_dl: float = Field(..., description="Point forecast in mg/dL")
    delta_from_current_mg_dl: float = Field(..., description="Difference from latest observed glucose")
    uncertainty_std_err_mg_dl: float = Field(..., description="Inter-tree standard error uncertainty estimate")
    confidence_interval_95: Dict[str, float] = Field(
        ...,
        description="Defensible 95% confidence interval bounds: lower and upper in mg/dL"
    )
    illustrative_target_range: Dict[str, float] = Field(
        {"min": 70.0, "max": 180.0},
        description="Target illustrative glucose boundaries in mg/dL"
    )
    projected_trajectory: List[Dict[str, Any]] = Field(
        ...,
        description="Projected glucose points stepping toward the 120-minute horizon"
    )
    model: str = Field("RandomForestRegressor (150 trees)", description="Model algorithm used")
    notice: str = Field(
        "Forecast is generated from synthetic time-series data. Not for diagnosis, insulin dosage, or medical decisions.",
        description="Safety warning"
    )


class SimulationStepInput(BaseModel):
    meal_carbs_g: Optional[float] = Field(0.0, ge=0.0, le=120.0, description="Carbohydrate intake in grams")
    activity_level: Optional[float] = Field(0.35, ge=0.0, le=1.0, description="Physical exertion index (0.0=resting, 1.0=peak)")
    sleep_hours: Optional[float] = Field(7.0, ge=3.0, le=14.0, description="Sleep duration in hours")
    steps: Optional[int] = Field(1, ge=1, le=24, description="Number of 5-minute ticks to advance (e.g., 1 = 5m, 12 = 1h)")


class WhatIfRequest(BaseModel):
    scenario_name: str = Field("Custom Scenario", description="Label for what-if scenario")
    hypothetical_carbs_g: float = Field(45.0, ge=0.0, le=120.0, description="Hypothetical meal carbs (g)")
    hypothetical_activity_level: float = Field(0.6, ge=0.0, le=1.0, description="Hypothetical exertion (0.0 to 1.0)")
    duration_minutes: int = Field(120, ge=30, le=240, description="Simulation projection window in minutes")


class WhatIfResponse(BaseModel):
    scenario_name: str = Field(..., description="Name of the scenario")
    baseline_2h_glucose_mg_dl: float = Field(..., description="Current baseline 2h predicted glucose")
    scenario_2h_glucose_mg_dl: float = Field(..., description="Hypothetical 2h predicted glucose under scenario")
    net_impact_mg_dl: float = Field(..., description="Difference attributable to hypothetical scenario inputs")
    explanation: str = Field(..., description="Analytical description of the physiological simulation effect")
    limitation_notice: str = Field(
        "Hypothetical educational simulation only. Does NOT establish causal or clinically reliable outcomes. Never use for insulin planning.",
        description="Crucial limitation warning"
    )


class ModelMetricsResponse(BaseModel):
    dataset_name: str
    data_provenance: str
    sampling_rate_minutes: int
    forecast_horizon_minutes: int
    train_samples: int
    test_samples: int
    split_strategy: str
    model_architecture: str
    model_metrics: Dict[str, float]
    baseline_persistence_metrics: Dict[str, float]
    comparison: Dict[str, Any]
    feature_importances: List[Dict[str, Any]]
    disclaimer: str
