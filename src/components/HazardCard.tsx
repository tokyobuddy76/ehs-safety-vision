/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Flame,
  Shield,
  Layers,
  MapPin,
  CheckCircle2,
  FileCheck,
  Activity,
  ArrowRight,
  Crosshair,
  Navigation,
} from 'lucide-react';
import type { EHSHazardFinding, RiskLevel, ActionPriority, ControlType } from '../types/safety.ts';

interface HazardCardProps {
  hazard: EHSHazardFinding;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export const HazardCard: React.FC<HazardCardProps> = ({ hazard, isSelected, onSelect }) => {
  const getRiskBadgeStyles = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-600 text-white border-red-700';
      case 'High':
        return 'bg-orange-600 text-white border-orange-700';
      case 'Medium':
        return 'bg-amber-500 text-slate-950 border-amber-600';
      case 'Low':
        return 'bg-blue-600 text-white border-blue-700';
      default:
        return 'bg-slate-700 text-white border-slate-800';
    }
  };

  const getPriorityBadgeStyles = (priority: ActionPriority) => {
    switch (priority) {
      case 'STOP WORK':
        return 'bg-red-700 text-white ring-2 ring-red-400 font-black animate-pulse';
      case 'Immediate':
        return 'bg-orange-100 text-orange-950 border border-orange-300 font-bold';
      case 'Correct Soon':
        return 'bg-amber-100 text-amber-950 border border-amber-300 font-bold';
      case 'Monitor / Verify':
        return 'bg-slate-100 text-slate-800 border border-slate-300 font-semibold';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getControlBadgeStyles = (type: ControlType) => {
    switch (type) {
      case 'Elimination':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300';
      case 'Substitution':
        return 'bg-teal-100 text-teal-950 border-teal-300';
      case 'Engineering':
        return 'bg-blue-100 text-blue-950 border-blue-300';
      case 'Administrative':
        return 'bg-indigo-100 text-indigo-950 border-indigo-300';
      case 'PPE':
        return 'bg-purple-100 text-purple-950 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div
      id={`hazard-card-${hazard.id}`}
      onClick={() => onSelect(hazard.id)}
      className={`rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-400 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Top Card Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shadow-xs border ${getRiskBadgeStyles(
              hazard.riskLevel
            )}`}
          >
            #{hazard.id}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                {hazard.category}
              </span>
              {hazard.lifesavingRule && (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                  <Flame className="w-3 h-3 text-red-600" /> Lifesaving Rule
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Handbook Section: {hazard.handbookSection}
            </div>
          </div>
        </div>

        {/* Priority & Risk Badges */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs px-2.5 py-1 rounded-md uppercase tracking-wider ${getPriorityBadgeStyles(
              hazard.actionPriority
            )}`}
          >
            {hazard.actionPriority}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${getRiskBadgeStyles(
              hazard.riskLevel
            )}`}
          >
            {hazard.riskLevel}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Core Hazard Title */}
        <div>
          <h3 className="text-base font-bold text-slate-950 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
            <span>{hazard.hazard}</span>
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {hazard.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-slate-400" /> Confidence: {hazard.confidence}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(hazard.id);
                const overlay = document.querySelector('img[alt="Workplace Inspection Area"]');
                if (overlay) {
                  overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 transition-colors"
            >
              <Navigation className="w-3 h-3 rotate-45 text-amber-600" />
              <span>Show Circle & Arrow in Photo</span>
            </button>
          </div>
        </div>

        {/* 3-Tier Separation: OBSERVED vs POTENTIAL HAZARD vs REQUIRES VERIFICATION */}
        <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
          {/* Factual Observation */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Visually Observed</span>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">{hazard.observation}</p>
          </div>

          {/* Potential Consequence */}
          <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-orange-800 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-orange-600" />
              <span>Potential Consequence</span>
            </div>
            <p className="text-orange-950 leading-relaxed font-medium">
              {hazard.potentialConsequence}
            </p>
          </div>
        </div>

        {/* Recommended Action (Hierarchy of Controls) */}
        <div className="p-3.5 rounded-lg bg-slate-900 text-white space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Corrective Action Plan</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getControlBadgeStyles(
                hazard.controlType
              )}`}
            >
              Control Level: {hazard.controlType}
            </span>
          </div>
          <p className="text-xs text-slate-100 leading-relaxed">{hazard.recommendedAction}</p>
        </div>

        {/* Verification Requirement Note */}
        {hazard.requiresHumanVerification && (
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
            <FileCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Human Verification Required: </span>
              <span className="text-amber-900">
                Non-visual controls (permits, zero-energy LOTO verification, equipment ratings, or JHA)
                must be validated on site by authorized personnel before work continues.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
