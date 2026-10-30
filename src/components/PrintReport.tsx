/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, Download, Share2, Shield, Calendar, MapPin, UserCheck } from 'lucide-react';
import type { EHSAssessmentResponse } from '../types/safety.ts';

interface PrintReportProps {
  assessment: EHSAssessmentResponse;
  imageSrc: string;
}

export const PrintReport: React.FC<PrintReportProps> = ({ assessment, imageSrc }) => {
  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs print:hidden shadow-sm">
      <div className="flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-amber-400" />
        <div>
          <span className="font-bold text-slate-100">Official Field Inspection Record</span>
          <span className="text-slate-400 block text-[11px]">
            Generated {today} • Ready for shop-floor distribution & shift handover
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF Report</span>
        </button>
      </div>
    </div>
  );
};
