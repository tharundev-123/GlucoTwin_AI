"""
Unit tests for model inference, bundle loading, and uncertainty quantification.
"""

from pathlib import Path
import joblib
import pandas as pd
import numpy as np
from ml.train import predict_with_uncertainty, MODEL_PATH, FEATURE_COLUMNS, train


def test_model_artifact_exists_and_loads():
    if not MODEL_PATH.exists():
        train()
    bundle = joblib.load(MODEL_PATH)
    assert "model" in bundle
    assert "features" in bundle
    assert bundle["horizon_minutes"] == 120
    assert bundle["features"] == FEATURE_COLUMNS


def test_predict_with_uncertainty_bounds():
    bundle = joblib.load(MODEL_PATH)
    model = bundle["model"]

    # Construct mock single sample
    mock_row = {col: 100.0 for col in FEATURE_COLUMNS}
    mock_row["hour_of_day"] = 12
    mock_row["activity"] = 0.3
    mock_row["sleep_hours"] = 7.0
    mock_row["sin_hour"] = 0.0
    mock_row["cos_hour"] = -1.0
    X = pd.DataFrame([mock_row])[FEATURE_COLUMNS]

    mean_pred, std_err, lower_95, upper_95 = predict_with_uncertainty(model, X)

    assert len(mean_pred) == 1
    assert lower_95[0] <= mean_pred[0] <= upper_95[0]
    assert std_err[0] >= 0.0
    assert 50.0 <= mean_pred[0] <= 300.0
