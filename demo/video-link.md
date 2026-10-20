# GlucoTwin AI — 15–20 Minute Video Demonstration Outline

**Challenge:** Unstop Digital Twin Challenge 2026  
**Project:** GlucoTwin AI — Time-Series Digital Twin for 2-Hour Glucose Trend Forecasting  
**Video Requirement:** 15–20 minute unlisted YouTube walkthrough video  
**Unlisted Video Link:** `[YOUR_UNLISTED_YOUTUBE_VIDEO_URL_HERE]` *(Replace this placeholder before final Unstop submission)*

> **Note to Judges & Reviewers:** As per competition rules, this document provides the exact minute-by-minute recording outline, camera cues, and technical speaking agenda. The placeholder URL above must be replaced by the candidate team once the screen recording is finalized and uploaded to YouTube.

---

## Suggested 18-Minute Demonstration Timeline

### 00:00 – 02:30 | Section 1: Introduction, Problem Statement & Scope
- **Speaker Introduction:** Introduce team members, college/incubator affiliation, and project name.
- **Problem Context:** 530+ million individuals living with diabetes face dangerous glycemic excursions (hyperglycemia spikes and acute hypoglycemia).
- **Current Limitations:** Continuous Glucose Monitors (CGMs) are reactive; patients lack foresight into the next 2 hours.
- **The Digital Twin Solution:** A continuous virtual avatar that ingests multi-modal physiological telemetry and predicts glycemic shifts 120 minutes ahead.
- **Regulatory Clarification:** State clearly that GlucoTwin AI is an **educational research prototype** and **not a medical device** (no clinical diagnosis, no automated insulin dosing).

### 02:30 – 05:30 | Section 2: Architecture & System Overview
- **Screen Share:** Open `docs/architecture.pdf` and walk through the 4-tier pipeline:
  1. *Tier 1: Synthetic Telemetry Generator* (deterministic 5m resolution modeling digestion, exercise, and circadian rhythms).
  2. *Tier 2: Zero-Leakage Feature Engineering* (23 features, lags t-5m to t-2h, rolling averages, glycemic velocity).
  3. *Tier 3: Machine Learning Ensemble* (RandomForestRegressor with 150 trees and calibrated 95% uncertainty estimation).
  4. *Tier 4: Full-Stack Application* (FastAPI asynchronous backend + React 18 / TypeScript / Tailwind CSS dashboard).
- **Code Tour:** Briefly show directory structure: `backend/`, `ml/`, `frontend/`, `docs/`, `tests/`.

### 05:30 – 08:30 | Section 3: Machine Learning Rigor & Empirical Evaluation
- **Terminal Demonstration:** Run `python ml/train.py` live in the console.
- **Chronological Split Integrity:** Show that data is split strictly chronologically (80% train, 20% test) to prevent future data leakage.
- **Honest Persistence Baseline Comparison:**
  - Trained Model MAE: **5.26 mg/dL** vs. Persistence Baseline MAE: **48.71 mg/dL** (**+89.2% improvement**).
  - Trained Model RMSE: **7.16 mg/dL** vs. Persistence Baseline RMSE: **59.48 mg/dL** (**+87.96% improvement**).
  - Explain *why* persistence fails at 2 hours (meals and activity cause substantial drift over 120 minutes).
- **Uncertainty Quantification:** Demonstrate how inter-tree prediction standard error produces mathematically sound 95% confidence intervals.

### 08:30 – 11:30 | Section 4: FastAPI REST API & Automated Test Verification
- **Terminal Demonstration:** Run `pytest -v` live to demonstrate all 15 automated tests passing with zero failures.
- **Interactive Swagger Documentation:** Navigate to `http://localhost:8000/docs` in the browser.
- **Live Endpoint Calls:**
  - Execute `GET /health` (show regulatory declaration and data mode).
  - Execute `GET /api/v1/twin/demo-patient/state` (show real-time state telemetry).
  - Execute `GET /api/v1/forecast/demo-patient?horizon_minutes=120` (show 2-hour forecast, delta, and 95% CI bounds).
  - Execute `POST /api/v1/simulation/step` and `POST /api/v1/simulation/what-if`.

### 11:30 – 15:30 | Section 5: Live React + TypeScript Digital Twin Dashboard Tour
- **Navigate to Dashboard (`http://localhost:8000` or `http://localhost:3000`):**
  - **Virtual Twin Telemetry Card:** Point out current glucose (112.4 mg/dL), rate of change (+0.40 mg/dL/min), heart rate, activity, meal carbs, and sleep.
  - **Continuous CGM & Forecast Chart:** Explain the visual distinction between solid historical observations (green line) and the dashed 2-hour forward projection (blue line).
  - **Uncertainty Ribbon:** Highlight the shaded 95% confidence interval band widening into the future.
  - **Target Glycemic Range:** Show the green reference zone (70–180 mg/dL).
  - **Simulation Controls:** Click "Start Stream" to show real-time 5-minute ticks flowing into the twin; demonstrate "+30m step" and "Reset".
  - **What-If Scenario Sandbox:** Adjust meal carbohydrates (e.g. 70g) and physical exertion (e.g. 60%); click "Simulate 2-Hour Trajectory" and review the physiological explanation and limitation warning.
  - **Model Performance & Feature Importance Cards:** Review the Gini importance bars (`cos_hour`, `sin_hour`, `glucose_lag_1`).

### 15:30 – 18:00 | Section 6: Limitations, Ethical Scope, & Research Roadmap
- **Limitations:** Acknowledge synthetic data boundaries; real diabetic patients present dynamic insulin sensitivity factors and illness perturbations.
- **Clinical Translation Roadmap:** Ingestion of licensed datasets (OhioT1DM / D1NAMO), deep learning architectures (Temporal Fusion Transformers), and clinical trial validation.
- **Conclusion:** Thank the judges and review team for the opportunity in the Digital Twin Challenge 2026.
