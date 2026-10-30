/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BellRing, Shield, Droplets, Wrench, Footprints } from 'lucide-react';

interface SafetyRemindersProps {
  reminders: string[];
}

const HANDBOOK_BASE_REMINDERS = [
  {
    title: 'Individual Lifting Limit',
    desc: 'The handbook restricts single-person manual lifting to 50 lb (23 kg). Utilize mechanical assistance or team lifts for heavier loads.',
    icon: Wrench,
  },
  {
    title: 'Compressed Air Cleaning',
    desc: 'Cleaning with compressed air must never exceed 30 psi. Effective chip guarding and eye/face protection are mandatory.',
    icon: Shield,
  },
  {
    title: 'Environmental Spill Reporting',
    desc: 'Any release or spill (oil, chemicals, coolant) must be contained immediately and reported to site EHS regardless of quantity.',
    icon: Droplets,
  },
  {
    title: 'Designated Shop Walkways',
    desc: 'Yellow-demarcated aisles and egress paths must remain permanently free of pallets, extension cords, hoses, and parts.',
    icon: Footprints,
  },
];

export const SafetyReminders: React.FC<SafetyRemindersProps> = ({ reminders }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
        <div className="p-2 bg-slate-900 text-white rounded-lg">
          <BellRing className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Field Guidance & Policy
          </div>
          <h3 className="text-lg font-bold text-slate-900">SAFETY REMINDERS & EHS STANDARDS</h3>
        </div>
      </div>

      {/* Dynamic Gemini Contextual Reminders */}
      {reminders.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Inspection-Specific Reminders:
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {reminders.map((reminder, idx) => (
              <li
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed font-medium flex items-start gap-2.5"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{reminder}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Standard Handbook Core Operating Principles */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Workplace EHS Handbook Baseline Expectations:
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {HANDBOOK_BASE_REMINDERS.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Icon className="w-3.5 h-3.5 text-slate-600" />
                  <span>{rule.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">{rule.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
