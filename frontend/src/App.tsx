import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RegulatoryBanner } from './components/RegulatoryBanner';
import { TwinTelemetryCard } from './components/TwinTelemetryCard';
import { ForecastInsightCard } from './components/ForecastInsightCard';
import { ModelPerformanceCard } from './components/ModelPerformanceCard';
import { GlucoseForecastChart } from './components/GlucoseForecastChart';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { FeatureImportanceChart } from './components/FeatureImportanceChart';
import { PatientTimeline } from './components/PatientTimeline';
import { ArchitectureModal } from './components/ArchitectureModal';
import { api } from './services/api';
import { TwinState, HistoryRecord, ForecastResponse, ModelMetrics, FeatureImportance } from './types';

export const App: React.FC = () => {
  const [twinState, setTwinState] = useState<TwinState | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRangeHours, setTimeRangeHours] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('glucotwin_theme') === 'dark';
  });
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('glucotwin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('glucotwin_theme', 'light');
    }
  }, [darkMode]);

  // Load all telemetry & metrics
  const loadData = useCallback(async () => {
    try {
      const limit = timeRangeHours * 12; // 12 five-minute points per hour
      const [stateRes, histRes, fcRes, metricsRes, fiRes] = await Promise.all([
        api.getTwinState(),
        api.getTwinHistory(limit),
        api.getForecast(120),
        api.getModelMetrics(),
        api.getFeatureImportance()
      ]);

      setTwinState(stateRes);
      setIsRunning(stateRes.simulation_running);
      setHistory(histRes.history);
      setForecast(fcRes);
      setMetrics(metricsRes);
      setFeatureImportance(fiRes);
    } catch (err) {
      console.error('Error loading digital twin telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRangeHours]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simulation streaming interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(async () => {
        try {
          await api.stepSimulation({ steps: 1 });
          // Refresh state & forecast
          const limit = timeRangeHours * 12;
          const [s, h, f] = await Promise.all([
            api.getTwinState(),
            api.getTwinHistory(limit),
            api.getForecast(120)
          ]);
          setTwinState(s);
          setHistory(h.history);
          setForecast(f);
        } catch (err) {
          console.error('Simulation streaming step failed:', err);
        }
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRangeHours]);

  const handleTogglePlay = async () => {
    try {
      if (isRunning) {
        await api.pauseSimulation();
        setIsRunning(false);
      } else {
        await api.startSimulation();
        setIsRunning(true);
      }
    } catch (err) {
      console.error('Failed to toggle simulation state:', err);
    }
  };

  const handleStep = async (steps: number) => {
    try {
      setLoading(true);
      await api.stepSimulation({ steps });
      await loadData();
    } catch (err) {
      console.error('Failed to step simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await api.resetSimulation();
      setIsRunning(false);
      await loadData();
    } catch (err) {
      console.error('Failed to reset simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        twinState={twinState}
        isRunning={isRunning}
        onTogglePlay={handleTogglePlay}
        onStep={handleStep}
        onReset={handleReset}
        timeRangeHours={timeRangeHours}
        setTimeRangeHours={setTimeRangeHours}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
      />

      <RegulatoryBanner />

      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 space-y-6">
        
        {/* Top Metric Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TwinTelemetryCard twinState={twinState} loading={loading} />
          <ForecastInsightCard forecast={forecast} loading={loading} />
          <ModelPerformanceCard metrics={metrics} loading={loading} />
        </div>

        {/* Primary Interactive Telemetry & 2-Hour Horizon Chart */}
        <GlucoseForecastChart
          history={history}
          trajectory={forecast?.projected_trajectory || []}
          loading={loading}
        />

        {/* What-If Simulator & Feature Importance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <WhatIfSimulator />
          </div>
          <div className="lg:col-span-5">
            <FeatureImportanceChart features={featureImportance} loading={loading} />
          </div>
        </div>

        {/* Patient Timeline */}
        <PatientTimeline history={history} />

      </main>

      {/* Architecture & Ethical Scope Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
};
