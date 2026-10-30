/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type { Request, Response } from 'express';
import type { EHSAssessmentResponse, EHSHazardFinding } from '../src/types/safety.ts';

const SYSTEM_INSTRUCTION = `You are a certified senior EHS professional and inspector evaluating workplace photographs for Global Repair Operations.
Your inspection logic is strictly governed by the Employee Environmental, Health, and Safety Handbook – Global Repair Operations.

The application is an EHS visual screening and awareness tool.
CRITICAL SAFETY BOUNDARY:
- You MUST NOT claim that a workplace, activity, employee, or piece of equipment is "safe", "compliant", "certified", or free from hazards merely because no hazards were detected in a photograph.
- Many requirements (permits, training, atmospheric monitoring, equipment ratings, zero-energy LOTO verification, SDS review, authorization) CANNOT be verified from a photograph.
- NEVER invent hazards merely to produce findings.
- Do NOT identify individuals, perform facial recognition, or infer personal demographic/medical attributes.
- Do NOT guess unknown chemicals or gas cylinder contents purely from container colors ("Unknown liquid/material").
- Do NOT estimate exact load weights, crane capacities, decibel levels, or exact heights unless clearly documented signage is readable in the photo.
- Use prudent qualifying language: "appears to", "potential", "visually observed", "cannot be confirmed from this photograph", "verify".

==================================================
LIFESAVING RULES (HIGHEST PRIORITY)
==================================================
1. LOCKOUT / TAGOUT (LOTO):
   - Signs of maintenance/servicing on machinery where hazardous energy may not be controlled.
   - Crucial rule: A photo cannot confirm whether zero energy was verified or isolation performed.
   - Standard statement: "LOTO status cannot be confirmed from the image. Verify isolation and zero-energy state before work."
   - Never declare "LOTO violation" solely because a lock is not visible.

2. WORKING AT HEIGHTS:
   - Elevated walking/working surfaces >= 4 ft (1.2m) with unprotected sides/edges, missing guardrails, unsafe ladders, dropped object hazards.
   - Standard statement if uncertain: "Potential working-at-height exposure. Verify height and required fall protection."

3. MACHINE GUARDING:
   - Exposed rotating components (belts, pulleys, shafts, chains, sprockets), missing/removed guards, loose clothing/hair/gloves near rotating equipment creating entanglement risk.

4. SUSPENDED LOADS:
   - Personnel standing, walking, driving, or working beneath suspended loads, or in load travel/swing paths.
   - A person visibly beneath a suspended load is CRITICAL / STOP WORK.

5. CONFINED SPACES:
   - Tanks, vessels, pits, manholes, pipes, ovens, restricted-entry spaces.
   - Standard statement: "Possible confined-space activity detected. Verify authorization, entry permit, atmospheric monitoring and applicable confined-space controls."

==================================================
OTHER CORE HANDBOOK DISCIPLINES
==================================================
- HOUSEKEEPING / 5S: Slippery floors, oil/liquid spills, waste, clutter, cords/hoses/pallets in designated walkways, unstable stacking.
- PPE: Shop minimum is safety glasses + safety footwear + full pants. Task-specific: grinding face shield, welding hood/shaded lenses, gloves, fall harness. Do not claim missing PPE unless activity requirement is reasonably apparent.
- ROTATING EQUIPMENT: Maintenance with guards off requires LOTO verification.
- MATERIAL HANDLING / CRANES / RIGGING: Off-center lifts, damaged slings, missing barricades, people too close. State: "Verify lifting equipment and rigging capacity for the load."
- MANUAL MATERIAL HANDLING: Handbook individual lift limit is 50 lb / 23 kg. State: "Load weight cannot be determined visually. Verify whether mechanical assistance or a two-person lift is required."
- FORKLIFT / MOBILE EQUIPMENT: Pedestrians in travel path, riders in unapproved spots, operator seatbelt, obstructed view.
- LADDERS / SCAFFOLDS / AERIAL LIFTS: Unsecured ladders, improper footing, standing on top rung, lean outside rails, unlatched aerial lift gate.
- HOT WORK: Sparks near combustibles, missing welding screen/fire watch/extinguisher. State: "Verify required hot-work controls, fire watch and readily available fire-extinguishing equipment."
- GAS CYLINDERS: Unsecured, missing valve caps, fuel gas and oxygen stored together without barrier, cylinders in traffic paths.
- GRINDERS & POWER TOOLS: Missing wheel guard, excessive work-rest gap (>1/8 inch / 3mm), damaged cords, cords over sharp edges, compressed air cleaning above 30 psi limit or without eye protection.
- CHEMICAL SAFETY: Unlabeled/open containers, chemicals near heat, blocked eyewash/shower. If unknown: "Unknown liquid/material".
- FLAMMABLES: Open cans, oily rags not in approved self-closing metal cans.
- FIRE / EMERGENCY ACCESS: Blocked fire extinguishers, blocked exit doors or aisles.
- ENVIRONMENTAL: Any oil/chemical/waste spill, leaking drum, storm drain exposure. Remind that all environmental spills must be reported regardless of quantity.
- INDUSTRIAL HYGIENE: Visible dust plume, welding smoke in breathing zone. State: "Potential exposure identified. Actual exposure level cannot be determined visually; verify applicable industrial-hygiene assessment/monitoring."
- LINE OF FIRE / BODY POSITIONING: Workers between moving/stationary objects, under loads, in pinch points, in cutting direction.
- BARRICADING: Inadequate exclusion zones around lifting, hot work, height work, or chemical cleaning.
- MOBILE PHONES: Prohibited while walking through shop floor or operating equipment.

==================================================
HIERARCHY OF CONTROLS
==================================================
Every recommended action must strictly follow:
1. Elimination
2. Substitution
3. Engineering controls
4. Administrative controls
5. PPE
Do not jump straight to PPE. Recommend eliminating or guarding the hazard at the source first.

==================================================
STOP WORK LOGIC
==================================================
If an imminent or severe life-threatening hazard is visible (e.g. person under suspended load, worker entering confined space without verified controls, unguarded nip point with worker reaching in, extreme fall exposure):
- Set "stopWorkRecommended": true
- Set hazard "actionPriority": "STOP WORK"
- Phrase uncertain cases as: "Potential serious hazard — Stop Work and verify controls before proceeding."

==================================================
OBSERVATION VS INFERENCE (MANDATORY STRUCTURE)
==================================================
For each finding, clearly isolate:
- observation: Exact factual visual observations ("OBSERVED: ...")
- potentialConsequence: Risk outcome if uncontrolled ("POTENTIAL HAZARD: ...")
- recommendedAction: Corrective measure following hierarchy of controls
- If controls cannot be visually verified, clearly state in observation/requiresHumanVerification ("REQUIRES VERIFICATION: ...")

==================================================
NORMALIZED BOUNDING BOXES FOR VISUAL INDICATORS
==================================================
For each visually observed hazard, condition, or activity, specify the normalized bounding box enclosing the specific object, equipment component, spill, or person ({ "x": min_x, "y": min_y, "width": width, "height": height } ranging from 0.0 to 1.0).
This allows the inspection UI to draw targeted circles and directional pointer arrows directly pointing to the exact observed condition in the photo.
If the finding is an overall ambient condition that cannot be localized, set "boundingBox": null.

==================================================
NO HAZARDS FOUND
==================================================
If no credible hazards are observed, return:
- overallRiskLevel: "Low"
- summary: "No obvious EHS hazards were identified from this image."
- hazards: []
- limitations: Include: "This does not confirm that the workplace or activity is safe or compliant. Some hazards and controls cannot be identified from a photograph. Complete the required workplace inspection and follow applicable procedures."
NEVER return "Area is Safe", "100% Compliant", or "Safety Check Passed".`;

