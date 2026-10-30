/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ActionPriority = 'STOP WORK' | 'Immediate' | 'Correct Soon' | 'Monitor / Verify';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type ControlType =
  | 'Elimination'
  | 'Substitution'
  | 'Engineering'
  | 'Administrative'
  | 'PPE'
  | 'Combination';

export interface BoundingBox {
  x: number; // 0.0 to 1.0 (normalized min x)
  y: number; // 0.0 to 1.0 (normalized min y)
  width: number; // 0.0 to 1.0 (normalized width)
  height: number; // 0.0 to 1.0 (normalized height)
}

export interface EHSHazardFinding {
  id: number;
  category: string;
  handbookSection: string;
  lifesavingRule: boolean;
  hazard: string;
  observation: string;
  potentialConsequence: string;
  riskLevel: RiskLevel;
  actionPriority: ActionPriority;
  recommendedAction: string;
  controlType: ControlType;
  confidence: ConfidenceLevel;
  location: string;
  boundingBox: BoundingBox | null;
  requiresHumanVerification: boolean;
}

export interface EHSAssessmentResponse {
  overallRiskLevel: RiskLevel;
  summary: string;
  lifesavingRuleAlert: boolean;
  stopWorkRecommended: boolean;
  hazards: EHSHazardFinding[];
  safetyReminders: string[];
  humanVerificationItems: string[];
  limitations: string[];
  modelUsed?: string;
}
