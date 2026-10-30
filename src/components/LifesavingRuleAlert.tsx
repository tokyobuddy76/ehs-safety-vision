/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Lock, ArrowUpCircle, ShieldCheck, LifeBuoy, AlertCircle } from 'lucide-react';
import type { EHSHazardFinding } from '../types/safety.ts';

interface LifesavingRuleAlertProps {
  hazards: EHSHazardFinding[];
  onSelectHazard?: (id: number) => void;
}

const LIFESAVING_RULES = [
  { id: 1, name: 'Lockout / Tagout (LOTO)', icon: Lock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 2, name: 'Working at Heights', icon: ArrowUpCircle, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 3, name: 'Machine Guarding', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 4, name: 'Suspended Loads', icon: Flame, color: 'text-red-600 bg-red-50 border-red-200' },
  { id: 5, name: 'Confined Spaces', icon: LifeBuoy, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
];

export const LifesavingRuleAlert: React.FC<LifesavingRuleAlertProps> = ({
  hazards,
  onSelectHazard,
}) => {
  const lifesavingFindings = hazards.filter((h) => h.lifesavingRule);

  return (
    <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Workplace EHS Priority
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Lifesaving Rule Exposure Identified ({lifesavingFindings.length})
            </h3>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300 self-start sm:self-auto">
          Handbook Zero-Tolerance Focus Area
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        The Workplace EHS handbook defines 5 Lifesaving Rules specifically designed to prevent
        fatalities and severe injuries. Any potential violation must be treated with the highest urgency:
      </p>

      {/* Lifesaving Rules reference badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {LIFESAVING_RULES.map((rule) => {
          const Icon = rule.icon;
          const isTriggered = lifesavingFindings.some(
            (f) =>
              f.category.toLowerCase().includes(rule.name.toLowerCase().split(' ')[0]) ||
              f.hazard.toLowerCase().includes(rule.name.toLowerCase().split(' ')[0])
          );

          return (
            <div
              key={rule.id}
              className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                isTriggered
                  ? 'border-red-500 bg-red-50 text-red-900 font-bold shadow-sm ring-1 ring-red-400'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${isTriggered ? 'text-red-600' : 'text-slate-400'}`} />
              <span className="text-[11px] leading-tight">
                {rule.id}. {rule.name}
              </span>
              {isTriggered && (
                <span className="text-[9px] px-1.5 py-0.2 bg-red-600 text-white rounded font-black tracking-wide uppercase">
                  Flagged
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Specific Findings List */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Flagged Findings Under Lifesaving Rules:
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {lifesavingFindings.map((finding, idx) => (
            <div
              key={`ls-finding-${finding.id}-${idx}`}
              onClick={() => onSelectHazard?.(finding.id)}
              className="p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 cursor-pointer transition-shadow shadow-xs hover:shadow-sm"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-amber-900 flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                    #{finding.id}
                  </span>
                  {finding.category}
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                  {finding.actionPriority}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 line-clamp-1">{finding.hazard}</p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{finding.recommendedAction}</p>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                <span>{finding.handbookSection}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
