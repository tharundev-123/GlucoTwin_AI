"""
Unit tests for synthetic patient time-series generator.
"""

import pandas as pd
import numpy as np
from ml.train import make_synthetic_data, SAMPLING_FREQ_MIN


def test_make_synthetic_data_shape_and_columns():
    df = make_synthetic_data(n_samples=200, seed=42)
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 200

    expected_cols = ["timestamp", "glucose", "heart_rate", "activity", "meal_carbs_g", "sleep_hours", "is_sleeping"]
    for col in expected_cols:
        assert col in df.columns, f"Missing required column: {col}"


def test_synthetic_data_ranges():
    df = make_synthetic_data(n_samples=500, seed=123)
    # Check glucose physiological bounds
    assert (df["glucose"] >= 50.0).all()
    assert (df["glucose"] <= 300.0).all()

    # Check activity bounds (0 to 1)
    assert (df["activity"] >= 0.0).all()
    assert (df["activity"] <= 1.0).all()

    # Check heart rate bounds
    assert (df["heart_rate"] >= 40.0).all()
    assert (df["heart_rate"] <= 180.0).all()

    # Check meal carbs bounds
    assert (df["meal_carbs_g"] >= 0.0).all()
    assert (df["meal_carbs_g"] <= 120.0).all()

    # Check no NaN values
    assert df.isna().sum().sum() == 0


def test_synthetic_data_reproducibility():
    df1 = make_synthetic_data(n_samples=100, seed=999)
    df2 = make_synthetic_data(n_samples=100, seed=999)
    pd.testing.assert_frame_equal(df1, df2)