export default async function analyzeSafetyHandler(req: Request, res: Response) {
  // Check API key configuration
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Gemini API key not configured',
      message: 'GEMINI_API_KEY is missing in server environment variables.',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { image, mimeType = 'image/jpeg', model: requestedModel } = req.body || {};

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        error: 'Missing image payload',
        message: 'A base64-encoded image string is required.',
      });
    }

    const ALLOWED_MODELS = [
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-3.8-flash',
    ];

    const targetModel =
      requestedModel && ALLOWED_MODELS.includes(requestedModel)
        ? requestedModel
        : 'gemini-3.1-flash-lite';

    let cleanMime = mimeType ? mimeType.toLowerCase() : 'image/jpeg';
    let base64Data = '';

    // Handle data URL prefixes robustly (including base64 and urlencoded)
    if (image.startsWith('data:')) {
      const commaIdx = image.indexOf(',');
      if (commaIdx !== -1) {
        const header = image.slice(0, commaIdx);
        const dataPart = image.slice(commaIdx + 1);

        if (header.includes('image/png')) cleanMime = 'image/png';
        else if (header.includes('image/webp')) cleanMime = 'image/webp';
        else cleanMime = 'image/jpeg';

        if (header.includes(';base64')) {
          base64Data = dataPart.trim();
        } else {
          base64Data = Buffer.from(decodeURIComponent(dataPart)).toString('base64');
        }
      } else {
        base64Data = image.trim();
      }
    } else {
      base64Data = image.trim();
    }

    // Validate size limit (approx 20MB base64)
    if (base64Data.length > 28 * 1024 * 1024) {
      return res.status(413).json({
        error: 'Payload too large',
        message: 'Image size exceeds the 20MB processing threshold.',
      });
    }

    // Initialize Gemini SDK with User-Agent telemetry
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `Conduct a comprehensive, structured visual EHS workplace inspection of this photograph.
Follow all handbook rules, prioritize Lifesaving Rules, differentiate visual observation from inference, identify non-visual controls requiring human verification, assign bounding boxes where visible, apply the hierarchy of controls, and determine if STOP WORK is required.`;

    const imagePart = {
      inlineData: {
        mimeType: cleanMime.includes('png')
          ? 'image/png'
          : cleanMime.includes('webp')
            ? 'image/webp'
            : 'image/jpeg',
        data: base64Data,
      },
    };

    const textPart = {
      text: promptText,
    };

    const modelConfig = {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallRiskLevel: {
            type: Type.STRING,
            description: 'Overall risk rating: Critical, High, Medium, or Low',
          },
          summary: {
            type: Type.STRING,
            description: 'Executive EHS screening summary of observed conditions',
          },
          lifesavingRuleAlert: {
            type: Type.BOOLEAN,
            description: 'Whether any Lifesaving Rule is potentially implicated',
          },
          stopWorkRecommended: {
            type: Type.BOOLEAN,
            description: 'Whether work must be halted immediately for verification',
          },
          hazards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                category: { type: Type.STRING },
                handbookSection: { type: Type.STRING },
                lifesavingRule: { type: Type.BOOLEAN },
                hazard: { type: Type.STRING },
                observation: {
                  type: Type.STRING,
                  description: 'Factually observed visual details (OBSERVED: ...)',
                },
                potentialConsequence: {
                  type: Type.STRING,
                  description: 'Potential consequence if unaddressed (POTENTIAL HAZARD: ...)',
                },
                riskLevel: {
                  type: Type.STRING,
                  description: 'Critical, High, Medium, or Low',
                },
                actionPriority: {
                  type: Type.STRING,
                  description: 'STOP WORK, Immediate, Correct Soon, or Monitor / Verify',
                },
                recommendedAction: { type: Type.STRING },
                controlType: {
                  type: Type.STRING,
                  description:
                    'Elimination, Substitution, Engineering, Administrative, PPE, or Combination',
                },
                confidence: {
                  type: Type.STRING,
                  description: 'High, Medium, or Low',
                },
                location: {
                  type: Type.STRING,
                  description: 'Visual description of where hazard is located in the image',
                },
                boundingBox: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER, description: 'Normalized x min (0.0 to 1.0)' },
                    y: { type: Type.NUMBER, description: 'Normalized y min (0.0 to 1.0)' },
                    width: { type: Type.NUMBER, description: 'Normalized width (0.0 to 1.0)' },
                    height: { type: Type.NUMBER, description: 'Normalized height (0.0 to 1.0)' },
                  },
                  nullable: true,
                },
                requiresHumanVerification: { type: Type.BOOLEAN },
              },
              required: [
                'id',
                'category',
                'handbookSection',
                'lifesavingRule',
                'hazard',
                'observation',
                'potentialConsequence',
                'riskLevel',
                'actionPriority',
                'recommendedAction',
                'controlType',
                'confidence',
                'location',
                'requiresHumanVerification',
              ],
            },
          },
          safetyReminders: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          humanVerificationItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          limitations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'overallRiskLevel',
          'summary',
          'lifesavingRuleAlert',
          'stopWorkRecommended',
          'hazards',
          'safetyReminders',
          'humanVerificationItems',
          'limitations',
        ],
      },
    };

    let rawText: string | undefined;
    let modelUsed = targetModel;

    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: { parts: [imagePart, textPart] },
        config: modelConfig,
      });
      rawText = response.text;
    } catch (primaryErr: unknown) {
      console.warn(
        `Selected model ${targetModel} error or rate-limited; trying fallback:`,
        primaryErr instanceof Error ? primaryErr.message : primaryErr
      );
      // If user selected a model other than flash-lite, try flash-lite as resilient fallback
      const fallbackTarget =
        targetModel === 'gemini-3.1-flash-lite' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite';

      const fallbackResponse = await ai.models.generateContent({
        model: fallbackTarget,
        contents: { parts: [imagePart, textPart] },
        config: modelConfig,
      });
      rawText = fallbackResponse.text;
      modelUsed = fallbackTarget;
    }

    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }

    let parsed: EHSAssessmentResponse;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error('Malformed JSON received from Gemini.');
    }

    // Server-side validation and sanitization
    const sanitized = sanitizeEHSResponse(parsed);
    sanitized.modelUsed = modelUsed;

    return res.status(200).json(sanitized);
  } catch (error: unknown) {
    console.error('EHS Analysis error:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({
      error: 'Safety analysis could not be completed. Please try again.',
      details: errMessage,
    });
  }
}

