/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, FileText, CheckSquare } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <footer className="mt-12 pt-6 pb-8 border-t border-slate-300 text-slate-600 bg-slate-50/80 rounded-xl p-5 border shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-2 text-xs leading-relaxed">
          <p className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
            EHS Screening Tool Disclaimer & Operational Boundary
          </p>
          <p className="text-slate-700">
            AI-assisted EHS visual screening based on the Workplace EHS framework.
            Results may be incomplete or incorrect and do not replace a qualified EHS professional,
            workplace risk assessment, PJRA/JHA, permit-to-work process, applicable procedures,
            regulations, equipment inspections or required training.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-slate-500" /> Verify on-site zero energy (LOTO)
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Active permits required for high-risk work
            </span>
            <span>EHS Safety Vision v2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
