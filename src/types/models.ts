/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GeminiModelOption {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  costTier: '$' | '$$' | '$$$' | '$$$$';
  costLabel: string;
  speedRating: 'Fastest' | 'Fast' | 'Deep Reasoning';
  description: string;
  recommended?: boolean;
}

/**
 * Ordered strictly from cheapest (top/default) to most expensive (bottom)
 */
export const AVAILABLE_GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Cheapest • Fastest',
    costTier: '$',
    costLabel: 'Cheapest ($)',
    speedRating: 'Fastest',
    tagline: 'Lowest cost per inspection with ultra-fast latency (~2s)',
    description: 'Most economical option. Optimized for fast routine walkthroughs and low token consumption.',
    recommended: true,
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    badge: 'Low Cost • Standard',
    costTier: '$$',
    costLabel: 'Low Cost ($$)',
    speedRating: 'Fast',
    tagline: 'Standard economical production release for daily inspections',
    description: 'Cost-effective baseline flash model with stable general visual screening.',
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    badge: 'Moderate • High Precision',
    costTier: '$$$',
    costLabel: 'Moderate ($$$)',
    speedRating: 'Fast',
    tagline: 'Enhanced visual precision and spatial object detection',
    description: 'Moderate cost tier. Excels in machine guarding, complex rigging, and isolation checks.',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Most Expensive • Deep Reasoning',
    costTier: '$$$$',
    costLabel: 'Most Expensive ($$$$)',
    speedRating: 'Deep Reasoning',
    tagline: 'Deepest multi-step reasoning and comprehensive audit logic',
    description: 'Premium tier. Employs extended reasoning tokens for complex incident-level audits.',
  },
];
