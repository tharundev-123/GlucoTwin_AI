import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const RegulatoryBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/15 border-y border-amber-500/20 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-[11px] bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200">
            Educational Prototype
          </span>
          <p className="leading-snug">
            GlucoTwin AI is an academic proof of concept for the Digital Twin Challenge 2026. <strong className="font-semibold">Not a medical device.</strong> Never use for clinical diagnosis, glycemic emergencies, or insulin dose titration. All telemetry is deterministically simulated.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Non-diagnostic demonstration</span>
        </div>
      </div>
    </div>
  );
};
