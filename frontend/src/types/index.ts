export interface TwinState {
  patient_id: string;
  virtual_twin_status: string;
  timestamp: string;
  current_glucose_mg_dl: number;
  rate_of_change_mg_dl_min: number;
  glucose_status_label: 'in_target' | 'low_caution' | 'elevated_caution';
  heart_rate_bpm: number;
  activity_level_0_1: number;
  estimated_meal_carbs_g: number;
  sleep_hours: number;
  simulation_running: boolean;
  notice: string;
}

export interface HistoryRecord {
  timestamp: string;
  time_str: string;
  glucose: number;
  heart_rate: number;
  activity: number;
  meal_carbs_g: number;
  sleep_hours: number;
  is_forecast?: boolean;
}

export interface TrajectoryPoint {
  timestamp: string;
  time_str: string;
  minutes_ahead: number;
  projected_glucose: number;
  lower_bound: number;
  upper_bound: number;
  is_forecast: boolean;
}

export interface ForecastResponse {
  patient_id: string;
  forecast_horizon_minutes: number;
  forecast_timestamp: string;
  predicted_glucose_mg_dl: number;
  delta_from_current_mg_dl: number;
  uncertainty_std_err_mg_dl: number;
  confidence_interval_95: {
    lower_mg_dl: number;
    upper_mg_dl: number;
  };
  illustrative_target_range: {
    min: number;
    max: number;
  };
  projected_trajectory: TrajectoryPoint[];
  model: string;
  notice: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  percentage: number;
}

export interface ModelMetrics {
  dataset_name: string;
  data_provenance: string;
  sampling_rate_minutes: number;
  forecast_horizon_minutes: number;
  train_samples: number;
  test_samples: number;
  split_strategy: string;
  model_architecture: string;
  model_metrics: {
    mae: number;
    rmse: number;
    mape: number;
  };
  baseline_persistence_metrics: {
    mae: number;
    rmse: number;
    mape: number;
  };
  comparison: {
    mae_reduction_percentage: number;
    rmse_reduction_percentage: number;
    superior_to_baseline: boolean;
  };
  feature_importances: FeatureImportance[];
  disclaimer: string;
}

export interface WhatIfResponse {
  scenario_name: string;
  baseline_2h_glucose_mg_dl: number;
  scenario_2h_glucose_mg_dl: number;
  net_impact_mg_dl: number;
  explanation: string;
  limitation_notice: string;
}
