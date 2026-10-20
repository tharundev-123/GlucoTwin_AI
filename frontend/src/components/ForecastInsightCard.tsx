import React from 'react';
import { Target, TrendingUp, TrendingDown, Minus, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { ForecastResponse } from '../types';

interface ForecastInsightCardProps {
  forecast: ForecastResponse | null;
  loading: boolean;
}

export const ForecastInsightCard: React.FC<ForecastInsightCardProps> = ({ forecast, loading }) => {
  if (loading || !forecast) {
    return (
      <div className="glass-panel p-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-md mb-4" />
        <div className="h-16 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    );
  }

  const pred = forecast.predicted_glucose_mg_dl;
  const delta = forecast.delta_from_current_mg_dl;
  const ci = forecast.confidence_interval_95;
  const stdErr = forecast.uncertainty_std_err_mg_dl;

  const isUp = delta > 2.0;
  const isDown = delta < -2.0;
  const DeltaIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const deltaColor = isUp ? 'text-amber-500' : isDown ? 'text-rose-500' : 'text-slate-400';

  const inTarget = pred >= 70 && pred <= 180;

  return (
    <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2-Hour Forecast
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Prediction Horizon: +120 Minutes
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            ML Ensemble
          </span>
        </div>

        {/* Prediction Value */}
        <div className="my-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-sky-600 dark:text-sky-400">
              {pred.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              mg/dL
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs font-medium">
            <span className={`flex items-center gap-1 font-semibold ${deltaColor}`}>
              <DeltaIcon className="w-4 h-4" />
              {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} mg/dL
            </span>
            <span className="text-slate-400">from current</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              Target: {new Date(forecast.forecast_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Uncertainty & Confidence Interval */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 my-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              95% Confidence Interval
              <span title="Estimated from inter-tree variance across 150 decision trees">
                <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
              </span>
            </span>
            <span className="font-mono text-xs text-sky-600 dark:text-sky-400 font-bold">
              [{ci.lower_mg_dl.toFixed(1)} - {ci.upper_mg_dl.toFixed(1)}] mg/dL
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Ensemble Standard Error (σ):</span>
            <span className="font-mono font-medium">±{stdErr.toFixed(2)} mg/dL</span>
          </div>
        </div>
      </div>

      {/* Illustrative Safety Assessment */}
      <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
        inTarget
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
      }`}>
        {inTarget ? (
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        )}
        <div>
          <span className="font-bold">
            {inTarget ? 'Stable Trajectory Expected' : 'Caution: Approaching Boundary'}
          </span>
          <p className="text-[11px] mt-0.5 opacity-90">
            {inTarget
              ? 'Model forecasts virtual glucose will maintain position within standard target range (70-180 mg/dL).'
              : 'Projected glucose approaches physiological caution threshold. Simulated event only; not medical advice.'}
          </p>
        </div>
      </div>
    </div>
  );
};
