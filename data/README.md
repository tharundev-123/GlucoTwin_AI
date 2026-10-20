# GlucoTwin AI — Dataset Documentation & Ingestion Guide

## 1. Overview & Data Provenance

All telemetry used in this proof-of-concept is **100% synthetically generated** using a biologically grounded deterministic mathematical simulator. **No real patient health records (PHI) are included or stored.**

The generated baseline dataset is saved at `data/synthetic_demo_patient.csv` whenever `python ml/train.py` executes.

### Synthetic Data Specification
- **Subject Identifier:** `demo-patient` (Virtual Subject GT-8842)
- **Sampling Frequency:** Exactly 5-minute intervals ($\Delta t = 5\text{ min}$)
- **Sample Count:** 5,500 sequential observations (multi-week continuous trial)
- **Seed:** Deterministic seed `42` for exact scientific reproducibility

### Telemetry Attributes

| Column Name | Type | Range / Unit | Biological Description |
| :--- | :--- | :--- | :--- |
| `timestamp` | Datetime (ISO 8601) | YYYY-MM-DD HH:MM:SS | Continuous sequential clock time |
| `glucose` | Float | 60.0 – 260.0 mg/dL | Simulated continuous glucose monitor (CGM) reading |
| `heart_rate` | Float | 48.0 – 165.0 bpm | Cardiovascular rate correlated with exertion & diurnal rhythm |
| `activity` | Float | 0.0 – 1.0 (scale) | Physical exertion index (0.0=sedentary/sleep, 1.0=peak exertion) |
| `meal_carbs_g` | Float | 0.0 – 120.0 g | Estimated meal carbohydrate intake at ingestion timestamps |
| `sleep_hours` | Float | 3.0 – 10.0 hrs | Recorded sleep duration |
| `is_sleeping` | Integer | 0 or 1 | Circadian sleep state indicator (1 between 23:00 and 07:00) |

---

## 2. Physiological Simulation Mechanics

The synthetic generator (`ml/train.py::make_synthetic_data`) models four coupled physiological mechanisms:
1. **Homeostatic Metabolic Drift:** Negative feedback drawing baseline glucose toward an equilibrium of ~102 mg/dL:
   $$\text{drift} = 0.028 \cdot (102.0 - \text{glucose}_{t-1})$$
2. **Gastric Emptying & Digestive Absorption:** Meal carbohydrate loads are convolved with an exponential decay curve to simulate delayed postprandial glycemic excursions:
   $$\text{absorption}_t = \left( \text{meal\_carbs} * e^{-\lambda \tau} \right)_t$$
3. **Physical Exertion Uptake:** Muscular contraction accelerates glucose clearance and enhances insulin sensitivity:
   $$\Delta \text{glucose}_{\text{exercise}} = -1.9 \cdot \text{activity}_t$$
4. **Circadian Dynamics:** Diurnal cortisol and growth hormone fluctuations modulate early-morning dawn phenomenon and nocturnal baselines.

---

## 3. Importing Licensed Clinical Datasets

GlucoTwin AI supports drop-in replacement with licensed, de-identified clinical datasets (such as the OhioT1DM dataset or the D1NAMO dataset) for research purposes.

### Ingestion Steps:
1. Ensure the dataset is appropriately licensed for academic research and complies with HIPAA/GDPR de-identification standards.
2. Format your CSV to include at minimum: `timestamp` and `glucose` (mg/dL). Optional contextual fields include `heart_rate`, `activity`, `meal_carbs_g`.
3. Resample telemetry to 5-minute fixed intervals using forward-fill or linear interpolation.
4. Replace `data/synthetic_demo_patient.csv` and execute:
   ```bash
   python ml/train.py
   ```
5. **Warning:** Never commit private patient datasets or unanonymized records to public repositories.
