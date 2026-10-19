# GlucoTwin AI — A Time-Series Digital Twin Proof of Concept

> **Purpose:** A research/education prototype that combines synthetic patient history with simulated sensor time-series to forecast glucose values and visualise a changing virtual patient state. It is **not a medical device**, does not diagnose diabetes, and must not be used to make treatment decisions.

## Team details
- Team name: **[ADD TEAM NAME]**
- Team members and roles: **[ADD NAMES, EMAILS/ROLES]**

## College / Incubator information
- Institution: **[ADD COLLEGE / INCUBATOR NAME]**
- Department / programme: **[ADD DEPARTMENT]**
- Faculty mentor: **[ADD NAME OR “Not applicable”]**

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

## Demo video (mandatory)
**Unlisted YouTube demo (15–20 minutes):** [ADD UNLISTED YOUTUBE URL HERE]
The recording should show: problem and use case; architecture; data generation and limitations; model training; chronological evaluation metrics; API startup; `/docs` demo; twin state; forecast; repository tour; safety limitations; future work.

## Architecture diagram
- PDF: [`docs/architecture.pdf`](docs/architecture.pdf)
- Source description: [`docs/architecture.md`](docs/architecture.md)

## Presentation
- PDF: [`docs/presentation.pdf`](docs/presentation.pdf)
- Editable PowerPoint: [`docs/presentation.pptx`](docs/presentation.pptx)

## Open-source licence
This project is released under the **MIT License**. See [`LICENSE`](LICENSE).

## Public accessibility checklist (complete before submission)
- [ ] Replace all `[ADD ...]` placeholders.
- [ ] Push this repository to GitHub and set visibility to **Public**.
- [ ] Add the public GitHub URL to the Unstop form.
- [ ] Upload a 15–20 minute demo as **Unlisted** on YouTube and replace the placeholder above.
- [ ] Confirm architecture PDF and presentation PDF open without login.
- [ ] Ensure all code/data/docs are accessible without extra permissions.
- [ ] Run the project from a fresh clone and record the actual metrics.
- [ ] Do not tick a form checkbox unless the item is actually present and publicly accessible.

## Responsible-use limitations
- All bundled data is synthetic and intended only for software demonstration.
- This model has not been trained or validated on clinical data.
- No output is a diagnosis, treatment recommendation, or emergency assessment.
- Do not enter identifiable patient information.
