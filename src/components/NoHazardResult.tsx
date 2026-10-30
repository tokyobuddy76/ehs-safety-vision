/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, Shield, FileCheck, CheckSquare, Search } from 'lucide-react';

export const NoHazardResult: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-6 sm:p-8 space-y-6 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto text-slate-700 shadow-xs">
        <Search className="w-8 h-8 text-slate-700" />
      </div>

      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Visual Screening Assessment
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          No obvious EHS hazards were identified from this image.
        </h2>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs sm:text-sm text-amber-950 space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-amber-900 uppercase tracking-wide text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mandatory EHS Compliance Notice:</span>
          </div>
          <p className="leading-relaxed">
            This does not confirm that the workplace or activity is safe or compliant. Some hazards and
            controls cannot be identified from a photograph. Complete the required workplace inspection
            and follow applicable procedures.
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 text-left space-y-2">
        <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-slate-600" />
          <span>Non-Visual Pre-Work Checklist (Always Conduct On Site):</span>
        </div>
        <ul className="space-y-1.5 text-slate-700">
          <li className="flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Complete Pre-Job Risk Assessment (PJRA) or Job Hazard Analysis (JHA).</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Verify zero energy state and physical isolation locks (LOTO) prior to machinery maintenance.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Confirm valid permits for Hot Work, Working at Heights, or Confined Space Entry.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Inspect lifting gear, rigging tags, and PPE condition before commencing work.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
