import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { FeatureImportance } from '../types';

interface FeatureImportanceChartProps {
  features: FeatureImportance[];
  loading: boolean;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ features, loading }) => {
  if (loading || features.length === 0) {
    return (
      <div className="glass-panel p-6 h-[340px] flex items-center justify-center animate-pulse">
        <div className="text-sm font-medium text-slate-400">Loading feature importance analytics...</div>
      </div>
    );
  }

  // Display top 8 most influential features
  const topFeatures = features.slice(0, 8).map((f) => ({
    name: formatFeatureName(f.feature),
    rawName: f.feature,
    importance: f.percentage
  })).reverse();

  function formatFeatureName(raw: string): string {
    const map: Record<string, string> = {
      cos_hour: 'Circadian (Cos Hour)',
      sin_hour: 'Circadian (Sin Hour)',
      glucose: 'Current Glucose',
      glucose_lag_1: 'Glucose (t-5m)',
      glucose_lag_2: 'Glucose (t-10m)',
      glucose_lag_24: 'Glucose (t-2h)',
      glucose_roc_30m: 'Rate of Change (30m)',
      glucose_roll_mean_24: 'Rolling Mean (2h)',
      glucose_roll_mean_6: 'Rolling Mean (30m)',
      meal_carbs_sum_12: 'Meal Carbs (1h sum)',
      activity_mean_6: 'Activity Index (30m)'
    };
    return map[raw] || raw;
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gini Feature Importance
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Top Predictive Drivers for 2-Hour Horizon
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          Random Forest Relative Weights
        </span>
      </div>

      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topFeatures} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} horizontal={false} />
            <XAxis type="number" unit="%" fontSize={11} stroke="#64748b" tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={11}
              stroke="#64748b"
              tickLine={false}
              width={140}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 text-white border border-slate-700/80 p-2.5 rounded-xl shadow-lg text-xs">
                      <div className="font-semibold text-slate-300">{item.name}</div>
                      <div className="text-sky-400 font-mono font-bold mt-1">
                        Importance: {item.importance.toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-slate-400">Feature code: {item.rawName}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="importance" fill="#0284c7" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
        Cyclical temporal features (circadian sin/cos) and recent glycemic velocity dominate the 2-hour forecast.
      </div>
    </div>
  );
};
