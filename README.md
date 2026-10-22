# GlucoTwin AI — A Time-Series Digital Twin for 2-Hour Glucose Trend Forecasting

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI: 0.110+](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React: 18.3](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TypeScript: 5.6](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite: 5.4](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS: 3.4](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests: Pytest 15/15 Passed](https://img.shields.io/badge/Tests-15%2F15%20Passed-emerald.svg)](tests/)

> **Project Mission & Non-Clinical Scope:**  
> GlucoTwin AI is an academic and educational proof-of-concept developed for the **Digital Twin Challenge 2026 on Unstop**. It continuously ingests simulated multi-modal telemetry (glucose, meal carbohydrates, physical exertion, heart rate, sleep), maintains a virtual metabolic digital twin state, and predicts glucose trajectories **2 hours (120 minutes) into the future** with defensible ensemble uncertainty estimation.  
> **CRITICAL MEDICAL DISCLAIMER:** This system is an educational prototype and **not a medical device**. It is not clinically validated and must never be used for medical diagnosis, clinical management, glycemic emergencies, or insulin dose titration.

---

## 👥 Hackathon Submission Credentials

- **Project Title:** GlucoTwin AI — A Time-Series Digital Twin for 2-Hour Glucose Trend Forecasting
- **Team Name:** Team Winners
- **Team Members & Roles:**
  - **Tharun Dev M C** — *Lead AI/ML Engineer & Biomedical Modeling*
  - **Ashish Kumar Rawat** — *Full-Stack Developer & Cloud Systems Architect*
  - **Saim Quadeer** — *UI/UX Designer & Frontend Engineer*
- **Institution / University / Incubator:** Chandigarh University, Uttar Pradesh
- **Department / Degree Programme:** Department of Computer Science & Engineering — B.Tech in Computer Science and Engineering (Artificial Intelligence & Machine Learning)
- **Faculty Mentor / Advisor:** Not Applicable — Independent Entry
- **Public GitHub Repository:** [https://github.com/tharundev-123/GlucoTwin_AI](https://github.com/tharundev-123/GlucoTwin_AI)
- **15–20 Minute Unlisted YouTube Walkthrough:** [`demo video`](https://youtu.be/hWIF9GkOLSY?si=A8am0nV4e_66GooA) *(See [demo/video-link.md](demo/video-link.md) for detailed recording script & timeline)*

---

## 🎯 Problem Statement & Clinical Relevance

Over 530 million adults worldwide live with diabetes mellitus. Glycemic control is fraught with high volatility caused by unpredictable carbohydrate absorption, physical exertion, illness, and circadian hormonal cycles. 

Traditional Continuous Glucose Monitors (CGMs) are **reactive snapshots** that present historical and current values with a 10–15 minute interstitial lag. By the time a patient observes an excursion on a monitor, hypoglycemia or hyperglycemia may already be imminent. 

**The Digital Twin Paradigm:**  
A digital twin maintains a continuous computational representation of the patient's physiological state. By preserving memory of recent meals, exertion levels, and diurnal oscillations, GlucoTwin AI looks **2 hours ahead (120 minutes / 24 five-minute ticks)**, providing actionable foresight into glycemic trends alongside mathematically defensible confidence intervals.

---

## 🏥 Healthcare Use Case & Regulatory Boundaries

### Use Case Scenario
A simulated demo patient (Subject `GT-8842`) has ongoing telemetry streams:
1. **Glucose readings (CGM):** 5-minute sampling interval.
2. **Contextual biometrics:** Heart rate, exertion level (0.0 to 1.0), estimated meal carbohydrates (grams), and sleep duration.
3. **Continuous virtual state updates:** The in-memory twin buffers telemetry, updates its velocity (rate of change in mg/dL/min), and computes a forward 2-hour forecast trajectory.
4. **Interactive What-If Scenario Sandbox:** Clinicians and researchers can test hypothetical nutritional or exercise interventions (e.g., "What if a 60g carb lunch is paired with a 30-minute brisk walk?") to observe projected physiological shifts without clinical risk.

### Clear Regulatory Boundaries
- **Non-SaMD Declaration:** Clarified under FDA 21 CFR 860 and EU MDR Annex VIII as a non-diagnostic educational demonstration.
- **No Treatment or Insulin Guidance:** The system explicitly refrains from recommending insulin units, oral hypoglycemic agents, or emergency protocols.
- **Privacy by Design:** Zero collection or persistence of Protected Health Information (PHI). Utilizes purely synthetic, de-identified identities.

---

## 🛠️ Complete Technical Stack

| Tier | Technologies Used | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend UI/UX** | **React 18.3, TypeScript 5.6, Vite 5.4, Tailwind CSS 3.4, Recharts 2.13, Lucide Icons** | Full-screen responsive healthcare analytics dashboard, interactive CGM charts, uncertainty ribbons, simulation start/pause/step controls, What-If sandbox, dark/light themes. |
| **Backend API** | **Python 3.11, FastAPI 0.110+, Uvicorn, Pydantic v2** | Asynchronous REST services, OpenAPI/Swagger (`/docs`), deterministic simulation ticker buffer, CORS security, static SPA serving. |
| **Machine Learning** | **scikit-learn 1.3+, pandas 2.0+, NumPy 1.24+, joblib 1.3+** | 23-feature backward time-series pipeline, 150-tree Random Forest regression ensemble, inter-tree variance uncertainty calculation. |
| **Documentation & QA** | **Pytest 9.1, ReportLab 4.0, python-pptx 0.6+, httpx** | 15 automated unit & integration tests, vector architecture PDF, 10-slide presentation PDF/PPTX, testing report. |

---

## 🔬 AI/ML Framework, Feature Engineering & Zero Leakage

### 1. Prediction Target Formulation
- **Sampling Frequency:** Fixed 5-minute intervals ($\Delta t = 5\text{ min}$).
- **Target Horizon:** Exactly 120 minutes ahead ($t + 120\text{m}$), corresponding to $k = 24$ steps:
  $$y_{\text{target}}(t) = \text{glucose}(t + 24)$$

### 2. Time-Series Feature Pipeline (23 Dimensions, Zero Leakage)
All features are derived **strictly from historical and current observations at or prior to $t$**:
- **Autoregressive Lags:** `glucose_lag_1` (t-5m), `lag_2` (t-10m), `lag_3` (t-15m), `lag_6` (t-30m), `lag_12` (t-1h), `lag_24` (t-2h).
- **First Derivatives (Glycemic Velocity):**
  $$\text{roc\_15m} = \frac{\text{glucose}_t - \text{glucose}_{t-3}}{15}, \quad \text{roc\_30m} = \frac{\text{glucose}_t - \text{glucose}_{t-6}}{30}$$
- **Rolling Windows (Backward-only):** Rolling mean (30m, 1h, 2h) and rolling standard deviation (30m volatility).
- **Harmonic Temporal Features:** Sine and cosine cyclic hour encodings preserving boundary continuity across midnight:
  $$\sin\left(\frac{2\pi \cdot \text{hour}}{24}\right), \quad \cos\left(\frac{2\pi \cdot \text{hour}}{24}\right)$$
- **Contextual Aggregations:** Rolling 1-hour carbohydrate sum (`meal_carbs_sum_12`), rolling exertion index (`activity_mean_6`), and rolling heart rate (`hr_mean_6`).

### 3. Chronological Train / Test Split
To avoid temporal data leakage common in random shuffling:
- **Total Valid Samples:** 5,452 observations
- **Split Strategy:** Strict sequential chronological split:
  - **Train Set (First 80%):** 4,361 observations
  - **Holdout Test Set (Final 20%):** 1,091 observations

### 4. Defensible Uncertainty Quantification
Rather than fabricating arbitrary confidence bounds, GlucoTwin AI estimates prediction standard error from the empirical variance across all 150 individual decision trees in the ensemble:
$$\hat{\sigma}(x) = \sqrt{\frac{1}{B} \sum_{b=1}^B \left( \hat{f}_b(x) - \bar{f}(x) \right)^2}$$
$$\text{95% Prediction Interval} = \left[ \bar{f}(x) - 1.96 \cdot \hat{\sigma}(x), \, \bar{f}(x) + 1.96 \cdot \hat{\sigma}(x) \right]$$

---

## 📊 Honest Empirical Evaluation vs. Persistence Baseline

A standard time-series evaluation must benchmark against a naive baseline. In glucose forecasting, the standard benchmark is the **Persistence Baseline**, which predicts that glucose 2 hours from now will equal the current reading: $\hat{y}_{t+24} = y_t$.

### Verified Results on 1,091 Chronological Holdout Test Samples

| Metric | Trained Random Forest Model | Persistence Baseline ($\hat{y}_{t+24} = y_t$) | Verified Improvement |
| :--- | :---: | :---: | :---: |
| **Mean Absolute Error (MAE)** | **5.260 mg/dL** | 48.711 mg/dL | **+89.20% Error Reduction** |
| **Root Mean Squared Error (RMSE)** | **7.160 mg/dL** | 59.482 mg/dL | **+87.96% Error Reduction** |
| **Mean Absolute Percentage Error (MAPE)** | **3.59%** | 27.26% | **+86.83% Improvement** |

### Why Does Persistence Fail at 2 Hours?
While persistence is competitive over short horizons (e.g., 5 to 15 minutes), glucose changes drastically over a 2-hour window due to gastric carbohydrate absorption and physical exertion. The trained digital twin model captures circadian rhythms and digestive memory, significantly outperforming persistence without data leakage.

### Top Feature Importances (Gini Importance)
1. `cos_hour` (Circadian cosine harmonic): **56.16%**
2. `sin_hour` (Circadian sine harmonic): **14.17%**
3. `glucose` (Current glucose observation): **11.52%**
4. `glucose_lag_1` (Glucose 5 min ago): **8.42%**
5. `glucose_lag_2` (Glucose 10 min ago): **2.27%**
6. `glucose_lag_24` (Glucose 2 hours ago): **1.23%**
7. `glucose_roc_30m` (30-min rate of change): **1.18%**

---

## 🚀 Installation & Local Execution

### Prerequisites
- Python 3.10, 3.11, or 3.12
- Node.js v18+ and npm (optional for dev, production frontend bundle is pre-built)

### Quick Start (Single-Click Launchers)
- **Windows Command Prompt:** Double-click `run.bat`
- **Windows PowerShell:** Right-click `start.ps1` and select "Run with PowerShell"

### Manual Terminal Setup

```bash
# 1. Clone the repository
git clone https://github.com/tharundev-123/GlucoTwin_AI.git
cd GlucoTwin_AI

# 2. Set up Python virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS / Linux:
# source .venv/bin/activate

# 3. Install backend & ML dependencies
pip install -r requirements.txt

# 4. Train the ML model and verify metrics
python ml/train.py

# 5. Run the automated test suite
pytest -v

# 6. Build the React frontend production bundle (optional, pre-built in frontend/dist)
cd frontend
npm install
npm run build
cd ..

# 7. Start the FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Open Web Application:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Open Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Frontend Dev Server (Optional):** In `frontend/`, run `npm run dev` to access Vite hot-reload at [http://localhost:3000/](http://localhost:3000/).

---

## 🔌 API Documentation (`/api/v1/...`)

The backend exposes fully validated, self-documenting REST endpoints:

### System & Health
- `GET /health` — System status, regulatory scope declaration, and forecast horizon.

### Digital Twin State & Telemetry
- `GET /api/v1/twin/demo-patient/state` — Current virtual twin telemetry snapshot (glucose, rate-of-change, heart rate, activity, sleep, simulation status).
- `GET /api/v1/twin/demo-patient/history?limit=48` — Recent observed time-series data points (default: 48 points = 4 hours).

### 2-Hour Forecasting
- `GET /api/v1/forecast/demo-patient?horizon_minutes=120` — Point prediction for $t+120\text{m}$, delta from current, 95% confidence interval bounds, and interpolated 15-minute trajectory points.

### Simulation Controls
- `POST /api/v1/simulation/start` — Activates continuous time-series streaming.
- `POST /api/v1/simulation/pause` — Pauses real-time simulation streaming.
- `POST /api/v1/simulation/step` — Advances simulation clock by specified ticks with optional meal carbs or activity inputs:
  ```json
  {
    "meal_carbs_g": 45.0,
    "activity_level": 0.55,
    "sleep_hours": 7.0,
    "steps": 2
  }
  ```
- `POST /api/v1/simulation/reset` — Resets virtual patient to baseline state.
- `POST /api/v1/simulation/what-if` — Evaluates hypothetical metabolic scenarios (carbohydrate load vs. exercise exertion) over the 2-hour window.

### Model Analytics
- `GET /api/v1/model/metrics` — Actual evaluation metrics (MAE, RMSE, MAPE) comparing trained model to persistence baseline.
- `GET /api/v1/model/feature-importance` — Ranked Gini feature importance scores.

---

## 🧪 Testing Report Summary

All automated tests are implemented in `tests/` and run via `pytest`:
- **`tests/test_data_generator.py`**: Validates deterministic random seed, schema columns, and physiological bounds.
- **`tests/test_feature_engineering.py`**: Verifies 24-step target alignment and strict backward indexing (zero data leakage).
- **`tests/test_model_inference.py`**: Verifies model artifact loading and 95% confidence interval validity ($CI_{lower} \le \hat{y} \le CI_{upper}$).
- **`tests/test_api_endpoints.py`**: Integration tests across all endpoints, simulation controls, and what-if simulation.
- **Frontend Verification:** TypeScript compilation (`tsc`) passes with 0 errors; Vite produces optimized production assets.

See [`docs/testing_report.md`](docs/testing_report.md) for full test execution logs.

---

## 📁 Repository File Tree

```
GlucoTwin-AI/
├── .env.example                 # Environment configuration template
├── .gitignore                   # Git ignore rules (node_modules, .venv, etc.)
├── LICENSE                      # MIT Open-Source License
├── README.md                    # Master Hackathon Documentation
├── requirements.txt             # Python dependencies
├── run.bat                      # Windows batch single-click launcher
├── start.ps1                    # Windows PowerShell launcher
│
├── backend/                     # FastAPI Application Layer
│   ├── __init__.py
│   ├── main.py                  # App entrypoint, middleware, static mounting
│   ├── schemas.py               # Pydantic v2 request/response schemas
│   ├── services.py              # DigitalTwinService state & inference manager
│   └── routers/                 # Modular API routers
│       ├── __init__.py
│       ├── twin.py              # Twin state & history routes
│       ├── forecast.py          # 2-hour forecast routes
│       ├── simulation.py        # Start, pause, reset, step, what-if routes
│       └── model.py             # Metrics & feature importance routes
│
├── ml/                          # Machine Learning Pipeline
│   ├── __init__.py
│   ├── train.py                 # Data generator, feature engineering & training
│   ├── model.joblib             # Serialized 150-tree Random Forest artifact
│   └── metrics.json             # Actual evaluation results & feature importances
│
├── frontend/                    # React 18 + TypeScript + Vite Dashboard
│   ├── package.json             # NPM dependencies & scripts
│   ├── vite.config.ts           # Vite bundler & API proxy configuration
│   ├── tsconfig.json            # Strict TypeScript configuration
│   ├── tailwind.config.js       # Modern Tailwind CSS theme & animations
│   ├── postcss.config.js        # PostCSS configuration
│   ├── index.html               # Main HTML entrypoint with Inter font
│   ├── dist/                    # Compiled production static bundle
│   └── src/
│       ├── main.tsx             # React DOM root entry
│       ├── App.tsx              # Application layout & state streaming
│       ├── index.css            # Tailwind directives & glassmorphism
│       ├── types/index.ts       # Shared TypeScript interfaces
│       ├── services/api.ts      # REST API client
│       └── components/          # Polished UI Components
│           ├── Header.tsx                 # Brand, simulation controls & theme toggle
│           ├── RegulatoryBanner.tsx       # Educational prototype disclaimer
│           ├── TwinTelemetryCard.tsx      # Current glucose, ROC & physiological grid
│           ├── ForecastInsightCard.tsx    # 2-hour forecast, delta & 95% CI
│           ├── ModelPerformanceCard.tsx   # Model vs Persistence baseline comparison
│           ├── GlucoseForecastChart.tsx   # Recharts CGM telemetry & forecast ribbon
│           ├── FeatureImportanceChart.tsx # Top Gini features bar chart
│           ├── WhatIfSimulator.tsx        # Interactive metabolic perturbation sandbox
│           ├── PatientTimeline.tsx        # Chronological metabolic events log
│           └── ArchitectureModal.tsx      # 4-tier pipeline & regulatory modal
│
├── data/                        # Dataset Documentation
│   ├── README.md                # Provenance, mechanics & clinical import guide
│   └── synthetic_demo_patient.csv # Generated 5,500-row synthetic dataset
│
├── docs/                        # Deliverables & Presentations
│   ├── architecture.md          # Architecture specification & Mermaid diagram
│   ├── architecture.pdf         # Vector architecture blueprint document
│   ├── presentation.pdf         # 10-slide landscape presentation PDF
│   ├── presentation.pptx        # 10-slide editable PowerPoint presentation
│   ├── testing_report.md        # Comprehensive QA test verification report
│   └── generate_docs.py         # Automated PDF & PPTX generator script
│
├── demo/                        # Video Recording Guide
│   └── video-link.md            # 15-20 min video presentation outline & link
│
└── tests/                       # Automated Test Suite (Pytest)
    ├── test_data_generator.py   # Synthetic data tests
    ├── test_feature_engineering.py # Leakage & lag alignment tests
    ├── test_model_inference.py  # Model loading & uncertainty tests
    └── test_api_endpoints.py    # FastAPI REST integration tests
```

---

## 📑 Required Deliverable Links

All required hackathon competition documents are fully generated and included in this repository:
- **Architecture Diagram Source:** [`docs/architecture.md`](docs/architecture.md)
- **Architecture PDF:** [`docs/architecture.pdf`](docs/architecture.pdf)
- **Presentation PDF:** [`docs/presentation.pdf`](docs/presentation.pdf)
- **Presentation PowerPoint (Editable):** [`docs/presentation.pptx`](docs/presentation.pptx)
- **Testing Report:** [`docs/testing_report.md`](docs/testing_report.md)
- **Demo Video Outline & Link Placeholder:** [`demo/video-link.md`](demo/video-link.md)
- **Open-Source License:** [`LICENSE`](LICENSE) (MIT)

---

## 🔮 Limitations & Future Research Roadmap

1. **Synthetic Data Boundaries:** The current baseline uses synthetic deterministic physiological drift. While grounded in carbohydrate absorption kinetics and physical exertion models, real-world glycemic metabolism presents dynamic insulin resistance, hormonal stress, and sensor compression artifacts.
2. **Clinical Dataset Ingestion:** Next development phases will evaluate the pipeline on benchmark clinical trial cohorts (e.g., the **OhioT1DM dataset** and **D1NAMO dataset**).
3. **Advanced Temporal Architectures:** Exploration of Temporal Fusion Transformers (TFT) and bidirectional LSTM neural networks with multi-horizon quantile outputs.
4. **Physiological Lag Deconvolution:** Implementing interstitial-to-blood glucose deconvolution algorithms to correct sensor lag.

---

## 📄 License

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file for complete details.
