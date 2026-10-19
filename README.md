# GlucoTwin AI — A Time-Series Digital Twin Proof of Concept

> **Purpose:** A research/education prototype that combines synthetic patient history with simulated sensor time-series to forecast glucose values and visualise a changing virtual patient state. It is **not a medical device**, does not diagnose diabetes, and must not be used to make treatment decisions.

## Team details
- Team name: **GlucoTwin AI**
- Team members and roles: **Tharun Dev (AI/ML Engineering & Full-Stack System Design)**

## College / Incubator information
- Institution: **Independent Research / Competition Track**
- Department / programme: **Artificial Intelligence & Biomedical Informatics**
- Faculty mentor: **Not applicable**

## Project title
**GlucoTwin AI: A Time-Series Digital Twin for Glucose Trend Forecasting**

## Problem statement
Healthcare data is often reviewed as isolated measurements. This proof of concept demonstrates how a virtual patient model can combine historical context with incoming time-series readings, update its state, and forecast a future glucose value. The prototype uses synthetic data so the complete pipeline can be demonstrated without exposing real patient information.

## Healthcare use case
A simulated patient has historical glucose readings and contextual features such as meal-carbohydrate estimate, activity, sleep, and heart rate. New sensor-like readings arrive over time. The system updates the virtual patient's latest state, predicts glucose 30 minutes ahead, plots observed and predicted values, and flags values outside configurable demonstration thresholds. Threshold alerts are illustrative only and are not clinical advice.

## What is included
- Reproducible synthetic time-series dataset generator.
- Baseline machine-learning model using lagged glucose, activity, meal estimate, sleep and heart-rate features.
- Time-ordered train/test split to reduce leakage.
- MAE and RMSE evaluation.
- FastAPI endpoints for health check, patient twin state, and forecast.
- Minimal demo UI/API instructions.
- Interactive Digital Twin Web Dashboard (responsive SVG CGM chart, live simulation studio, and explainability metrics).
- Architecture diagram and presentation.
- Open-source MIT licence.

## Technical stack
- Python 3.10+
- FastAPI + Uvicorn
- pandas + NumPy
- scikit-learn (Random Forest regression baseline)
- HTML5, Vanilla CSS3 (modern glassmorphism design system), and JavaScript (ES6+) for zero-dependency frontend dashboard.

## AI/ML model or framework details
The baseline model is a `RandomForestRegressor` (120 estimators, max depth 12). Synthetic readings are generated with a deterministic seed and include time, glucose, activity, estimated meal carbohydrates, sleep and heart rate. Lag features (5-min, 15-min) and rolling averages (30-min) are created from past glucose values. Rows are split chronologically (80% train, 20% test); no random shuffle is used. Evaluated performance:
- **MAE**: 6.329 mg/dL
- **RMSE**: 7.814 mg/dL
- **Chronological Test Set**: 698 samples

Synthetic-data performance does **not** establish real-world or clinical validity.

## Run locally
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python ml/train.py
uvicorn backend.main:app --reload
```
- Open `http://127.0.0.1:8000/` for the interactive **GlucoTwin AI Web Dashboard**.
- Open `http://127.0.0.1:8000/docs` for the interactive **FastAPI Swagger API Documentation**.

### API endpoints
- `GET /` — interactive GlucoTwin AI Digital Twin Web Application
- `GET /health` — service status
- `GET /twin/demo-patient` — latest simulated twin state
- `GET /forecast/demo-patient?horizon_minutes=30` — next-step forecast and illustrative status
- `GET /twin/demo-patient/history?limit=48` — historical time-series sensor points with past predictions
- `POST /twin/demo-patient/simulate` — advance the twin state with meal carbs & exertion inputs
- `POST /twin/demo-patient/reset` — reset digital twin simulation to baseline
- `GET /ml/metrics` — verified MAE, RMSE, sample count, and feature importance distribution
- `POST /forecast/custom` — arbitrary what-if prediction sandbox

## Demo video
**Unlisted YouTube walkthrough:** Documented in [`demo/video-link.md`](demo/video-link.md).
The recording covers: problem and use case; architecture; data generation; model training; chronological evaluation metrics; API startup; `/docs` demo; twin state; forecast; repository tour; safety limitations; future clinical work.

## Architecture diagram
- PDF: [`docs/architecture.pdf`](docs/architecture.pdf)
- Source description: [`docs/architecture.md`](docs/architecture.md)

## Presentation
- PDF: [`docs/presentation.pdf`](docs/presentation.pdf)
- Editable PowerPoint: [`docs/presentation.pptx`](docs/presentation.pptx)

## Open-source licence
This project is released under the **MIT License**. See [`LICENSE`](LICENSE).

## Public accessibility checklist (verified)
- [x] All submission placeholders replaced with verified project details.
- [x] Public GitHub repository configured: [https://github.com/tharundev-123/GlucoTwin_AI](https://github.com/tharundev-123/GlucoTwin_AI).
- [x] Unstop submission details and repository link prepared.
- [x] Demo walkthrough agenda and video guide documented in [`demo/video-link.md`](demo/video-link.md).
- [x] Confirmed architecture PDF and presentation PDF/PPTX open without login.
- [x] Verified full codebase, synthetic data generator, and web frontend are accessible.
- [x] Verified benchmark evaluation from clean execution (MAE: 6.329 mg/dL, RMSE: 7.814 mg/dL).

## Responsible-use limitations
- All bundled data is synthetic and intended only for software demonstration.
- This model has not been trained or validated on clinical data.
- No output is a diagnosis, treatment recommendation, or emergency assessment.
- Do not enter identifiable patient information.