/**
 * Normalizes and sanitizes Gemini output to guarantee strict client conformance.
 */
function sanitizeEHSResponse(data: Partial<EHSAssessmentResponse>): EHSAssessmentResponse {
  const validRisk = ['Critical', 'High', 'Medium', 'Low'];
  const validPriority = ['STOP WORK', 'Immediate', 'Correct Soon', 'Monitor / Verify'];
  const validControl = [
    'Elimination',
    'Substitution',
    'Engineering',
    'Administrative',
    'PPE',
    'Combination',
  ];

  const overallRisk = validRisk.includes(data.overallRiskLevel || '')
    ? (data.overallRiskLevel as EHSAssessmentResponse['overallRiskLevel'])
    : 'Medium';

  const rawHazards = Array.isArray(data.hazards) ? data.hazards : [];
  const sanitizedHazards: EHSHazardFinding[] = rawHazards.map((h, index) => {
    // Validate bounding box bounds from various model output formats
    let bbox = null;
    const rawBox = h.boundingBox as any;
    if (rawBox) {
      let x = 0;
      let y = 0;
      let width = 0.2;
      let height = 0.2;

      if (typeof rawBox.x === 'number' && typeof rawBox.y === 'number') {
        x = rawBox.x;
        y = rawBox.y;
        width = typeof rawBox.width === 'number' ? rawBox.width : 0.2;
        height = typeof rawBox.height === 'number' ? rawBox.height : 0.2;
      } else if (typeof rawBox.ymin === 'number' && typeof rawBox.xmin === 'number') {
        // [ymin, xmin, ymax, xmax] standard Gemini detection
        y = rawBox.ymin > 1 ? rawBox.ymin / 1000 : rawBox.ymin;
        x = rawBox.xmin > 1 ? rawBox.xmin / 1000 : rawBox.xmin;
        const ymax = rawBox.ymax > 1 ? rawBox.ymax / 1000 : rawBox.ymax;
        const xmax = rawBox.xmax > 1 ? rawBox.xmax / 1000 : rawBox.xmax;
        width = Math.max(0.05, xmax - x);
        height = Math.max(0.05, ymax - y);
      } else if (Array.isArray(rawBox) && rawBox.length === 4) {
        // [ymin, xmin, ymax, xmax] as array
        y = rawBox[0] > 1 ? rawBox[0] / 1000 : rawBox[0];
        x = rawBox[1] > 1 ? rawBox[1] / 1000 : rawBox[1];
        const ymax = rawBox[2] > 1 ? rawBox[2] / 1000 : rawBox[2];
        const xmax = rawBox[3] > 1 ? rawBox[3] / 1000 : rawBox[3];
        width = Math.max(0.05, xmax - x);
        height = Math.max(0.05, ymax - y);
      }

      // Normalize if model returned 0-1000 integers
      if (x > 1) x = x / 1000;
      if (y > 1) y = y / 1000;
      if (width > 1) width = width / 1000;
      if (height > 1) height = height / 1000;

      const clampedX = Math.max(0, Math.min(0.9, x));
      const clampedY = Math.max(0, Math.min(0.9, y));
      const clampedW = Math.max(0.05, Math.min(1 - clampedX, width));
      const clampedH = Math.max(0.05, Math.min(1 - clampedY, height));
      bbox = { x: clampedX, y: clampedY, width: clampedW, height: clampedH };
    }

    return {
      id: typeof h.id === 'number' ? h.id : index + 1,
      category: h.category || 'General Workplace Safety',
      handbookSection: h.handbookSection || 'General EHS Handbook Standards',
      lifesavingRule: Boolean(h.lifesavingRule),
      hazard: h.hazard || 'Unspecified observable condition',
      observation: h.observation || 'Observed condition in photograph.',
      potentialConsequence: h.potentialConsequence || 'Potential risk of workplace incident or injury.',
      riskLevel: (validRisk.includes(h.riskLevel) ? h.riskLevel : 'Medium') as EHSHazardFinding['riskLevel'],
      actionPriority: (validPriority.includes(h.actionPriority)
        ? h.actionPriority
        : 'Immediate') as EHSHazardFinding['actionPriority'],
      recommendedAction:
        h.recommendedAction || 'Inspect condition and apply required controls per EHS procedure.',
      controlType: (validControl.includes(h.controlType)
        ? h.controlType
        : 'Engineering') as EHSHazardFinding['controlType'],
      confidence: (['High', 'Medium', 'Low'].includes(h.confidence)
        ? h.confidence
        : 'Medium') as EHSHazardFinding['confidence'],
      location: h.location || 'Within work area',
      boundingBox: bbox,
      requiresHumanVerification: Boolean(h.requiresHumanVerification),
    };
  });

  const stopWork =
    Boolean(data.stopWorkRecommended) ||
    sanitizedHazards.some(
      (h) => h.riskLevel === 'Critical' || h.actionPriority === 'STOP WORK'
    );

  const lifesavingAlert =
    Boolean(data.lifesavingRuleAlert) || sanitizedHazards.some((h) => h.lifesavingRule);

  // If no hazards found, enforce mandatory standard EHS phrasing
  let summary = data.summary || '';
  const limitations = Array.isArray(data.limitations) ? [...data.limitations] : [];

  if (sanitizedHazards.length === 0) {
    summary = 'No obvious EHS hazards were identified from this image.';
    const mandatoryNotice =
      'This does not confirm that the workplace or activity is safe or compliant. Some hazards and controls cannot be identified from a photograph. Complete the required workplace inspection and follow applicable procedures.';
    if (!limitations.includes(mandatoryNotice)) {
      limitations.unshift(mandatoryNotice);
    }
  }

  return {
    overallRiskLevel: overallRisk,
    summary,
    lifesavingRuleAlert: lifesavingAlert,
    stopWorkRecommended: stopWork,
    hazards: sanitizedHazards,
    safetyReminders: Array.isArray(data.safetyReminders) ? data.safetyReminders : [],
    humanVerificationItems: Array.isArray(data.humanVerificationItems)
      ? data.humanVerificationItems
      : [
          'Verify Lockout/Tagout (LOTO) isolation and zero-energy verification prior to intervention',
          'Review Pre-Job Risk Assessment (PJRA) or Job Hazard Analysis (JHA)',
          'Confirm equipment ratings, lifting gear certifications, and daily pre-use inspections',
          'Verify task permits (Hot Work, Confined Space Entry, Working at Heights)',
        ],
    limitations:
      limitations.length > 0
        ? limitations
        : [
            'Photographs cannot confirm zero-energy verification, permits, SDS compliance, or operator certifications.',
            'Atmospheric testing, load weights, and noise levels cannot be measured visually.',
            'Always perform on-site visual and procedural checks before commencing work.',
          ],
  };
}
