/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Maximize2,
  Tag,
  AlertTriangle,
  ShieldAlert,
  Circle,
  Navigation,
  Crosshair,
  Layers,
} from 'lucide-react';
import type { EHSHazardFinding, RiskLevel } from '../types/safety.ts';

interface ImageHazardOverlayProps {
  imageSrc: string;
  hazards: EHSHazardFinding[];
  selectedHazardId: number | null;
  onSelectHazard: (id: number) => void;
}

type IndicatorStyle = 'circles-arrows' | 'circles-only' | 'arrows-only' | 'boxes';

export const ImageHazardOverlay: React.FC<ImageHazardOverlayProps> = ({
  imageSrc,
  hazards,
  selectedHazardId,
  onSelectHazard,
}) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>('circles-arrows');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Derive bounding boxes for all hazards, providing intelligent fallback coordinates for general locations
  const resolvedHazards = hazards.map((h, index) => {
    if (h.boundingBox) {
      return { ...h, resolvedBbox: h.boundingBox, isEstimated: false };
    }

    // Heuristic sector mapping if bounding box is null
    const loc = (h.location || '').toLowerCase();
    let bbox = { x: 0.35, y: 0.4, width: 0.25, height: 0.2 };

    if (loc.includes('floor') || loc.includes('ground') || loc.includes('walkway') || loc.includes('bottom')) {
      bbox = { x: 0.3, y: 0.72, width: 0.35, height: 0.18 };
    } else if (loc.includes('top') && loc.includes('right')) {
      bbox = { x: 0.62, y: 0.15, width: 0.28, height: 0.22 };
    } else if (loc.includes('top') && loc.includes('left')) {
      bbox = { x: 0.12, y: 0.15, width: 0.28, height: 0.22 };
    } else if (loc.includes('top') || loc.includes('crane') || loc.includes('overhead')) {
      bbox = { x: 0.35, y: 0.12, width: 0.3, height: 0.2 };
    } else if (loc.includes('right')) {
      bbox = { x: 0.65, y: 0.42, width: 0.25, height: 0.25 };
    } else if (loc.includes('left')) {
      bbox = { x: 0.1, y: 0.42, width: 0.25, height: 0.25 };
    } else {
      // Stagger slightly if multiple general findings
      const offset = (index % 3) * 0.15;
      bbox = { x: 0.25 + offset, y: 0.35 + offset * 0.6, width: 0.28, height: 0.22 };
    }

    return { ...h, resolvedBbox: bbox, isEstimated: true };
  });

  const getRiskColors = (level: RiskLevel, isSelected: boolean) => {
    switch (level) {
      case 'Critical':
        return {
          stroke: isSelected ? '#ef4444' : '#dc2626',
          fill: isSelected ? 'rgba(239, 68, 68, 0.28)' : 'rgba(220, 38, 38, 0.16)',
          pin: 'bg-red-600 text-white border-white',
          arrowColor: '#dc2626',
          ring: 'rgba(239, 68, 68, 0.6)',
          badgeBorder: 'border-red-500',
        };
      case 'High':
        return {
          stroke: isSelected ? '#f97316' : '#ea580c',
          fill: isSelected ? 'rgba(249, 115, 22, 0.26)' : 'rgba(234, 88, 12, 0.15)',
          pin: 'bg-orange-600 text-white border-white',
          arrowColor: '#ea580c',
          ring: 'rgba(249, 115, 22, 0.6)',
          badgeBorder: 'border-orange-500',
        };
      case 'Medium':
        return {
          stroke: isSelected ? '#f59e0b' : '#d97706',
          fill: isSelected ? 'rgba(245, 158, 11, 0.24)' : 'rgba(217, 119, 6, 0.14)',
          pin: 'bg-amber-500 text-slate-950 border-white',
          arrowColor: '#d97706',
          ring: 'rgba(245, 158, 11, 0.6)',
          badgeBorder: 'border-amber-400',
        };
      case 'Low':
        return {
          stroke: isSelected ? '#3b82f6' : '#2563eb',
          fill: isSelected ? 'rgba(59, 130, 246, 0.22)' : 'rgba(37, 99, 235, 0.12)',
          pin: 'bg-blue-600 text-white border-white',
          arrowColor: '#2563eb',
          ring: 'rgba(59, 130, 246, 0.6)',
          badgeBorder: 'border-blue-400',
        };
      default:
        return {
          stroke: '#64748b',
          fill: 'rgba(100, 116, 139, 0.15)',
          pin: 'bg-slate-700 text-white border-white',
          arrowColor: '#64748b',
          ring: 'rgba(100, 116, 139, 0.5)',
          badgeBorder: 'border-slate-500',
        };
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all ${
        isExpanded ? 'fixed inset-2 sm:inset-6 z-50 flex flex-col shadow-2xl' : ''
      }`}
    >
      {/* Top Controls Toolbar */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="font-bold tracking-wide">WORKPLACE OBSERVATION LINKAGE MAP</span>
          <span className="text-slate-400 text-[11px]">
            ({resolvedHazards.length} observation indicators)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Indicator Mode Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setIndicatorStyle('circles-arrows')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                indicatorStyle === 'circles-arrows'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Circled area with directional pointing arrow"
            >
              <Navigation className="w-3 h-3 rotate-45" />
              <span>Circles & Arrows</span>
            </button>

            <button
              onClick={() => setIndicatorStyle('circles-only')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                indicatorStyle === 'circles-only'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Circled hazard zones"
            >
              <Circle className="w-3 h-3" />
              <span>Circles</span>
            </button>

            <button
              onClick={() => setIndicatorStyle('boxes')}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                indicatorStyle === 'boxes'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Rectangular bounding zones"
            >
              <Crosshair className="w-3 h-3" />
              <span>Boxes</span>
            </button>
          </div>

          {/* Toggle Overlay Switch */}
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors font-semibold ${
              showOverlay
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-600'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {showOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showOverlay ? 'Indicators ON' : 'Indicators OFF'}</span>
          </button>

          {/* Toggle Labels */}
          {showOverlay && (
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors font-semibold ${
                showLabels
                  ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-600'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span className="hidden sm:inline">{showLabels ? 'Hide Labels' : 'Show Labels'}</span>
            </button>
          )}

          {/* Fullscreen / Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title={isExpanded ? 'Exit expanded view' : 'Expand full view'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className={`relative w-full bg-slate-950 flex items-center justify-center overflow-hidden ${
          isExpanded ? 'flex-1 min-h-0' : 'min-h-[340px] max-h-[620px]'
        }`}
      >
        {/* Photo Element */}
        <img
          src={imageSrc}
          alt="Workplace Inspection Area"
          className={`w-full h-auto object-contain block select-none ${
            isExpanded ? 'max-h-full' : 'max-h-[620px]'
          }`}
        />

        {/* Vector SVG Indicators Layer: Circles, Ellipses & Directional Arrows */}
        {showOverlay && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Dynamic arrowhead markers for each hazard */}
              {resolvedHazards.map((h) => {
                const colors = getRiskColors(h.riskLevel, selectedHazardId === h.id);
                return (
                  <React.Fragment key={`marker-${h.id}`}>
                    <marker
                      id={`arrowhead-${h.id}`}
                      viewBox="0 0 12 12"
                      refX="9"
                      refY="6"
                      markerWidth="8"
                      markerHeight="8"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 11 6 L 0 11 z" fill={colors.arrowColor} />
                    </marker>

                    {/* Filter for neon glow effect */}
                    <filter id={`glow-${h.id}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </React.Fragment>
                );
              })}
            </defs>

            {resolvedHazards.map((h) => {
              const bbox = h.resolvedBbox;
              const isSelected = selectedHazardId === h.id;
              const colors = getRiskColors(h.riskLevel, isSelected);

              // Center coordinates in 0-1000 coordinate system
              const cx = (bbox.x + bbox.width / 2) * 1000;
              const cy = (bbox.y + bbox.height / 2) * 1000;
              const rx = Math.max((bbox.width / 2) * 1000 + 12, 28);
              const ry = Math.max((bbox.height / 2) * 1000 + 12, 28);

              // Top-left corner for callout pin anchor
              const pinX = bbox.x * 1000;
              const pinY = bbox.y * 1000;

              // Arrow start point (offset slightly outside circle/box)
              const angle = Math.PI * 1.25; // 225 degrees (top-left direction)
              const arrowStartX = pinX - 8;
              const arrowStartY = pinY - 8;
              // Arrow points directly into the target zone
              const arrowEndX = cx;
              const arrowEndY = cy;

              return (
                <g
                  key={`svg-indicator-${h.id}`}
                  className="transition-opacity duration-200"
                  style={{ opacity: selectedHazardId === null || isSelected ? 1 : 0.65 }}
                >
                  {/* 1. CIRCLED AREA INDICATOR */}
                  {(indicatorStyle === 'circles-arrows' || indicatorStyle === 'circles-only') && (
                    <>
                      {/* Highlighted area fill */}
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={rx}
                        ry={ry}
                        fill={colors.fill}
                        stroke={colors.stroke}
                        strokeWidth={isSelected ? 4 : 2.5}
                        strokeDasharray={isSelected ? '8 4' : '6 3'}
                        filter={isSelected ? `url(#glow-${h.id})` : undefined}
                      />

                      {/* Animated pulse ring for selected observation */}
                      {isSelected && (
                        <ellipse
                          cx={cx}
                          cy={cy}
                          rx={rx + 16}
                          ry={ry + 16}
                          fill="none"
                          stroke={colors.stroke}
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          opacity="0.8"
                        >
                          <animate
                            attributeName="rx"
                            values={`${rx};${rx + 22};${rx}`}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="ry"
                            values={`${ry};${ry + 22};${ry}`}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.9;0.2;0.9"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </ellipse>
                      )}

                      {/* Center Bullseye / Crosshair Target Dot */}
                      <circle cx={cx} cy={cy} r="4" fill={colors.stroke} />
                    </>
                  )}

                  {/* 2. RECTANGULAR BOUNDING BOX INDICATOR (Alternative Style) */}
                  {indicatorStyle === 'boxes' && (
                    <rect
                      x={bbox.x * 1000}
                      y={bbox.y * 1000}
                      width={bbox.width * 1000}
                      height={bbox.height * 1000}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isSelected ? 3.5 : 2}
                      strokeDasharray={isSelected ? '6 3' : 'none'}
                      rx="6"
                    />
                  )}

                  {/* 3. DIRECTIONAL ARROW INDICATOR */}
                  {(indicatorStyle === 'circles-arrows' || indicatorStyle === 'arrows-only') && (
                    <g>
                      {/* Pointer Arrow Leader Line */}
                      <line
                        x1={arrowStartX}
                        y1={arrowStartY}
                        x2={arrowEndX}
                        y2={arrowEndY}
                        stroke={colors.arrowColor}
                        strokeWidth={isSelected ? 3.5 : 2.5}
                        markerEnd={`url(#arrowhead-${h.id})`}
                        strokeDasharray={isSelected ? 'none' : '4 2'}
                      />

                      {/* Arrow origin dot */}
                      <circle cx={arrowStartX} cy={arrowStartY} r="3" fill={colors.arrowColor} />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Interactive HTML Badges & Pins Layer */}
        {showOverlay && (
          <div className="absolute inset-0 pointer-events-none">
            {resolvedHazards.map((hazard) => {
              const bbox = hazard.resolvedBbox;
              const isSelected = selectedHazardId === hazard.id;
              const colors = getRiskColors(hazard.riskLevel, isSelected);

              // Percentage conversion for CSS positioning
              const left = `${bbox.x * 100}%`;
              const top = `${bbox.y * 100}%`;
              const width = `${bbox.width * 100}%`;
              const height = `${bbox.height * 100}%`;

              return (
                <div
                  key={`html-pin-${hazard.id}`}
                  style={{ left, top, width, height }}
                  className="absolute pointer-events-auto cursor-pointer"
                  onClick={() => onSelectHazard(hazard.id)}
                  title={`#${hazard.id}: ${hazard.hazard}`}
                >
                  {/* Floating Numbered Inspection Tag with Arrow Icon */}
                  <div className="absolute -top-4 -left-4 flex items-center shadow-lg z-20 group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHazard(hazard.id);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-md transition-all active:scale-95 ${
                        isSelected
                          ? 'scale-125 ring-3 ring-white shadow-xl'
                          : 'hover:scale-110 group-hover:shadow-lg'
                      } ${colors.pin}`}
                    >
                      {hazard.id}
                    </button>

                    {/* Expandable Observation Callout Pill */}
                    {showLabels && (
                      <div
                        className={`ml-1.5 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold text-white shadow-lg uppercase tracking-tight whitespace-nowrap backdrop-blur-md transition-transform ${
                          isSelected ? 'scale-105 ring-1 ring-white' : ''
                        } ${
                          hazard.riskLevel === 'Critical'
                            ? 'bg-red-950/90 border border-red-500'
                            : hazard.riskLevel === 'High'
                              ? 'bg-orange-950/90 border border-orange-500'
                              : hazard.riskLevel === 'Medium'
                                ? 'bg-amber-950/90 border border-amber-500 text-amber-200'
                                : 'bg-slate-900/90 border border-slate-600'
                        }`}
                      >
                        <Navigation className="w-3 h-3 rotate-45 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{hazard.hazard}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Footer / Pin Quick Index with Target Selector */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Circle className="w-3.5 h-3.5 text-amber-500" />
            <span>Click any observation tag to highlight its circled area & pointer arrow:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {resolvedHazards.map((h) => {
              const isSelected = selectedHazardId === h.id;

              return (
                <button
                  key={`quick-btn-${h.id}`}
                  onClick={() => onSelectHazard(h.id)}
                  className={`px-2.5 py-1 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs ring-2 ring-amber-500'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                      h.riskLevel === 'Critical'
                        ? 'bg-red-600'
                        : h.riskLevel === 'High'
                          ? 'bg-orange-600'
                          : h.riskLevel === 'Medium'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-blue-600'
                    }`}
                  >
                    {h.id}
                  </span>
                  <span className="truncate max-w-[100px]">{h.category}</span>
                  {isSelected && <Navigation className="w-3 h-3 text-amber-400 rotate-45" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
