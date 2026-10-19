from pathlib import Path
import sys
import json
import numpy as np
import pandas as pd
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from ml.train import make_synthetic_data, train

app = FastAPI(
    title="GlucoTwin AI API",
    version="0.2.0",
    description="Educational digital-twin PoC using synthetic data. Not for medical use."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ensure_model():
    model_path = ROOT / "ml" / "model.joblib"
    if not model_path.exists():
        train()
    import joblib
    return joblib.load(model_path)


class DigitalTwinManager:
    """Manages an in-memory virtual patient digital twin state and simulation buffer."""
    def __init__(self):
        self.reset()

    def reset(self):
        self.df = make_synthetic_data()
        self.bundle = ensure_model()

    def get_current_row(self):
        return self.df.iloc[-1]

    def get_state(self):
        row = self.get_current_row()
        return {
            "patient_id": "demo-patient",
            "virtual_twin_status": "simulated",
            "timestamp": row["timestamp"].isoformat(),
            "current_glucose_mg_dl": round(float(row["glucose"]), 1),
            "heart_rate_bpm": round(float(row["heart_rate"]), 1),
            "activity_level_0_1": round(float(row["activity"]), 2),
            "estimated_meal_carbs_g": round(float(row["meal_carbs_g"]), 1),
            "sleep_hours": round(float(row["sleep_hours"]), 1),
            "notice": "Synthetic values for demonstration only; not clinical data."
        }

    def get_forecast(self, horizon_minutes: int = 30):
        if horizon_minutes != 30:
            raise HTTPException(status_code=400, detail="This prototype currently supports a 30-minute forecast only.")
        bundle = self.bundle
        row = self.get_current_row()
        x = pd.DataFrame([[row[f] for f in bundle["features"]]], columns=bundle["features"])
        prediction = float(bundle["model"].predict(x)[0])
        if prediction < 70:
            label = "below_demo_range"
        elif prediction > 180:
            label = "above_demo_range"
        else:
            label = "within_demo_range"
        return {
            "patient_id": "demo-patient",
            "forecast_horizon_minutes": 30,
            "predicted_glucose_mg_dl": round(prediction, 1),
            "illustrative_status": label,
            "model": "RandomForestRegressor baseline",
            "notice": "Prediction is based on synthetic data and is not medical advice."
        }

    def get_history(self, limit: int = 48):
        sub_df = self.df.tail(limit).copy().reset_index(drop=True)
        features = self.bundle["features"]
        model = self.bundle["model"]
        preds = model.predict(sub_df[features])
        records = []
        for i, (_, r) in enumerate(sub_df.iterrows()):
            records.append({
                "timestamp": r["timestamp"].isoformat(),
                "time_str": r["timestamp"].strftime("%H:%M"),
                "glucose": round(float(r["glucose"]), 1),
                "heart_rate": round(float(r["heart_rate"]), 1),
                "activity": round(float(r["activity"]), 2),
                "meal_carbs_g": round(float(r["meal_carbs_g"]), 1),
                "sleep_hours": round(float(r["sleep_hours"]), 1),
                "predicted_glucose_30m": round(float(preds[i]), 1)
            })
        return records

    def simulate_step(self, meal_carbs_g: float = 0.0, activity_level: float = 0.35, sleep_hours: float = 7.0, steps: int = 1):
        rng = np.random.default_rng()
        cur_carbs = float(meal_carbs_g)
        for _ in range(max(1, steps)):
            last_row = self.df.iloc[-1]
            last_time = last_row["timestamp"]
            new_time = last_time + pd.Timedelta(minutes=5)
            last_glucose = float(last_row["glucose"])

            # Physiological drift simulation matching baseline synthetic generator
            drift = 0.025 * (105.0 - last_glucose) + 0.045 * cur_carbs - 1.8 * float(activity_level)
            noise = float(rng.normal(0, 1.8))
            new_glucose = float(np.clip(last_glucose + drift + noise, 65.0, 240.0))

            hr_noise = float(rng.normal(0, 2.5))
            new_hr = float(np.clip(68.0 + 22.0 * float(activity_level) + hr_noise, 48.0, 145.0))

            # Residual carb curve attenuation after first step
            cur_carbs = max(0.0, cur_carbs * 0.7)

            new_row = {
                "timestamp": new_time,
                "glucose": new_glucose,
                "activity": float(np.clip(activity_level, 0.0, 1.0)),
                "meal_carbs_g": float(np.clip(cur_carbs, 0.0, 100.0)),
                "sleep_hours": float(np.clip(sleep_hours, 3.0, 10.0)),
                "heart_rate": new_hr,
                "target": np.nan,
                "glucose_lag_1": last_glucose,
                "glucose_lag_3": float(self.df.iloc[-3]["glucose"]) if len(self.df) >= 3 else last_glucose,
                "glucose_roll_6": float(self.df.iloc[-5:]["glucose"].mean()) if len(self.df) >= 5 else last_glucose,
                "hour_of_day": new_time.hour
            }
            self.df = pd.concat([self.df, pd.DataFrame([new_row])], ignore_index=True)

        return self.get_state(), self.get_forecast()


# Singleton Digital Twin instance
twin_manager = DigitalTwinManager()


# ---------------- API Endpoints ----------------

@app.get("/health")
def health():
    return {"status": "ok", "project": "GlucoTwin AI", "data_mode": "synthetic"}


@app.get("/twin/demo-patient")
def twin_state():
    return twin_manager.get_state()


@app.get("/forecast/demo-patient")
def forecast(horizon_minutes: int = 30):
    return twin_manager.get_forecast(horizon_minutes=horizon_minutes)


@app.get("/twin/demo-patient/history")
def twin_history(limit: int = 48):
    """Retrieve recent time-series observed data and baseline model forecast points."""
    return {
        "patient_id": "demo-patient",
        "count": min(limit, len(twin_manager.df)),
        "history": twin_manager.get_history(limit=limit)
    }


class SimulationInput(BaseModel):
    meal_carbs_g: Optional[float] = Field(0.0, ge=0.0, le=120.0, description="Meal carbohydrate intake estimate in grams")
    activity_level: Optional[float] = Field(0.35, ge=0.0, le=1.0, description="Physical activity scale from 0 (resting) to 1 (high exertion)")
    sleep_hours: Optional[float] = Field(7.0, ge=0.0, le=16.0, description="Hours of sleep recorded")
    steps: Optional[int] = Field(1, ge=1, le=12, description="Number of 5-minute ticks to advance (e.g. 6 = 30 minutes)")


@app.post("/twin/demo-patient/simulate")
def simulate_twin_event(payload: SimulationInput):
    """Advance the virtual digital twin state by simulating sensor readings and contextual events."""
    state, fc = twin_manager.simulate_step(
        meal_carbs_g=payload.meal_carbs_g,
        activity_level=payload.activity_level,
        sleep_hours=payload.sleep_hours,
        steps=payload.steps
    )
    return {
        "message": f"Twin advanced by {payload.steps * 5} minutes.",
        "state": state,
        "forecast": fc
    }


@app.post("/twin/demo-patient/reset")
def reset_twin():
    """Reset the virtual digital twin simulation back to initial synthetic sequence."""
    twin_manager.reset()
    return {"message": "Digital twin reset to baseline state.", "state": twin_manager.get_state()}


@app.get("/ml/metrics")
def get_ml_metrics():
    """Retrieve model training metrics, evaluation results, and feature importances."""
    metrics_path = ROOT / "ml" / "metrics.json"
    if not metrics_path.exists():
        train()
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    bundle = ensure_model()
    importances = bundle["model"].feature_importances_
    features_sorted = sorted(
        [{"feature": f, "importance": round(float(imp), 4), "percentage": round(float(imp) * 100, 1)}
         for f, imp in zip(bundle["features"], importances)],
        key=lambda x: x["importance"],
        reverse=True
    )
    metrics["feature_importances"] = features_sorted
    return metrics


class CustomForecastRequest(BaseModel):
    glucose: float = Field(..., description="Current glucose (mg/dL)")
    glucose_lag_1: Optional[float] = None
    glucose_lag_3: Optional[float] = None
    glucose_roll_6: Optional[float] = None
    activity: float = Field(0.35, ge=0.0, le=1.0)
    meal_carbs_g: float = Field(0.0, ge=0.0, le=120.0)
    sleep_hours: float = Field(7.0, ge=0.0, le=16.0)
    heart_rate: float = Field(72.0, ge=40.0, le=180.0)
    hour_of_day: int = Field(12, ge=0, le=23)


@app.post("/forecast/custom")
def custom_forecast(body: CustomForecastRequest):
    """Predict glucose 30-minutes ahead for user-specified arbitrary conditions."""
    bundle = ensure_model()
    lag_1 = body.glucose_lag_1 if body.glucose_lag_1 is not None else body.glucose
    lag_3 = body.glucose_lag_3 if body.glucose_lag_3 is not None else body.glucose
    roll_6 = body.glucose_roll_6 if body.glucose_roll_6 is not None else body.glucose

    features_dict = {
        "glucose": body.glucose,
        "glucose_lag_1": lag_1,
        "glucose_lag_3": lag_3,
        "glucose_roll_6": roll_6,
        "activity": body.activity,
        "meal_carbs_g": body.meal_carbs_g,
        "sleep_hours": body.sleep_hours,
        "heart_rate": body.heart_rate,
        "hour_of_day": body.hour_of_day
    }
    x = pd.DataFrame([[features_dict[f] for f in bundle["features"]]], columns=bundle["features"])
    prediction = float(bundle["model"].predict(x)[0])

    if prediction < 70:
        label = "below_demo_range"
    elif prediction > 180:
        label = "above_demo_range"
    else:
        label = "within_demo_range"

    return {
        "forecast_horizon_minutes": 30,
        "predicted_glucose_mg_dl": round(prediction, 1),
        "delta_mg_dl": round(prediction - body.glucose, 1),
        "illustrative_status": label,
        "model": "RandomForestRegressor baseline",
        "inputs": features_dict,
        "notice": "Prediction is based on synthetic data and is not medical advice."
    }


# Mount frontend static directory if present
FRONTEND_DIR = ROOT / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
