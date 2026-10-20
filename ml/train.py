"""
GlucoTwin AI - ML Pipeline for Time-Series Glucose Trend Forecasting
Target Horizon: 120 minutes (2 hours) ahead.
Frequency: 5-minute intervals (24 steps ahead).

Notice: Educational & research prototype using synthetic demonstration data.
Not for clinical diagnosis, insulin titration, or medical treatment.
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "ml" / "model.joblib"
METRICS_PATH = ROOT / "ml" / "metrics.json"
DATA_PATH = ROOT / "data" / "synthetic_demo_patient.csv"

HORIZON_STEPS = 24  # 24 * 5 minutes = 120 minutes (2 hours)
SAMPLING_FREQ_MIN = 5


def make_synthetic_data(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic time-series physiological data for a demonstration digital twin patient.
    Models circadian rhythms, meal carbohydrate absorption profiles, physical exertion,
    sleep cycles, and heart rate dynamics.

    Strictly marked as synthetic demonstration data; not real patient data.
    """
    rng = np.random.default_rng(seed)
    timestamps = pd.date_range("2026-01-01 00:00:00", periods=n_samples, freq=f"{SAMPLING_FREQ_MIN}min")

    # Time of day in hours (0.0 - 24.0)
    hour_float = (timestamps.hour + timestamps.minute / 60.0).to_numpy()

    # Sleep schedule: roughly 23:00 to 07:00
    is_sleeping = ((hour_float >= 23.0) | (hour_float < 7.0)).astype(float)
    sleep_hours = np.clip(7.5 + rng.normal(0, 0.6, n_samples) - 1.5 * (hour_float >= 7.0), 3.0, 10.0)

    # Meal scheduling: Breakfast (08:00), Lunch (12:30), Dinner (19:00), Snack (16:00)
    meal = np.zeros(n_samples)
    breakfast = (hour_float >= 7.75) & (hour_float <= 8.5)
    lunch = (hour_float >= 12.25) & (hour_float <= 13.0)
    dinner = (hour_float >= 18.75) & (hour_float <= 19.5)
    snack = (hour_float >= 15.75) & (hour_float <= 16.25)

    meal[breakfast] = 45.0 + rng.normal(0, 5, np.sum(breakfast))
    meal[lunch] = 65.0 + rng.normal(0, 8, np.sum(lunch))
    meal[dinner] = 55.0 + rng.normal(0, 7, np.sum(dinner))
    meal[snack] = 20.0 + rng.normal(0, 4, np.sum(snack))
    meal_carbs_g = np.clip(meal, 0.0, 120.0)

    # Activity level: high during morning/evening workouts, low while sitting/sleeping
    workout_window = ((hour_float >= 6.5) & (hour_float <= 7.25)) | ((hour_float >= 17.5) & (hour_float <= 18.25))
    base_activity = np.where(is_sleeping > 0.5, 0.05, 0.25)
    activity = base_activity + np.where(workout_window, 0.55 + rng.normal(0, 0.1, n_samples), rng.normal(0, 0.05, n_samples))
    activity = np.clip(activity, 0.0, 1.0)

    # Heart rate correlated with exertion, circadian baseline, and noise
    resting_hr = 64.0 + 4.0 * np.sin(2 * np.pi * (hour_float - 14) / 24.0)
    heart_rate = resting_hr + 45.0 * activity - 8.0 * is_sleeping + rng.normal(0, 3.0, n_samples)
    heart_rate = np.clip(heart_rate, 48.0, 165.0)

    # Glucose simulation with physiological homeostatic drift, meal absorption delay, and exercise uptake
    glucose = np.zeros(n_samples)
    glucose[0] = 105.0

    # Carbohydrate absorption memory buffer to simulate gastric emptying & digestion
    carb_absorption = np.convolve(meal_carbs_g, np.exp(-np.linspace(0, 3, 18)), mode='same') * 0.06

    for t in range(1, n_samples):
        prev = glucose[t - 1]
        # Homeostatic tendency back to ~100 mg/dL
        homeostasis = 0.028 * (102.0 - prev)
        # Carbohydrate intake pushes glucose upward
        carb_impact = carb_absorption[t]
        # Physical activity enhances insulin sensitivity and glucose uptake
        activity_impact = -1.9 * activity[t]
        # Random physiological fluctuations
        noise = rng.normal(0, 1.7)

        glucose[t] = np.clip(prev + homeostasis + carb_impact + activity_impact + noise, 60.0, 260.0)

    df = pd.DataFrame({
        "timestamp": timestamps,
        "glucose": np.round(glucose, 2),
        "heart_rate": np.round(heart_rate, 1),
        "activity": np.round(activity, 3),
        "meal_carbs_g": np.round(meal_carbs_g, 1),
        "sleep_hours": np.round(sleep_hours, 1),
        "is_sleeping": is_sleeping.astype(int)
    })

    return df


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Construct time-series lag, rolling window, temporal, and contextual features.
    Strictly avoids future data leakage by computing all features from t <= current time.
    """
    df = df.copy().sort_values("timestamp").reset_index(drop=True)

    # Prediction target: Glucose 120 minutes (24 periods of 5 min) in the future
    df["target"] = df["glucose"].shift(-HORIZON_STEPS)

    # Persistence baseline feature: the current glucose value
    df["baseline_persistence"] = df["glucose"]

    # Lag features (past observed glucose)
    df["glucose_lag_1"] = df["glucose"].shift(1)    # 5 min ago
    df["glucose_lag_2"] = df["glucose"].shift(2)    # 10 min ago
    df["glucose_lag_3"] = df["glucose"].shift(3)    # 15 min ago
    df["glucose_lag_6"] = df["glucose"].shift(6)    # 30 min ago
    df["glucose_lag_12"] = df["glucose"].shift(12)  # 60 min ago
    df["glucose_lag_24"] = df["glucose"].shift(24)  # 120 min ago

    # Rate of change (derivative estimates)
    df["glucose_roc_15m"] = (df["glucose"] - df["glucose_lag_3"]) / 15.0
    df["glucose_roc_30m"] = (df["glucose"] - df["glucose_lag_6"]) / 30.0

    # Rolling window statistics (strictly backward-looking)
    df["glucose_roll_mean_6"] = df["glucose"].rolling(6).mean()
    df["glucose_roll_std_6"] = df["glucose"].rolling(6).std().fillna(0)
    df["glucose_roll_mean_12"] = df["glucose"].rolling(12).mean()
    df["glucose_roll_mean_24"] = df["glucose"].rolling(24).mean()

    # Contextual rolling aggregations
    df["meal_carbs_sum_12"] = df["meal_carbs_g"].rolling(12).sum()
    df["activity_mean_6"] = df["activity"].rolling(6).mean()
    df["hr_mean_6"] = df["heart_rate"].rolling(6).mean()

    # Temporal features (cyclical hour representations)
    hours = df["timestamp"].dt.hour + df["timestamp"].dt.minute / 60.0
    df["hour_of_day"] = df["timestamp"].dt.hour
    df["sin_hour"] = np.sin(2 * np.pi * hours / 24.0)
    df["cos_hour"] = np.cos(2 * np.pi * hours / 24.0)

    # Drop edge rows containing NaNs from lagging/shifting
    cleaned_df = df.dropna().reset_index(drop=True)
    return cleaned_df


FEATURE_COLUMNS = [
    "glucose",
    "glucose_lag_1",
    "glucose_lag_2",
    "glucose_lag_3",
    "glucose_lag_6",
    "glucose_lag_12",
    "glucose_lag_24",
    "glucose_roc_15m",
    "glucose_roc_30m",
    "glucose_roll_mean_6",
    "glucose_roll_std_6",
    "glucose_roll_mean_12",
    "glucose_roll_mean_24",
    "activity",
    "activity_mean_6",
    "meal_carbs_g",
    "meal_carbs_sum_12",
    "sleep_hours",
    "heart_rate",
    "hr_mean_6",
    "hour_of_day",
    "sin_hour",
    "cos_hour"
]


def train():
    """
    Execute deterministic reproducible chronological training and honest evaluation.
    Compares Random Forest model with a standard persistence baseline.
    """
    raw_df = make_synthetic_data(n_samples=5500, seed=42)

    # Save synthetic dataset for documentation & transparent inspection
    raw_df.to_csv(DATA_PATH, index=False)

    featured_df = build_features(raw_df)

    # Chronological Split: 80% Train, 20% Holdout Test (strictly sequential, no leakage)
    split_idx = int(len(featured_df) * 0.8)
    train_df = featured_df.iloc[:split_idx]
    test_df = featured_df.iloc[split_idx:]

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["target"]
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["target"]

    # 1. Persistence Baseline: predict target as current glucose y_{t+24} = y_t
    persistence_pred = test_df["baseline_persistence"].to_numpy()
    baseline_mae = float(mean_absolute_error(y_test, persistence_pred))
    baseline_rmse = float(np.sqrt(mean_squared_error(y_test, persistence_pred)))
    baseline_mape = float(mean_absolute_percentage_error(y_test, persistence_pred))

    # 2. Random Forest Regressor Model
    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=14,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    model_pred = model.predict(X_test)
    model_mae = float(mean_absolute_error(y_test, model_pred))
    model_rmse = float(np.sqrt(mean_squared_error(y_test, model_pred)))
    model_mape = float(mean_absolute_percentage_error(y_test, model_pred))

    # Calculate feature importances
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    feature_importance_list = [
        {
            "feature": FEATURE_COLUMNS[idx],
            "importance": round(float(importances[idx]), 4),
            "percentage": round(float(importances[idx]) * 100, 2)
        }
        for idx in sorted_idx
    ]

    mae_improvement_pct = round(((baseline_mae - model_mae) / baseline_mae) * 100, 2)
    rmse_improvement_pct = round(((baseline_rmse - model_rmse) / baseline_rmse) * 100, 2)

    metrics = {
        "dataset_name": "Synthetic Demo Patient Time-Series",
        "data_provenance": "Deterministically generated synthetic physiological simulator",
        "sampling_rate_minutes": SAMPLING_FREQ_MIN,
        "forecast_horizon_minutes": HORIZON_STEPS * SAMPLING_FREQ_MIN,
        "forecast_horizon_steps": HORIZON_STEPS,
        "train_samples": int(len(train_df)),
        "test_samples": int(len(test_df)),
        "total_valid_samples": int(len(featured_df)),
        "split_strategy": "Chronological sequential split (80% train, 20% test)",
        "model_architecture": "RandomForestRegressor (150 estimators, max_depth=14)",
        "model_metrics": {
            "mae": round(model_mae, 3),
            "rmse": round(model_rmse, 3),
            "mape": round(model_mape * 100, 2)
        },
        "baseline_persistence_metrics": {
            "mae": round(baseline_mae, 3),
            "rmse": round(baseline_rmse, 3),
            "mape": round(baseline_mape * 100, 2)
        },
        "comparison": {
            "mae_reduction_percentage": mae_improvement_pct,
            "rmse_reduction_percentage": rmse_improvement_pct,
            "superior_to_baseline": bool(model_mae < baseline_mae)
        },
        "feature_importances": feature_importance_list,
        "disclaimer": "Metrics evaluated on synthetic test sequences. Never constitutes clinical validation or medical efficacy."
    }

    # Save model artifact
    bundle = {
        "model": model,
        "features": FEATURE_COLUMNS,
        "horizon_minutes": HORIZON_STEPS * SAMPLING_FREQ_MIN,
        "horizon_steps": HORIZON_STEPS
    }
    joblib.dump(bundle, MODEL_PATH)

    # Save metrics JSON
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(f"Successfully trained GlucoTwin AI 2-Hour Forecast Model!")
    print(f"Test MAE: {model_mae:.3f} mg/dL (vs Persistence: {baseline_mae:.3f} mg/dL, {mae_improvement_pct:+}% improvement)")
    print(f"Test RMSE: {model_rmse:.3f} mg/dL (vs Persistence: {baseline_rmse:.3f} mg/dL, {rmse_improvement_pct:+}% improvement)")

    return metrics


def predict_with_uncertainty(model, X: pd.DataFrame):
    """
    Compute ensemble point prediction and defensible uncertainty interval
    using inter-tree prediction standard error from the RandomForest ensemble.
    Returns: (point_prediction, std_err, lower_95_bound, upper_95_bound)
    """
    X_mat = X.values if hasattr(X, "values") else X
    # Extract predictions from each individual decision tree estimator
    tree_preds = np.array([tree.predict(X_mat) for tree in model.estimators_])
    mean_pred = np.mean(tree_preds, axis=0)
    std_err = np.std(tree_preds, axis=0)
    lower_95 = np.clip(mean_pred - 1.96 * std_err, 40.0, 350.0)
    upper_95 = np.clip(mean_pred + 1.96 * std_err, 40.0, 350.0)
    return mean_pred, std_err, lower_95, upper_95


if __name__ == "__main__":
    train()
