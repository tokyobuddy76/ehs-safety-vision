/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, AlertOctagon, Flame, Shield, CheckCircle, SlidersHorizontal } from 'lucide-react';
import type { RiskLevel, ActionPriority, EHSAssessmentResponse } from '../types/safety.ts';

interface RiskSummaryProps {
  assessment: EHSAssessmentResponse;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({
  assessment,
  selectedFilter,
  onFilterChange,
}) => {
  const { overallRiskLevel, summary, lifesavingRuleAlert, stopWorkRecommended, hazards } = assessment;

  const countByRisk: Record<RiskLevel, number> = {
    Critical: hazards.filter((h) => h.riskLevel === 'Critical').length,
    High: hazards.filter((h) => h.riskLevel === 'High').length,
    Medium: hazards.filter((h) => h.riskLevel === 'Medium').length,
    Low: hazards.filter((h) => h.riskLevel === 'Low').length,
  };

  const getRiskBadgeStyles = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-600 text-white border-red-700';
      case 'High':
        return 'bg-orange-600 text-white border-orange-700';
      case 'Medium':
        return 'bg-amber-500 text-slate-900 border-amber-600';
      case 'Low':
        return 'bg-emerald-600 text-white border-emerald-700';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Visual EHS Assessment Result
            </span>
            <span className="text-xs text-slate-400">• Workplace Inspection</span>
            {assessment.modelUsed && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 uppercase tracking-tight">
                Model: {assessment.modelUsed}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            EHS VISUAL SAFETY ASSESSMENT
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Big Overall Risk Badge */}
        <div className="shrink-0 flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Overall Risk Level
            </div>
            <div className="text-lg font-black text-slate-900">{overallRiskLevel}</div>
          </div>
          <div
            className={`px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wider shadow-xs border ${getRiskBadgeStyles(
              overallRiskLevel
            )}`}
          >
            {overallRiskLevel}
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Overall Risk */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Overall Risk
            </div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{overallRiskLevel}</div>
          </div>
          <Shield className="w-6 h-6 text-slate-400" />
        </div>

        {/* Metric 2: Potential Findings Count */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Potential Findings
            </div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {hazards.length}{' '}
              <span className="text-xs font-normal text-slate-500">item{hazards.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>

        {/* Metric 3: Lifesaving Rule Alert */}
        <div
          className={`p-3.5 rounded-lg border flex items-center justify-between ${
            lifesavingRuleAlert
              ? 'border-amber-400 bg-amber-50/80 text-amber-950'
              : 'border-slate-200 bg-slate-50 text-slate-900'
          }`}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-75">
              Lifesaving Rule Alert
            </div>
            <div className="text-xl font-black mt-0.5 flex items-center gap-2">
              <span>{lifesavingRuleAlert ? 'YES' : 'NO'}</span>
              {lifesavingRuleAlert && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-600 text-white rounded">
                  Priority
                </span>
              )}
            </div>
          </div>
          <Flame className={`w-6 h-6 ${lifesavingRuleAlert ? 'text-amber-600' : 'text-slate-400'}`} />
        </div>

        {/* Metric 4: STOP WORK */}
        <div
          className={`p-3.5 rounded-lg border flex items-center justify-between ${
            stopWorkRecommended
              ? 'border-red-500 bg-red-50 text-red-950'
              : 'border-slate-200 bg-slate-50 text-slate-900'
          }`}
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-75">
              STOP WORK
            </div>
            <div className="text-xl font-black mt-0.5 flex items-center gap-2">
              <span>{stopWorkRecommended ? 'YES' : 'NO'}</span>
              {stopWorkRecommended && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-600 text-white rounded animate-pulse">
                  Immediate
                </span>
              )}
            </div>
          </div>
          <AlertOctagon className={`w-6 h-6 ${stopWorkRecommended ? 'text-red-600' : 'text-slate-400'}`} />
        </div>
      </div>

      {/* Filter Tabs by Risk Level */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter Findings:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Findings ({hazards.length})
          </button>

          <button
            onClick={() => onFilterChange('lifesaving')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              selectedFilter === 'lifesaving'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Lifesaving ({hazards.filter((h) => h.lifesavingRule).length})
          </button>

          <button
            onClick={() => onFilterChange('Critical')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              selectedFilter === 'Critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-900 border border-red-200 hover:bg-red-100'
            }`}
          >
            Critical ({countByRisk.Critical})
          </button>

          <button
            onClick={() => onFilterChange('High')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              selectedFilter === 'High'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            High ({countByRisk.High})
          </button>

          <button
            onClick={() => onFilterChange('Medium')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              selectedFilter === 'Medium'
                ? 'bg-amber-500 text-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Medium ({countByRisk.Medium})
          </button>

          <button
            onClick={() => onFilterChange('Low')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              selectedFilter === 'Low'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Low ({countByRisk.Low})
          </button>
        </div>
      </div>
    </div>
  );
};
