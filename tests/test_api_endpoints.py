"""
Integration tests for FastAPI REST endpoints.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["project"] == "GlucoTwin AI"
    assert data["forecast_horizon_minutes"] == 120
    assert "Not a medical device" in data["notice"]


def test_twin_state_endpoint():
    response = client.get("/api/v1/twin/demo-patient/state")
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "demo-patient"
    assert "current_glucose_mg_dl" in data
    assert "heart_rate_bpm" in data
    assert "activity_level_0_1" in data
    assert "rate_of_change_mg_dl_min" in data
    assert data["glucose_status_label"] in ["in_target", "low_caution", "elevated_caution"]


def test_twin_history_endpoint():
    response = client.get("/api/v1/twin/demo-patient/history?limit=24")
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "demo-patient"
    assert "history" in data
    assert len(data["history"]) == 24
    assert data["history"][0]["is_forecast"] is False


def test_forecast_endpoint_120m():
    response = client.get("/api/v1/forecast/demo-patient?horizon_minutes=120")
    assert response.status_code == 200
    data = response.json()
    assert data["forecast_horizon_minutes"] == 120
    assert "predicted_glucose_mg_dl" in data
    assert "confidence_interval_95" in data
    ci = data["confidence_interval_95"]
    assert ci["lower_mg_dl"] <= data["predicted_glucose_mg_dl"] <= ci["upper_mg_dl"]
    assert len(data["projected_trajectory"]) > 0


def test_simulation_controls():
    # 1. Start
    res_start = client.post("/api/v1/simulation/start")
    assert res_start.status_code == 200
    assert res_start.json()["simulation_running"] is True

    # 2. Pause
    res_pause = client.post("/api/v1/simulation/pause")
    assert res_pause.status_code == 200
    assert res_pause.json()["simulation_running"] is False

    # 3. Step
    step_payload = {
        "meal_carbs_g": 35.0,
        "activity_level": 0.4,
        "sleep_hours": 7.0,
        "steps": 2
    }
    res_step = client.post("/api/v1/simulation/step", json=step_payload)
    assert res_step.status_code == 200
    assert res_step.json()["ticks_advanced"] == 2
    assert res_step.json()["minutes_advanced"] == 10

    # 4. Reset
    res_reset = client.post("/api/v1/simulation/reset")
    assert res_reset.status_code == 200
    assert res_reset.json()["status"] == "reset"


def test_what_if_scenario_endpoint():
    payload = {
        "scenario_name": "Post-Dinner Walk",
        "hypothetical_carbs_g": 50.0,
        "hypothetical_activity_level": 0.65,
        "duration_minutes": 120
    }
    response = client.post("/api/v1/simulation/what-if", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "Post-Dinner Walk"
    assert "net_impact_mg_dl" in data
    assert "limitation_notice" in data


def test_model_metrics_and_feature_importance():
    res_metrics = client.get("/api/v1/model/metrics")
    assert res_metrics.status_code == 200
    data = res_metrics.json()
    assert "model_metrics" in data
    assert "baseline_persistence_metrics" in data
    assert data["forecast_horizon_minutes"] == 120

    res_fi = client.get("/api/v1/model/feature-importance")
    assert res_fi.status_code == 200
    fi = res_fi.json()
    assert isinstance(fi, list)
    assert len(fi) > 0
    assert "feature" in fi[0]
    assert "importance" in fi[0]
