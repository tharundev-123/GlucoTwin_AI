import React from 'react';
import { Heart, Flame, Utensils, Moon, ArrowUpRight, ArrowDownRight, ArrowRight, Dna } from 'lucide-react';
import { TwinState } from '../types';

interface TwinTelemetryCardProps {
  twinState: TwinState | null;
  loading: boolean;
}

export const TwinTelemetryCard: React.FC<TwinTelemetryCardProps> = ({ twinState, loading }) => {
  if (loading || !twinState) {
    return (
      <div className="glass-panel p-6 animate-pulse">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded-md mb-4" />
        <div className="h-16 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    );
  }

  const glucose = twinState.current_glucose_mg_dl;
  const roc = twinState.rate_of_change_mg_dl_min;

  // Status mapping
  const isTarget = twinState.glucose_status_label === 'in_target';
  const isHigh = twinState.glucose_status_label === 'elevated_caution';

  const statusColor = isTarget
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
    : isHigh
    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
    : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';

  const statusLabel = isTarget
    ? 'Target Range (70-180)'
    : isHigh
    ? 'Elevated (>180 mg/dL)'
    : 'Hypoglycemia Caution (<70)';

  // Rate of change icon
  const RocIcon = roc > 0.3 ? ArrowUpRight : roc < -0.3 ? ArrowDownRight : ArrowRight;
  const rocColor = roc > 0.3 ? 'text-amber-500' : roc < -0.3 ? 'text-rose-500' : 'text-slate-400';

  return (
    <div className="glass-panel p-6 relative overflow-hidden transition-all duration-300">
      {/* Decorative gradient glow */}
      <div className={`absolute -right-16 -top-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none ${
        isTarget ? 'bg-emerald-500' : isHigh ? 'bg-amber-500' : 'bg-rose-500'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Virtual State Snapshot
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Simulated Telemetry • 5m Resolution
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Primary Glucose Display */}
      <div className="my-5 flex items-baseline justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
              {glucose.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              mg/dL
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <RocIcon className={`w-4 h-4 ${rocColor}`} />
              {roc > 0 ? `+${roc.toFixed(2)}` : roc.toFixed(2)} mg/dL/min
            </span>
            <span>•</span>
            <span>Clock: {new Date(twinState.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Dynamic Holographic Twin Indicator */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-spin ${
            isTarget ? 'border-emerald-400/50' : isHigh ? 'border-amber-400/50' : 'border-rose-400/50'
          }`} style={{ animationDuration: '14s' }} />
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner ${
            isTarget ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : isHigh ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
          }`}>
            <span className="font-extrabold text-sm tracking-tighter">TWIN</span>
          </div>
        </div>
      </div>

      {/* Physiological Context Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        
        {/* Heart Rate */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Heart Rate</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {Math.round(twinState.heart_rate_bpm)}
            </span>
            <span className="text-[10px] text-slate-400">bpm</span>
          </div>
        </div>

        {/* Activity Level */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Activity</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {Math.round(twinState.activity_level_0_1 * 100)}
            </span>
            <span className="text-[10px] text-slate-400">%</span>
          </div>
        </div>

        {/* Estimated Carbs */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Meal Carbs</span>
            <Utensils className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {twinState.estimated_meal_carbs_g.toFixed(0)}
            </span>
            <span className="text-[10px] text-slate-400">g</span>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sleep</span>
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {twinState.sleep_hours.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">hrs</span>
          </div>
        </div>

      </div>

    </div>
  );
};
