/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
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
  Sparkles,
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

  // Exact rendered image dimensions on screen
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageBounds, setImageBounds] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
  }>({ width: 0, height: 0, left: 0, top: 0 });

  const updateImageBounds = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const parent = img.parentElement?.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0 && parent) {
      setImageBounds({
        width: rect.width,
        height: rect.height,
        left: rect.left - parent.left,
        top: rect.top - parent.top,
      });
    }
  };

  useEffect(() => {
    updateImageBounds();
    window.addEventListener('resize', updateImageBounds);
    return () => window.removeEventListener('resize', updateImageBounds);
  }, [imageSrc, isExpanded]);

  // Derive bounding boxes for all hazards, providing intelligent fallback coordinates for general locations
  const resolvedHazards = hazards.map((h, index) => {
    let bbox = h.boundingBox;
    let isEstimated = false;

    // Validate that boundingBox has non-zero coordinates
    if (
      !bbox ||
      typeof bbox.x !== 'number' ||
      typeof bbox.y !== 'number' ||
      typeof bbox.width !== 'number' ||
      typeof bbox.height !== 'number' ||
      bbox.width <= 0 ||
      bbox.height <= 0
    ) {
      isEstimated = true;
      const loc = (h.location || '').toLowerCase();
      if (loc.includes('floor') || loc.includes('ground') || loc.includes('walkway') || loc.includes('bottom')) {
        bbox = { x: 0.28, y: 0.7, width: 0.38, height: 0.18 };
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
        // Stagger positions across shop floor quadrants
        const positions = [
          { x: 0.32, y: 0.38, width: 0.3, height: 0.22 },
          { x: 0.58, y: 0.55, width: 0.28, height: 0.2 },
          { x: 0.15, y: 0.58, width: 0.28, height: 0.2 },
          { x: 0.42, y: 0.18, width: 0.28, height: 0.2 },
        ];
        bbox = positions[index % positions.length];
      }
    }

    // Clamp coordinates safely within [0, 1]
    const x = Math.max(0.01, Math.min(0.9, bbox.x));
    const y = Math.max(0.01, Math.min(0.9, bbox.y));
    const width = Math.max(0.06, Math.min(0.95 - x, bbox.width));
    const height = Math.max(0.06, Math.min(0.95 - y, bbox.height));

    const uniqueId = typeof h.id === 'number' && h.id > 0 ? h.id : index + 1;

    return {
      ...h,
      id: uniqueId,
      resolvedBbox: { x, y, width, height },
      isEstimated,
    };
  });

  const getRiskColors = (level: RiskLevel, isSelected: boolean) => {
    switch (level) {
      case 'Critical':
        return {
          stroke: isSelected ? '#ef4444' : '#dc2626',
          fill: isSelected ? 'rgba(239, 68, 68, 0.32)' : 'rgba(220, 38, 38, 0.18)',
          pin: 'bg-red-600 text-white border-white',
          arrowColor: isSelected ? '#ef4444' : '#dc2626',
          ring: 'rgba(239, 68, 68, 0.6)',
          badgeBorder: 'border-red-500',
        };
      case 'High':
        return {
          stroke: isSelected ? '#f97316' : '#ea580c',
          fill: isSelected ? 'rgba(249, 115, 22, 0.3)' : 'rgba(234, 88, 12, 0.16)',
          pin: 'bg-orange-600 text-white border-white',
          arrowColor: isSelected ? '#f97316' : '#ea580c',
          ring: 'rgba(249, 115, 22, 0.6)',
          badgeBorder: 'border-orange-500',
        };
      case 'Medium':
        return {
          stroke: isSelected ? '#f59e0b' : '#d97706',
          fill: isSelected ? 'rgba(245, 158, 11, 0.28)' : 'rgba(217, 119, 6, 0.15)',
          pin: 'bg-amber-500 text-slate-950 border-white',
          arrowColor: isSelected ? '#f59e0b' : '#d97706',
          ring: 'rgba(245, 158, 11, 0.6)',
          badgeBorder: 'border-amber-400',
        };
      case 'Low':
        return {
          stroke: isSelected ? '#3b82f6' : '#2563eb',
          fill: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.14)',
          pin: 'bg-blue-600 text-white border-white',
          arrowColor: isSelected ? '#3b82f6' : '#2563eb',
          ring: 'rgba(59, 130, 246, 0.6)',
          badgeBorder: 'border-blue-400',
        };
      default:
        return {
          stroke: '#64748b',
          fill: 'rgba(100, 116, 139, 0.18)',
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
            ({resolvedHazards.length} observation indicator{resolvedHazards.length === 1 ? '' : 's'})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Indicator Mode Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setIndicatorStyle('circles-arrows')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                indicatorStyle === 'circles-arrows'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Circled area with directional pointing arrow"
            >
              <Navigation className="w-3 h-3 rotate-45" />
              <span>Circles & Arrows</span>
            </button>

            <button
              onClick={() => setIndicatorStyle('circles-only')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                indicatorStyle === 'circles-only'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Circled hazard zones only"
            >
              <Circle className="w-3 h-3" />
              <span>Circles</span>
            </button>

            <button
              onClick={() => setIndicatorStyle('boxes')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                indicatorStyle === 'boxes'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
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
            {showOverlay ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
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
              <Tag className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">{showLabels ? 'Hide Labels' : 'Show Labels'}</span>
            </button>
          )}

          {/* Fullscreen / Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isExpanded ? 'Exit expanded view' : 'Expand full view'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className={`relative w-full bg-slate-950 flex items-center justify-center overflow-hidden select-none ${
          isExpanded ? 'flex-1 min-h-0' : 'min-h-[360px] max-h-[640px]'
        }`}
      >
        {/* Photo Element */}
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Workplace Inspection Area"
          onLoad={updateImageBounds}
          className={`w-full h-auto object-contain block ${
            isExpanded ? 'max-h-full' : 'max-h-[640px]'
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
              {resolvedHazards.map((h, idx) => {
                const colors = getRiskColors(h.riskLevel, selectedHazardId === h.id);
                return (
                  <marker
                    key={`marker-${h.id}-${idx}`}
                    id={`arrowhead-${h.id}`}
                    viewBox="0 0 14 14"
                    refX="11"
                    refY="7"
                    markerWidth="10"
                    markerHeight="10"
                    orient="auto-start-reverse"
                  >
                    <path d="M 1 2 L 13 7 L 1 12 z" fill={colors.arrowColor} stroke={colors.arrowColor} />
                  </marker>
                );
              })}

              {/* Glow filter for highlighted items */}
              <filter id="hazardGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {resolvedHazards.map((h, idx) => {
              const bbox = h.resolvedBbox;
              const isSelected = selectedHazardId === h.id;
              const colors = getRiskColors(h.riskLevel, isSelected);

              // Center coordinates in 0-1000 coordinate system
              const cx = (bbox.x + bbox.width / 2) * 1000;
              const cy = (bbox.y + bbox.height / 2) * 1000;
              const rx = Math.max((bbox.width / 2) * 1000 + 8, 30);
              const ry = Math.max((bbox.height / 2) * 1000 + 8, 30);

              // Arrow leader anchor: originates from top-left callout pin, points to center
              const pinX = bbox.x * 1000;
              const pinY = bbox.y * 1000;
              const arrowStartX = pinX > 40 ? pinX - 16 : pinX + 16;
              const arrowStartY = pinY > 40 ? pinY - 16 : pinY + 16;
              const arrowEndX = cx;
              const arrowEndY = cy;

              return (
                <g
                  key={`svg-indicator-${h.id}-${idx}`}
                  className="transition-opacity duration-200"
                  style={{ opacity: selectedHazardId === null || isSelected ? 1 : 0.65 }}
                >
                  {/* 1. CIRCLED AREA INDICATOR */}
                  {(indicatorStyle === 'circles-arrows' || indicatorStyle === 'circles-only') && (
                    <>
                      {/* Highlighted area fill and perimeter */}
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={rx}
                        ry={ry}
                        fill={colors.fill}
                        stroke={colors.stroke}
                        strokeWidth={isSelected ? 4.5 : 3}
                        strokeDasharray={isSelected ? '8 4' : '6 3'}
                        filter={isSelected ? 'url(#hazardGlow)' : undefined}
                      />

                      {/* Animated pulse ring for selected observation */}
                      {isSelected && (
                        <ellipse
                          cx={cx}
                          cy={cy}
                          rx={rx + 14}
                          ry={ry + 14}
                          fill="none"
                          stroke={colors.stroke}
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          opacity="0.8"
                        >
                          <animate
                            attributeName="rx"
                            values={`${rx};${rx + 24};${rx}`}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="ry"
                            values={`${ry};${ry + 24};${ry}`}
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

                      {/* Center Bullseye Crosshair Dot */}
                      <circle cx={cx} cy={cy} r="5" fill={colors.stroke} stroke="#ffffff" strokeWidth="1.5" />
                    </>
                  )}

                  {/* 2. RECTANGULAR BOUNDING BOX INDICATOR */}
                  {indicatorStyle === 'boxes' && (
                    <g>
                      <rect
                        x={bbox.x * 1000}
                        y={bbox.y * 1000}
                        width={bbox.width * 1000}
                        height={bbox.height * 1000}
                        fill={colors.fill}
                        stroke={colors.stroke}
                        strokeWidth={isSelected ? 4 : 2.5}
                        strokeDasharray={isSelected ? '8 4' : 'none'}
                        rx="8"
                        filter={isSelected ? 'url(#hazardGlow)' : undefined}
                      />
                      {/* Corner Target Markers */}
                      <circle cx={bbox.x * 1000} cy={bbox.y * 1000} r="4" fill={colors.stroke} />
                      <circle cx={(bbox.x + bbox.width) * 1000} cy={bbox.y * 1000} r="4" fill={colors.stroke} />
                      <circle cx={bbox.x * 1000} cy={(bbox.y + bbox.height) * 1000} r="4" fill={colors.stroke} />
                      <circle cx={(bbox.x + bbox.width) * 1000} cy={(bbox.y + bbox.height) * 1000} r="4" fill={colors.stroke} />
                    </g>
                  )}

                  {/* 3. DIRECTIONAL ARROW INDICATOR */}
                  {(indicatorStyle === 'circles-arrows' || indicatorStyle === 'arrows-only') && (
                    <g>
                      {/* Leader Line */}
                      <line
                        x1={arrowStartX}
                        y1={arrowStartY}
                        x2={arrowEndX}
                        y2={arrowEndY}
                        stroke={colors.arrowColor}
                        strokeWidth={isSelected ? 4 : 3}
                        markerEnd={`url(#arrowhead-${h.id})`}
                        strokeDasharray={isSelected ? 'none' : '6 3'}
                      />

                      {/* Leader Origin Pin Point */}
                      <circle
                        cx={arrowStartX}
                        cy={arrowStartY}
                        r="4"
                        fill={colors.arrowColor}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
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
            {resolvedHazards.map((hazard, idx) => {
              const bbox = hazard.resolvedBbox;
              const isSelected = selectedHazardId === hazard.id;
              const colors = getRiskColors(hazard.riskLevel, isSelected);

              // Exact CSS percentage anchors
              const left = `${bbox.x * 100}%`;
              const top = `${bbox.y * 100}%`;
              const width = `${bbox.width * 100}%`;
              const height = `${bbox.height * 100}%`;

              return (
                <div
                  key={`html-pin-${hazard.id}-${idx}`}
                  style={{ left, top, width, height }}
                  className="absolute pointer-events-auto cursor-pointer"
                  onClick={() => onSelectHazard(hazard.id)}
                  title={`#${hazard.id}: ${hazard.hazard}`}
                >
                  {/* Floating Numbered Inspection Tag with Arrow Icon */}
                  <div className="absolute -top-3.5 -left-3.5 flex items-center shadow-lg z-20 group">
                    <button
                      type="button"
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
            {resolvedHazards.map((h, idx) => {
              const isSelected = selectedHazardId === h.id;

              return (
                <button
                  key={`quick-btn-${h.id}-${idx}`}
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
                  <span className="truncate max-w-[110px]">{h.category}</span>
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
