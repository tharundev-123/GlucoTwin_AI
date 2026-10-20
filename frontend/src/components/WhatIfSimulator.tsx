import React, { useState } from 'react';
import { Sparkles, Utensils, Flame, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { WhatIfResponse } from '../types';

export const WhatIfSimulator: React.FC = () => {
  const [carbs, setCarbs] = useState<number>(45);
  const [activity, setActivity] = useState<number>(0.55);
  const [scenarioName, setScenarioName] = useState<string>('Custom Meal & Exertion');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  const presets = [
    { name: 'Moderate Meal', carbs: 45, activity: 0.25 },
    { name: 'Post-Meal 30m Walk', carbs: 55, activity: 0.65 },
    { name: 'High-Carb Dinner', carbs: 90, activity: 0.15 },
    { name: 'Vigorous Exercise', carbs: 10, activity: 0.85 }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setScenarioName(p.name);
    setCarbs(p.carbs);
    setActivity(p.activity);
  };

  const handleRunSimulation = async () => {
    try {
      setLoading(true);
      const res = await api.simulateWhatIf({
        scenario_name: scenarioName,
        hypothetical_carbs_g: carbs,
        hypothetical_activity_level: activity,
        duration_minutes: 120
      });
      setResult(res);
    } catch (err) {
      console.error('Failed to run what-if simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              What-If Metabolic Simulator
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Hypothetical Scenario Exploration • 2-Hour Horizon
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Hypothetical Only
        </span>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => handleApplyPreset(p)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              scenarioName === p.name
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Carbohydrate Slider */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-sky-500" />
              Hypothetical Meal Carbs
            </span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
              {carbs} g
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            step={5}
            value={carbs}
            onChange={(e) => setCarbs(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0g (Fasting)</span>
            <span>60g (Standard Meal)</span>
            <span>120g (Heavy)</span>
          </div>
        </div>

        {/* Physical Activity Slider */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Hypothetical Physical Exertion
            </span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
              {Math.round(activity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={activity}
            onChange={(e) => setActivity(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0% (Sedentary)</span>
            <span>50% (Brisk Walk)</span>
            <span>100% (High Intensity)</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleRunSimulation}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 shadow-md shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Simulating Scenario...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Simulate 2-Hour Trajectory
            </>
          )}
        </button>

        <span className="text-[11px] text-slate-400 italic">
          Runs physiological absorption & uptake differential
        </span>
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-5 p-4 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sky-900 dark:text-sky-200">
              {result.scenario_name} Projection
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-500">Baseline: {result.baseline_2h_glucose_mg_dl} mg/dL</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-sky-700 dark:text-sky-300">
                Scenario: {result.scenario_2h_glucose_mg_dl} mg/dL
              </span>
              <span className={`px-1.5 py-0.5 rounded font-bold ${
                result.net_impact_mg_dl > 0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
              }`}>
                {result.net_impact_mg_dl > 0 ? `+${result.net_impact_mg_dl}` : result.net_impact_mg_dl} mg/dL
              </span>
            </div>
          </div>

          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            {result.explanation}
          </p>

          <div className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/60">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{result.limitation_notice}</span>
          </div>
        </div>
      )}
    </div>
  );
};
