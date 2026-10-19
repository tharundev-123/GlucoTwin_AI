import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "ml" / "model.joblib"
METRICS_PATH = ROOT / "ml" / "metrics.json"

def make_synthetic_data(n=3500, seed=42):
    """Create synthetic readings for software demonstration, not clinical use."""
    rng = np.random.default_rng(seed)
    timestamps = pd.date_range("2026-01-01", periods=n, freq="5min")
    hour = np.arange(n) * 5 / 60
    meal = np.where((hour % 24 > 7.5) & (hour % 24 < 8.5), 35, 0)
    meal += np.where((hour % 24 > 12) & (hour % 24 < 13), 55, 0)
    meal += np.where((hour % 24 > 18) & (hour % 24 < 19), 45, 0)
    meal = meal + rng.normal(0, 3, n)
    activity = np.clip(rng.normal(0.35, 0.2, n), 0, 1)
    sleep = np.clip(rng.normal(7, 1.1, n), 3, 10)
    heart_rate = np.clip(68 + 22 * activity + rng.normal(0, 5, n), 48, 145)
    glucose = np.zeros(n)
    glucose[0] = 105
    for i in range(1, n):
        drift = 0.025 * (105 - glucose[i-1]) + 0.045 * meal[i] - 1.8 * activity[i]
        glucose[i] = np.clip(glucose[i-1] + drift + rng.normal(0, 3.0), 65, 240)
    df = pd.DataFrame({
        "timestamp": timestamps, "glucose": glucose, "activity": activity,
        "meal_carbs_g": np.clip(meal, 0, 100), "sleep_hours": sleep,
        "heart_rate": heart_rate
    })
    # Predict the value 6 samples (30 minutes) ahead.
    df["target"] = df["glucose"].shift(-6)
    df["glucose_lag_1"] = df["glucose"].shift(1)
    df["glucose_lag_3"] = df["glucose"].shift(3)
    df["glucose_roll_6"] = df["glucose"].rolling(6).mean()
    df["hour_of_day"] = df["timestamp"].dt.hour
    return df.dropna().reset_index(drop=True)

def train():
    df = make_synthetic_data()
    features = ["glucose", "glucose_lag_1", "glucose_lag_3", "glucose_roll_6",
                "activity", "meal_carbs_g", "sleep_hours", "heart_rate", "hour_of_day"]
    split = int(len(df) * 0.8)
    train_df, test_df = df.iloc[:split], df.iloc[split:]
    model = RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(train_df[features], train_df["target"])
    pred = model.predict(test_df[features])
    metrics = {
        "dataset": "synthetic demonstration data",
        "target": "glucose 30 minutes ahead",
        "test_rows": int(len(test_df)),
        "mae": round(float(mean_absolute_error(test_df["target"], pred)), 3),
        "rmse": round(float(np.sqrt(mean_squared_error(test_df["target"], pred))), 3),
        "warning": "Synthetic-data metrics do not imply clinical validity."
    }
    joblib.dump({"model": model, "features": features}, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))
    return metrics

if __name__ == "__main__":
    train()
