import React from 'react';
import { Activity, Play, Pause, RotateCcw, Sun, Moon, Info, Cpu } from 'lucide-react';
import { TwinState } from '../types';

interface HeaderProps {
  twinState: TwinState | null;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: (steps: number) => void;
  onReset: () => void;
  timeRangeHours: number;
  setTimeRangeHours: (hours: number) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  twinState,
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  timeRangeHours,
  setTimeRangeHours,
  darkMode,
  setDarkMode,
  onOpenArchitecture
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand & Patient Context */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white">
                GlucoTwin <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-500">AI</span>
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                PoC 2026
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Subject: {twinState ? twinState.patient_id : 'demo-patient'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Cpu className="w-3 h-3" /> Synthetic Generator
              </span>
            </div>
          </div>
        </div>

        {/* Simulation Ticker Controls & Range */}
        <div className="hidden md:flex items-center gap-3">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isRunning
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            {isRunning ? 'Simulation Streaming' : 'Simulation Paused'}
          </div>

          {/* Start/Pause */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium text-xs text-white shadow-sm transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
            title={isRunning ? 'Pause simulation stream' : 'Resume real-time simulation'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'Pause' : 'Start Stream'}
          </button>

          {/* Step Controls */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onStep(1)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all"
              title="Advance simulated clock by 5 minutes"
            >
              +5m
            </button>
            <button
              onClick={() => onStep(6)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all"
              title="Advance simulated clock by 30 minutes"
            >
              +30m
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
            title="Reset twin state to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Time range selector */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 ml-2">
            {[2, 4, 8, 24].map((hrs) => (
              <button
                key={hrs}
                onClick={() => setTimeRangeHours(hrs)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  timeRangeHours === hrs
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        </div>

        {/* Right side utility icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Architecture & Scope</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Toggle color theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
