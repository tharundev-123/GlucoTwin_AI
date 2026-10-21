import React from 'react';
import { X, Layers, Cpu, Database, Activity, GitBranch, AlertTriangle } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              GlucoTwin AI — Architecture & Scope
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Digital Twin Challenge 2026 • Time-Series Research Framework
            </p>
          </div>
        </div>

        {/* Team Credentials Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-cyan-50 to-teal-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/80 border border-sky-100 dark:border-slate-700/80 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-sky-200/50 dark:border-slate-700">
            <span className="font-bold text-sky-900 dark:text-sky-300">
              Team: <span className="font-extrabold text-sky-600 dark:text-sky-400">Team Winners</span>
            </span>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Chandigarh University, Uttar Pradesh
            </span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <p>
              <strong className="text-slate-800 dark:text-slate-100">Team Members:</strong> Tharun Dev M C (Lead AI/ML) • Ashish Kumar Rawat (Full-Stack/Cloud) • Saim Quadeer (UI/UX)
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Department of Computer Science & Engineering — B.Tech in CSE (AI & ML) • Independent Entry
            </p>
          </div>
        </div>

        {/* 4-Layer Architecture Diagram */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            System Component Pipeline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Layer 1 */}
            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60">
              <div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-200 mb-2">
                <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                1. Data Generator
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Deterministic 5-min physiological simulator. Models carbohydrate absorption, circadian cycles, exercise uptake, and heart rate dynamics.
              </p>
            </div>

            {/* Layer 2 */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
              <div className="flex items-center gap-2 font-bold text-indigo-800 dark:text-indigo-200 mb-2">
                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                2. Feature Engine
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Constructs backward lags (t-5m to t-2h), rates of change (15m, 30m), rolling means, and cyclical harmonic features without future leakage.
              </p>
            </div>

            {/* Layer 3 */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                <GitBranch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                3. ML Ensemble
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                RandomForestRegressor with 150 estimators. Chronological 80/20 train/test split. Calibrated inter-tree variance provides 95% confidence bounds.
              </p>
            </div>

            {/* Layer 4 */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60">
              <div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-200 mb-2">
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                4. Twin Dashboard
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                FastAPI validated REST services + React TypeScript UI with Recharts CGM telemetry, simulation start/pause/step controls, and what-if exploration.
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory, Ethics & Scope Details */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 mb-6 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Regulatory Boundary & Clinical Safety Declaration
          </div>
          <p className="leading-relaxed">
            <strong>Educational & Academic Scope:</strong> This project is designed exclusively for the Unstop Digital Twin Challenge 2026. It is <strong>NOT a medical device</strong> and has not received FDA clearance or CE mark under software as a medical device (SaMD) regulations.
          </p>
          <p className="leading-relaxed">
            <strong>No Clinical Instructions:</strong> Under no circumstances does this software recommend insulin dosages, administer therapeutic actions, or diagnose metabolic syndromes. All physiological data shown originates from a synthetic deterministic mathematical model.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
