/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClipboardCheck, CheckSquare, Square, ShieldCheck, AlertCircle } from 'lucide-react';

interface HumanVerificationProps {
  items: string[];
}

export const HumanVerification: React.FC<HumanVerificationProps> = ({ items }) => {
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});

  const toggleCheck = (index: number) => {
    setCheckedState((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const total = items.length;
  const completed = Object.values(checkedState).filter(Boolean).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-900 text-white rounded-lg">
            <ClipboardCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mandatory Physical Checks
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              HUMAN VERIFICATION REQUIRED ({completed}/{total})
            </h3>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2">
          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700">{percent}% Verified</span>
        </div>
      </div>

      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Visual Screening Limitation:</strong> A photograph cannot confirm administrative
          controls, calibrated atmospheric readings, certified equipment capacities, operator authorizations,
          or zero-energy states. The area supervisor or designated EHS lead must physically verify each item:
        </p>
      </div>

      {/* Checklist items */}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item, idx) => {
          const isChecked = Boolean(checkedState[idx]);
          return (
            <button
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                isChecked
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <span className={`text-xs font-medium leading-relaxed ${isChecked ? 'line-through text-emerald-800' : ''}`}>
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
