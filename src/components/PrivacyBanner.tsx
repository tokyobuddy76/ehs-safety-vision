/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 border-l-4 border-amber-500 rounded-r-lg p-4 text-slate-200 shadow-sm text-sm">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-100">
            <span>Data Handling & Privacy Notice</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Ephemeral Processing
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Images are sent to Gemini for analysis. Upload workplace photos only when permitted by your
            organization's AI, information-security and data-handling policies. Avoid confidential,
            customer-sensitive or personally identifiable information where possible.
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1 pt-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Photographs are processed temporarily for inspection screening and are not permanently stored. No facial recognition or demographic profiling is conducted.
          </p>
        </div>
      </div>
    </div>
  );
};
