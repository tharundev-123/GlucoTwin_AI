import { TwinState, HistoryRecord, ForecastResponse, ModelMetrics, FeatureImportance, WhatIfResponse } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getHealth() {
    const res = await fetch('/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getTwinState(): Promise<TwinState> {
    const res = await fetch(`${API_BASE}/twin/demo-patient/state`);
    if (!res.ok) throw new Error('Failed to fetch twin state');
    return res.json();
  },

  async getTwinHistory(limit: number = 48): Promise<{ count: number; history: HistoryRecord[] }> {
    const res = await fetch(`${API_BASE}/twin/demo-patient/history?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async getForecast(horizonMinutes: number = 120): Promise<ForecastResponse> {
    const res = await fetch(`${API_BASE}/forecast/demo-patient?horizon_minutes=${horizonMinutes}`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },

  async startSimulation() {
    const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start simulation');
    return res.json();
  },

  async pauseSimulation() {
    const res = await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to pause simulation');
    return res.json();
  },

  async resetSimulation() {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  async stepSimulation(params: { meal_carbs_g?: number; activity_level?: number; sleep_hours?: number; steps?: number }) {
    const res = await fetch(`${API_BASE}/simulation/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to step simulation');
    return res.json();
  },

  async simulateWhatIf(params: { scenario_name: string; hypothetical_carbs_g: number; hypothetical_activity_level: number; duration_minutes?: number }): Promise<WhatIfResponse> {
    const res = await fetch(`${API_BASE}/simulation/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to run what-if simulation');
    return res.json();
  },

  async getModelMetrics(): Promise<ModelMetrics> {
    const res = await fetch(`${API_BASE}/model/metrics`);
    if (!res.ok) throw new Error('Failed to fetch model metrics');
    return res.json();
  },

  async getFeatureImportance(): Promise<FeatureImportance[]> {
    const res = await fetch(`${API_BASE}/model/feature-importance`);
    if (!res.ok) throw new Error('Failed to fetch feature importance');
    return res.json();
  }
};
