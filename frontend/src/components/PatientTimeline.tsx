import React from 'react';
import { History, Utensils, Flame, Moon, Clock, Shield } from 'lucide-react';
import { HistoryRecord } from '../types';

interface PatientTimelineProps {
  history: HistoryRecord[];
}

export const PatientTimeline: React.FC<PatientTimelineProps> = ({ history }) => {
  // Extract metabolic events from recent history
  const recentEvents = history.slice(-8).reverse();

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Virtual Patient Timeline
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Deterministic Event Sequence • Synthetic Subject GT-8842
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Shield className="w-3 h-3 text-emerald-500" /> De-identified Synthetic
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {recentEvents.map((rec, i) => {
          const hasCarbs = rec.meal_carbs_g > 5;
          const hasExertion = rec.activity > 0.45;
          const isSleep = rec.sleep_hours > 6 && rec.activity < 0.1;

          const EventIcon = hasCarbs ? Utensils : hasExertion ? Flame : isSleep ? Moon : Clock;
          const iconColor = hasCarbs
            ? 'text-sky-500 bg-sky-100 dark:bg-sky-950'
            : hasExertion
            ? 'text-amber-500 bg-amber-100 dark:bg-amber-950'
            : isSleep
            ? 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950'
            : 'text-slate-500 bg-slate-100 dark:bg-slate-800';

          const label = hasCarbs
            ? `Simulated Meal (${rec.meal_carbs_g.toFixed(0)}g carbs)`
            : hasExertion
            ? `Physical Activity (${Math.round(rec.activity * 100)}% exertion)`
            : isSleep
            ? 'Circadian Sleep Period'
            : 'Telemetry State Tick';

          return (
            <div key={rec.timestamp + i} className="relative flex items-center justify-between text-xs">
              <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 ${iconColor}`}>
                <EventIcon className="w-2.5 h-2.5" />
              </div>

              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{rec.time_str}</span>
                  <span>•</span>
                  <span>HR: {Math.round(rec.heart_rate)} bpm</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {rec.glucose.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">mg/dL</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
        <strong>Privacy & Research Boundaries:</strong> Only synthetic demo identities are modeled. No protected health information (PHI) or personal biometric wearables are tracked.
      </div>
    </div>
  );
};
