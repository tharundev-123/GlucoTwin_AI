import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid
} from 'recharts';
import { HistoryRecord, TrajectoryPoint } from '../types';

interface GlucoseForecastChartProps {
  history: HistoryRecord[];
  trajectory: TrajectoryPoint[];
  loading: boolean;
}

export const GlucoseForecastChart: React.FC<GlucoseForecastChartProps> = ({
  history,
  trajectory,
  loading
}) => {
  if (loading && history.length === 0) {
    return (
      <div className="glass-panel p-6 h-[420px] flex items-center justify-center animate-pulse">
        <div className="text-sm font-medium text-slate-400">Loading CGM telemetry and forecast horizon...</div>
      </div>
    );
  }

  // Merge history and forecast trajectory into a contiguous time-series stream
  const chartData = [
    ...history.map((h) => ({
      time: h.time_str,
      timestamp: h.timestamp,
      observedGlucose: h.glucose,
      forecastGlucose: null,
      uncertaintyBand: null,
      lowerBound: null,
      upperBound: null,
      isForecast: false
    })),
    // Anchor the forecast line to the latest historical point so there is no visual gap
    ...(history.length > 0 && trajectory.length > 0
      ? [
          {
            time: history[history.length - 1].time_str,
            timestamp: history[history.length - 1].timestamp,
            observedGlucose: history[history.length - 1].glucose,
            forecastGlucose: history[history.length - 1].glucose,
            uncertaintyBand: [
              history[history.length - 1].glucose,
              history[history.length - 1].glucose
            ],
            lowerBound: history[history.length - 1].glucose,
            upperBound: history[history.length - 1].glucose,
            isForecast: true
          }
        ]
      : []),
    ...trajectory.map((t) => ({
      time: t.time_str,
      timestamp: t.timestamp,
      observedGlucose: null,
      forecastGlucose: t.projected_glucose,
      uncertaintyBand: [t.lower_bound, t.upper_bound],
      lowerBound: t.lower_bound,
      upperBound: t.upper_bound,
      isForecast: true
    }))
  ];

  const currentTimeStr = history.length > 0 ? history[history.length - 1].time_str : '';

  return (
    <div className="glass-panel p-6 relative">
      {/* Title & Legend Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Continuous Glucose Telemetry & 2-Hour Prediction Horizon
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              5-min Resolution
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical observed simulated readings vs. ML ensemble 120-minute forward trajectory with 95% CI
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-300">Observed Telemetry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-sky-500 border-b border-dashed border-sky-400 rounded-full" />
            <span className="text-slate-600 dark:text-slate-300">2-Hr Model Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sky-500/20 border border-sky-500/30 rounded-xs" />
            <span className="text-slate-600 dark:text-slate-300">95% Uncertainty Band</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xs" />
            <span className="text-slate-600 dark:text-slate-300">Target Range (70-180)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[400px] sm:h-[430px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 20, left: -5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />

            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dy={5}
            />

            <YAxis
              domain={[50, 240]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dx={-5}
              unit=" mg/dL"
            />

            {/* Target Glycemic Range reference band (70 - 180) */}
            <ReferenceArea
              y1={70}
              y2={180}
              fill="#10b981"
              fillOpacity={0.06}
              stroke="#10b981"
              strokeOpacity={0.2}
              strokeDasharray="2 2"
            />

            {/* Vertical Marker for Current Simulated Time t0 */}
            {currentTimeStr && (
              <ReferenceLine
                x={currentTimeStr}
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Current State (t₀)',
                  position: 'insideTopLeft',
                  fill: '#0284c7',
                  fontSize: 10,
                  fontWeight: 600
                }}
              />
            )}

            {/* Uncertainty Ribbon (Area between lower and upper bound) */}
            <Area
              type="monotone"
              dataKey="uncertaintyBand"
              stroke="transparent"
              fill="#38bdf8"
              fillOpacity={0.18}
              isAnimationActive={false}
            />

            {/* Historical Observed Glucose Line */}
            <Line
              type="monotone"
              dataKey="observedGlucose"
              name="Observed Glucose"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#10b981', strokeWidth: 1 }}
              activeDot={{ r: 5, fill: '#059669' }}
              isAnimationActive={false}
            />

            {/* 2-Hour Projected Forecast Trajectory */}
            <Line
              type="monotone"
              dataKey="forecastGlucose"
              name="Projected Forecast"
              stroke="#0284c7"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#0284c7' }}
              activeDot={{ r: 6, fill: '#0369a1' }}
              isAnimationActive={false}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isFuture = data.isForecast;
                  const val = isFuture ? data.forecastGlucose : data.observedGlucose;

                  return (
                    <div className="bg-slate-900/95 text-white border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs">
                      <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-800">
                        <span className="font-bold text-slate-300">Time: {label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isFuture ? 'bg-sky-900/80 text-sky-300 border border-sky-700' : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                        }`}>
                          {isFuture ? '2-Hr Projected' : 'Simulated Observation'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5 my-1">
                        <span className="text-xl font-black text-white">{val ? Number(val).toFixed(1) : '--'}</span>
                        <span className="text-slate-400">mg/dL</span>
                      </div>
                      {isFuture && data.lowerBound && data.upperBound && (
                        <div className="text-[11px] text-sky-300 mt-1">
                          95% Confidence Band: [{Number(data.lowerBound).toFixed(1)} - {Number(data.upperBound).toFixed(1)}] mg/dL
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
        <span>Target Glycemic Range: 70 - 180 mg/dL (ADA Standards)</span>
        <span className="font-medium text-sky-600 dark:text-sky-400">Horizon: +120 minutes ahead (24 steps)</span>
      </div>
    </div>
  );
};
