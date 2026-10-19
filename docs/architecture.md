# GlucoTwin AI — Architecture

```text
Historical / synthetic patient context       Simulated sensor time series
(age/context placeholders)                   (glucose, activity, meal, sleep, HR)
                 \                                      /
                  \                                    /
                   v                                  v
                    Data validation + feature engineering
                    (lags, rolling mean, timestamp features)
                                      |
                                      v
                       Forecasting model (scikit-learn)
                        Random Forest regression baseline
                                      |
                         +------------+-------------+
                         |                          |
                         v                          v
                 Forecast API                 Twin state API
                  FastAPI                       FastAPI
                         |                          |
                         +------------+-------------+
                                      v
                        Dashboard / charts / alerts
                        (frontend can call REST API)
                                      |
                                      v
                      Evaluation + limitations report
```

## Data flow
1. Generate or ingest permitted data.
2. Validate fields and sort by timestamp.
3. Derive lag/rolling features from past observations only.
4. Train and evaluate using a chronological split.
5. Expose the latest twin state and a 30-minute forecast.
6. Present uncertainty and limitations; never claim clinical validity.

## Security and privacy
The supplied demo has no real patient accounts and uses synthetic data. Before using real health data, add authentication, authorisation, audit logging, encryption, consent, retention rules, and a formal privacy/security review.
