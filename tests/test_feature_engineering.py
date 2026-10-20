"""
Unit tests for time-series feature engineering and leakage prevention.
"""

import pandas as pd
import numpy as np
from ml.train import make_synthetic_data, build_features, FEATURE_COLUMNS, HORIZON_STEPS


def test_build_features_no_nan():
    raw_df = make_synthetic_data(n_samples=400, seed=42)
    feat_df = build_features(raw_df)
    assert len(feat_df) > 0
    # Ensure no NaN in features or target
    assert feat_df[FEATURE_COLUMNS].isna().sum().sum() == 0
    assert feat_df["target"].isna().sum() == 0


def test_target_horizon_exact_shift():
    raw_df = make_synthetic_data(n_samples=200, seed=42)
    feat_df = build_features(raw_df)

    # In raw_df, the row that matches feat_df.loc[i] has the same timestamp
    idx_to_check = 10
    feat_time = feat_df.loc[idx_to_check, "timestamp"]
    target_val = feat_df.loc[idx_to_check, "target"]

    # Target timestamp must be exactly 120 minutes ahead
    expected_future_time = feat_time + pd.Timedelta(minutes=HORIZON_STEPS * 5)
    matched_future_row = raw_df[raw_df["timestamp"] == expected_future_time]
    assert len(matched_future_row) == 1
    assert np.isclose(target_val, matched_future_row.iloc[0]["glucose"])


def test_no_future_leakage_in_features():
    raw_df = make_synthetic_data(n_samples=200, seed=42)
    feat_df = build_features(raw_df)

    # For any row, glucose_lag_1 should match previous row's glucose
    for i in range(1, 15):
        lag1 = feat_df.loc[i, "glucose_lag_1"]
        prev_glucose = feat_df.loc[i - 1, "glucose"]
        assert np.isclose(lag1, prev_glucose)
