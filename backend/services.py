"""
Core digital twin management service for GlucoTwin AI.
Maintains stateful in-memory virtual patient simulation buffer, runs model inference
for 120-minute forecasts, quantifies prediction uncertainty, and powers simulation controls.
"""

from pathlib import Path
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from fastapi import HTTPException
import joblib

ROOT = Path(__file__).resolve().parents[1]
from ml.train import (
    make_synthetic_data,
    build_features,
    train,
    FEATURE_COLUMNS,
    HORIZON_STEPS,
    SAMPLING_FREQ_MIN,
    predict_with_uncertainty,
    MODEL_PATH,
    METRICS_PATH
)


class DigitalTwinService:
    """Singleton service managing virtual twin state, telemetry streaming, and ML inference."""

    def __init__(self):
        self.is_running = False
        self.tick_speed_seconds = 2.0
        self.reset()

    def reset(self):
        """Reset digital twin state back to deterministic seed sequence."""
        self.is_running = False
        self.raw_df = make_synthetic_data(n_samples=288, seed=42)  # 24 hours of 5-min readings
        self.bundle = self._load_model_bundle()
        # Ensure initial features are up to date
        self._ensure_features()

    def _load_model_bundle(self):
        if not MODEL_PATH.exists() or not METRICS_PATH.exists():
            train()
        return joblib.load(MODEL_PATH)

    def _ensure_features(self):
        self.featured_df = build_features(self.raw_df)

    def get_current_reading(self) -> pd.Series:
        return self.raw_df.iloc[-1]

    def get_state(self) -> Dict[str, Any]:
        """Return the current virtual digital twin snapshot."""
        row = self.get_current_reading()
        prev_row = self.raw_df.iloc[-2] if len(self.raw_df) >= 2 else row
        roc = round((float(row["glucose"]) - float(prev_row["glucose"])) / 5.0, 2)

        cur_gluc = round(float(row["glucose"]), 1)
        if cur_gluc < 70.0:
            status = "low_caution"
        elif cur_gluc > 180.0:
            status = "elevated_caution"
        else:
            status = "in_target"

        return {
            "patient_id": "demo-patient",
            "virtual_twin_status": "simulated",
            "timestamp": row["timestamp"].isoformat(),
            "current_glucose_mg_dl": cur_gluc,
            "rate_of_change_mg_dl_min": roc,
            "glucose_status_label": status,
            "heart_rate_bpm": round(float(row["heart_rate"]), 1),
            "activity_level_0_1": round(float(row["activity"]), 3),
            "estimated_meal_carbs_g": round(float(row["meal_carbs_g"]), 1),
            "sleep_hours": round(float(row["sleep_hours"]), 1),
            "simulation_running": self.is_running,
            "notice": "Synthetic demo patient telemetry. Strictly for research and education."
        }

    def get_history(self, limit: int = 48) -> List[Dict[str, Any]]:
        """Retrieve recent observed time-series readings."""
        sub_df = self.raw_df.tail(limit).copy().reset_index(drop=True)
        records = []
        for _, r in sub_df.iterrows():
            records.append({
                "timestamp": r["timestamp"].isoformat(),
                "time_str": r["timestamp"].strftime("%H:%M"),
                "glucose": round(float(r["glucose"]), 1),
                "heart_rate": round(float(r["heart_rate"]), 1),
                "activity": round(float(r["activity"]), 3),
                "meal_carbs_g": round(float(r["meal_carbs_g"]), 1),
                "sleep_hours": round(float(r["sleep_hours"]), 1),
                "is_forecast": False
            })
        return records

    def _extract_feature_row(self) -> pd.DataFrame:
        """Derive the precise feature vector for the latest observation without leakage."""
        df = self.raw_df.copy().reset_index(drop=True)
        cur_idx = len(df) - 1
        cur_row = df.iloc[cur_idx]

        cur_glucose = float(cur_row["glucose"])

        # Lags
        def get_lag(k):
            return float(df.iloc[cur_idx - k]["glucose"]) if cur_idx >= k else cur_glucose

        lag_1 = get_lag(1)
        lag_2 = get_lag(2)
        lag_3 = get_lag(3)
        lag_6 = get_lag(6)
        lag_12 = get_lag(12)
        lag_24 = get_lag(24)

        roc_15 = (cur_glucose - lag_3) / 15.0
        roc_30 = (cur_glucose - lag_6) / 30.0

        roll_mean_6 = float(df["glucose"].tail(6).mean())
        roll_std_6 = float(df["glucose"].tail(6).std()) if len(df) >= 6 else 0.0
        roll_mean_12 = float(df["glucose"].tail(12).mean())
        roll_mean_24 = float(df["glucose"].tail(24).mean())

        meal_carbs_sum_12 = float(df["meal_carbs_g"].tail(12).sum())
        activity_mean_6 = float(df["activity"].tail(6).mean())
        hr_mean_6 = float(df["heart_rate"].tail(6).mean())

        cur_time = cur_row["timestamp"]
        hour_float = cur_time.hour + cur_time.minute / 60.0
        sin_hour = np.sin(2 * np.pi * hour_float / 24.0)
        cos_hour = np.cos(2 * np.pi * hour_float / 24.0)

        data = {
            "glucose": [cur_glucose],
            "glucose_lag_1": [lag_1],
            "glucose_lag_2": [lag_2],
            "glucose_lag_3": [lag_3],
            "glucose_lag_6": [lag_6],
            "glucose_lag_12": [lag_12],
            "glucose_lag_24": [lag_24],
            "glucose_roc_15m": [roc_15],
            "glucose_roc_30m": [roc_30],
            "glucose_roll_mean_6": [roll_mean_6],
            "glucose_roll_std_6": [roll_std_6 if not np.isnan(roll_std_6) else 0.0],
            "glucose_roll_mean_12": [roll_mean_12],
            "glucose_roll_mean_24": [roll_mean_24],
            "activity": [float(cur_row["activity"])],
            "activity_mean_6": [activity_mean_6],
            "meal_carbs_g": [float(cur_row["meal_carbs_g"])],
            "meal_carbs_sum_12": [meal_carbs_sum_12],
            "sleep_hours": [float(cur_row["sleep_hours"])],
            "heart_rate": [float(cur_row["heart_rate"])],
            "hr_mean_6": [hr_mean_6],
            "hour_of_day": [cur_time.hour],
            "sin_hour": [sin_hour],
            "cos_hour": [cos_hour]
        }
        return pd.DataFrame(data)[self.bundle["features"]]

    def get_forecast(self, horizon_minutes: int = 120) -> Dict[str, Any]:
        """Compute the 2-hour ahead forecast with defensible tree ensemble uncertainty."""
        if horizon_minutes != 120:
            raise HTTPException(
                status_code=400,
                detail=f"Trained model operates on a verified 120-minute (2-hour) horizon. Received: {horizon_minutes} minutes."
            )

        model = self.bundle["model"]
        X = self._extract_feature_row()
        mean_pred, std_err, lower_95, upper_95 = predict_with_uncertainty(model, X)

        point_pred = round(float(mean_pred[0]), 1)
        err = round(float(std_err[0]), 2)
        ci_lower = round(float(lower_95[0]), 1)
        ci_upper = round(float(upper_95[0]), 1)

        cur_row = self.get_current_reading()
        cur_glucose = round(float(cur_row["glucose"]), 1)
        cur_time = cur_row["timestamp"]
        target_time = cur_time + pd.Timedelta(minutes=horizon_minutes)

        delta = round(point_pred - cur_glucose, 1)

        # Generate smooth projected intermediate trajectory from t to t+120m
        trajectory = []
        n_interp = 8  # 8 points = every 15 minutes up to 120m
        for step in range(1, n_interp + 1):
            fraction = step / n_interp
            step_time = cur_time + pd.Timedelta(minutes=step * 15)
            # Smooth quadratic or linear progression towards final target
            interp_glucose = round(cur_glucose + delta * (fraction ** 0.85), 1)
            interp_err = round(err * fraction, 2)
            trajectory.append({
                "timestamp": step_time.isoformat(),
                "time_str": step_time.strftime("%H:%M"),
                "minutes_ahead": step * 15,
                "projected_glucose": interp_glucose,
                "lower_bound": round(interp_glucose - 1.96 * interp_err, 1),
                "upper_bound": round(interp_glucose + 1.96 * interp_err, 1),
                "is_forecast": True
            })

        return {
            "patient_id": "demo-patient",
            "forecast_horizon_minutes": horizon_minutes,
            "forecast_timestamp": target_time.isoformat(),
            "predicted_glucose_mg_dl": point_pred,
            "delta_from_current_mg_dl": delta,
            "uncertainty_std_err_mg_dl": err,
            "confidence_interval_95": {
                "lower_mg_dl": ci_lower,
                "upper_mg_dl": ci_upper
            },
            "illustrative_target_range": {"min": 70.0, "max": 180.0},
            "projected_trajectory": trajectory,
            "model": "RandomForestRegressor (150 trees, chronological split)",
            "notice": "Forecast is generated from synthetic time-series data. Not for diagnosis, insulin dosage, or medical decisions."
        }

    def step(self, meal_carbs_g: float = 0.0, activity_level: float = 0.35, sleep_hours: float = 7.0, steps: int = 1) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Advance the simulated virtual twin by `steps` 5-minute ticks."""
        rng = np.random.default_rng()
        remaining_carbs = float(meal_carbs_g)

        for _ in range(max(1, steps)):
            last_row = self.raw_df.iloc[-1]
            last_time = last_row["timestamp"]
            new_time = last_time + pd.Timedelta(minutes=SAMPLING_FREQ_MIN)
            last_glucose = float(last_row["glucose"])

            # Physiological continuous drift simulation
            homeostasis = 0.028 * (102.0 - last_glucose)
            carb_push = remaining_carbs * 0.05
            activity_pull = -1.9 * float(activity_level)
            noise = float(rng.normal(0, 1.6))

            new_glucose = float(np.clip(last_glucose + homeostasis + carb_push + activity_pull + noise, 60.0, 260.0))

            # Residual carb curve decay
            remaining_carbs = max(0.0, remaining_carbs * 0.72)

            hr_noise = float(rng.normal(0, 2.5))
            new_hr = float(np.clip(64.0 + 45.0 * float(activity_level) + hr_noise, 48.0, 165.0))

            new_record = {
                "timestamp": new_time,
                "glucose": round(new_glucose, 2),
                "heart_rate": round(new_hr, 1),
                "activity": round(float(np.clip(activity_level, 0.0, 1.0)), 3),
                "meal_carbs_g": round(remaining_carbs, 1),
                "sleep_hours": round(float(np.clip(sleep_hours, 3.0, 12.0)), 1),
                "is_sleeping": 1 if (new_time.hour >= 23 or new_time.hour < 7) else 0
            }
            self.raw_df = pd.concat([self.raw_df, pd.DataFrame([new_record])], ignore_index=True)

        return self.get_state(), self.get_forecast(horizon_minutes=120)

    def start_simulation(self) -> Dict[str, Any]:
        self.is_running = True
        return {"status": "started", "simulation_running": True, "message": "Simulation ticker active"}

    def pause_simulation(self) -> Dict[str, Any]:
        self.is_running = False
        return {"status": "paused", "simulation_running": False, "message": "Simulation ticker paused"}

    def simulate_what_if(self, scenario_name: str, hypothetical_carbs_g: float, hypothetical_activity: float, duration_minutes: int = 120) -> Dict[str, Any]:
        """
        Evaluate a what-if perturbation scenario against the current virtual twin state.
        Transparently labels outputs as hypothetical without clinical validity.
        """
        base_forecast = self.get_forecast(horizon_minutes=120)
        base_pred = base_forecast["predicted_glucose_mg_dl"]

        # Approximate physiological response to hypothetical perturbations
        # Carbs increase glucose (~0.4 - 0.7 mg/dL per gram of carbohydrate unmitigated)
        # Exercise decreases glucose (~15 - 35 mg/dL per sustained high activity)
        carb_effect = hypothetical_carbs_g * 0.48
        activity_effect = -32.0 * (hypothetical_activity - 0.25)
        hypothetical_glucose = float(np.clip(base_pred + carb_effect + activity_effect, 55.0, 320.0))
        net_impact = round(hypothetical_glucose - base_pred, 1)

        explanation = (
            f"Scenario '{scenario_name}' simulated with {hypothetical_carbs_g}g carbs and {hypothetical_activity * 100:.0f}% activity index. "
            f"Carbohydrate absorption contributes approximately +{carb_effect:.1f} mg/dL, while physical exertion "
            f"increases muscular glucose uptake by {activity_effect:.1f} mg/dL, resulting in a net projected shift of {net_impact:+.1f} mg/dL."
        )

        return {
            "scenario_name": scenario_name,
            "baseline_2h_glucose_mg_dl": base_pred,
            "scenario_2h_glucose_mg_dl": round(hypothetical_glucose, 1),
            "net_impact_mg_dl": net_impact,
            "explanation": explanation,
            "limitation_notice": (
                "Hypothetical educational simulation only. Does NOT establish causal or clinically reliable outcomes. "
                "Never use for insulin planning or therapeutic interventions."
            )
        }

    def get_metrics(self) -> Dict[str, Any]:
        if not METRICS_PATH.exists():
            train()
        return json.loads(METRICS_PATH.read_text(encoding="utf-8"))

    def get_feature_importance(self) -> List[Dict[str, Any]]:
        metrics = self.get_metrics()
        return metrics.get("feature_importances", [])


# Global Singleton
twin_service = DigitalTwinService()
