/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { EHSHazardFinding } from '../types/safety.ts';

interface StopWorkAlertProps {
  hazards: EHSHazardFinding[];
  onSelectHazard?: (id: number) => void;
}

export const StopWorkAlert: React.FC<StopWorkAlertProps> = ({ hazards, onSelectHazard }) => {
  const criticalHazards = hazards.filter(
    (h) => h.actionPriority === 'STOP WORK' || h.riskLevel === 'Critical'
  );

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-red-600 bg-red-50 shadow-md">
      {/* Industrial Warning Hazard Stripes Banner */}
      <div className="h-3 w-full bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_15px,#000_15px,#000_30px)]" />

      <div className="p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-lg shadow-sm animate-pulse">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 bg-red-600 text-white rounded">
                  Mandatory Action
                </span>
                <span className="text-xs font-bold text-red-900">Life Critical Exposure Detected</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-red-950 tracking-tight mt-0.5">
                STOP WORK / IMMEDIATE ATTENTION
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 border border-red-300 rounded-md text-xs font-bold text-red-900 self-start sm:self-auto">
            <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
            <span>Notify Area Supervisor Immediately</span>
          </div>
        </div>

        <p className="text-sm text-red-900 leading-relaxed font-medium">
          A visually observed condition presents an imminent or high-severity risk. In accordance with
          the Workplace EHS Handbook, any employee or contractor has the obligation and authority
          to stop work when uncontrolled hazards threaten life, health, or environmental safety.
        </p>

        {/* Triggered Critical Findings */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold uppercase tracking-wider text-red-950 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Conditions Requiring Work Stoppage ({criticalHazards.length}):</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {criticalHazards.map((item, idx) => (
              <button
                key={`stop-work-${item.id}-${idx}`}
                onClick={() => onSelectHazard?.(item.id)}
                className="text-left p-3 rounded-lg bg-white border border-red-300 hover:border-red-500 hover:shadow-sm transition-all group flex items-start gap-2.5"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center mt-0.5">
                  #{item.id}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-red-950 group-hover:text-red-700 truncate">
                    {item.hazard}
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                    {item.recommendedAction}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Safe Work Protocol Steps */}
        <div className="pt-2 border-t border-red-200 grid sm:grid-cols-3 gap-2 text-xs text-red-950 font-semibold">
          <div className="flex items-center gap-2 bg-white/70 p-2 rounded border border-red-200">
            <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
            <span>1. Halt task immediately</span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 p-2 rounded border border-red-200">
            <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
            <span>2. Clear & barricade zone</span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 p-2 rounded border border-red-200">
            <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
            <span>3. Verify controls with EHS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
