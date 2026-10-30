/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleImageScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  expectedAlert: string;
  dataUrl: string;
}

// Generate realistic industrial scenario SVGs encoded as data URLs
function createIndustrialSvg(
  badgeText: string,
  sceneDescription: string,
  elements: string,
  primaryColor: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.5" stroke-opacity="0.2"/>
      </pattern>
      <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
      <pattern id="stripes" width="30" height="30" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="30" stroke="#f59e0b" stroke-width="15" />
        <line x1="15" y1="0" x2="15" y2="30" stroke="#0f172a" stroke-width="15" />
      </pattern>
    </defs>

    <!-- Workshop Background -->
    <rect width="900" height="380" fill="url(#wallGrad)"/>
    <rect width="900" height="600" fill="url(#grid)"/>
    <!-- Shop Floor -->
    <polygon points="0,380 900,380 900,600 0,600" fill="url(#floorGrad)"/>
    <!-- Walkway Line -->
    <line x1="0" y1="480" x2="900" y2="480" stroke="#eab308" stroke-width="8" stroke-dasharray="24,16"/>

    <!-- Scene Graphics -->
    ${elements}

    <!-- Top Status Banner -->
    <rect x="0" y="0" width="900" height="50" fill="#090d16" fill-opacity="0.9"/>
    <rect x="16" y="12" width="12" height="26" fill="${primaryColor}"/>
    <text x="36" y="30" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="700" letter-spacing="0.5">FACILITY SURVEILLANCE & SAFETY CAMERA</text>
    <rect x="660" y="10" width="220" height="30" rx="4" fill="${primaryColor}" fill-opacity="0.2" stroke="${primaryColor}" stroke-width="1.5"/>
    <text x="770" y="30" fill="${primaryColor}" font-family="system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle">${badgeText}</text>

    <!-- Bottom Context Card -->
    <rect x="20" y="525" width="860" height="55" rx="6" fill="#0f172a" fill-opacity="0.85" stroke="#334155"/>
    <text x="36" y="550" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="14" font-weight="600">${sceneDescription}</text>
    <text x="36" y="568" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Workplace Visual EHS Inspection Mock Capture • Calibration ISO 9001/45001</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_WORKPLACE_SCENARIOS: SampleImageScenario[] = [
  {
    id: 'suspended-load',
    title: 'Overhead Crane Suspended Load Over Walkway',
    category: 'Lifesaving Rule 4: Suspended Loads',
    description: 'Service Bay 3: Heavy turbine casing suspended on hook with technician walking along the path below.',
    expectedAlert: 'STOP WORK — Person beneath suspended load',
    dataUrl: createIndustrialSvg(
      'LIFESAVING RULE 4 PRIORITY',
      'SCENARIO A: Overhead Crane Bay 3 — Heavy Turbine Rotor Suspended Above Unbarricaded Walkway',
      `
      <!-- Crane Gantry -->
      <rect x="40" y="70" width="820" height="28" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
      <rect x="400" y="98" width="100" height="40" rx="4" fill="#334155"/>
      <line x1="450" y1="138" x2="450" y2="220" stroke="#94a3b8" stroke-width="4"/>
      <!-- Hook & Rotor Load -->
      <path d="M 440,220 C 440,240 460,240 460,225" fill="none" stroke="#f59e0b" stroke-width="6"/>
      <rect x="360" y="240" width="180" height="70" rx="8" fill="#475569" stroke="#64748b" stroke-width="3"/>
      <text x="450" y="280" fill="#f8fafc" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">ROTOR 4.2T</text>
      <!-- Worker Standing Underneath -->
      <circle cx="450" cy="400" r="14" fill="#fbbf24"/>
      <rect x="438" y="414" width="24" height="44" rx="4" fill="#0284c7"/>
      <line x1="442" y1="458" x2="442" y2="500" stroke="#1e293b" stroke-width="6"/>
      <line x1="458" y1="458" x2="458" y2="500" stroke="#1e293b" stroke-width="6"/>
      <line x1="438" y1="424" x2="422" y2="450" stroke="#0284c7" stroke-width="5"/>
      <line x1="462" y1="424" x2="478" y2="450" stroke="#0284c7" stroke-width="5"/>
      <text x="450" y="375" fill="#ef4444" font-family="sans-serif" font-weight="bold" font-size="13" text-anchor="middle">PERSON IN DROP ZONE</text>
      <circle cx="450" cy="385" r="4" fill="#ef4444"/>
      `,
      '#ef4444'
    ),
  },
  {
    id: 'missing-guard-grinder',
    title: 'Pedestal Grinder with Missing Guard & Oil Spill',
    category: 'Lifesaving Rule 3 & Housekeeping',
    description: 'Machining Area: Bench grinder missing tongue guard/spark shield, cord across floor near oil spill.',
    expectedAlert: 'High Priority — Unguarded rotating machinery and slip hazard',
    dataUrl: createIndustrialSvg(
      'MACHINE SAFETY & 5S',
      'SCENARIO B: Machine Shop Grinding Bench — Exposed Abrasive Wheel & Floor Spill Hazard',
      `
      <!-- Workbench -->
      <rect x="240" y="260" width="420" height="150" fill="#334155" stroke="#1e293b" stroke-width="4"/>
      <!-- Grinder Body -->
      <rect x="400" y="200" width="100" height="70" rx="6" fill="#0284c7"/>
      <!-- Left Unguarded Wheel (Rotating) -->
      <circle cx="370" cy="235" r="42" fill="#64748b" stroke="#ef4444" stroke-width="4" stroke-dasharray="8,4"/>
      <text x="370" y="175" fill="#ef4444" font-family="sans-serif" font-weight="bold" font-size="12" text-anchor="middle">NO GUARD / NO REST</text>
      <!-- Right Guarded Wheel -->
      <circle cx="530" cy="235" r="42" fill="#64748b"/>
      <path d="M 500,200 A 48 48 0 1 1 565,260" fill="none" stroke="#eab308" stroke-width="8"/>
      <!-- Oil Spill on Floor -->
      <ellipse cx="500" cy="460" rx="90" ry="24" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
      <text x="500" y="465" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">HYDRAULIC OIL SLICK</text>
      <!-- Extension cord stretching across aisle -->
      <path d="M 450,270 Q 380,360 220,500" fill="none" stroke="#f97316" stroke-width="4"/>
      <text x="310" y="440" fill="#f97316" font-family="sans-serif" font-weight="bold" font-size="11">CORD TRIP HAZARD</text>
      `,
      '#f97316'
    ),
  },
  {
    id: 'unsecured-ladder',
    title: 'Working at Heights — Unsecured Stepladder on Pallet',
    category: 'Lifesaving Rule 2: Working at Heights',
    description: 'Warehouse Bay 7: Worker standing on top step of an A-frame ladder placed precariously on wooden pallets.',
    expectedAlert: 'Critical / High — Unstable ladder footing & height exposure',
    dataUrl: createIndustrialSvg(
      'LIFESAVING RULE 2 ALERT',
      'SCENARIO C: Warehouse Rack Maintenance — Makeshift Height Access & Unstable Footing',
      `
      <!-- Pallet stack on floor -->
      <rect x="360" y="410" width="180" height="30" fill="#b45309" stroke="#78350f" stroke-width="2"/>
      <rect x="370" y="380" width="160" height="30" fill="#b45309" stroke="#78350f" stroke-width="2"/>
      <!-- Ladder placed on pallet -->
      <line x1="410" y1="380" x2="435" y2="150" stroke="#94a3b8" stroke-width="6"/>
      <line x1="490" y1="380" x2="465" y2="150" stroke="#94a3b8" stroke-width="6"/>
      <line x1="415" y1="340" x2="485" y2="340" stroke="#64748b" stroke-width="4"/>
      <line x1="422" y1="290" x2="478" y2="290" stroke="#64748b" stroke-width="4"/>
      <line x1="428" y1="240" x2="472" y2="240" stroke="#64748b" stroke-width="4"/>
      <line x1="432" y1="190" x2="468" y2="190" stroke="#64748b" stroke-width="4"/>
      <!-- Worker leaning from top cap -->
      <circle cx="450" cy="110" r="14" fill="#fbbf24"/>
      <rect x="438" y="124" width="24" height="40" rx="3" fill="#ea580c"/>
      <line x1="442" y1="164" x2="440" y2="195" stroke="#1e293b" stroke-width="5"/>
      <line x1="458" y1="164" x2="460" y2="195" stroke="#1e293b" stroke-width="5"/>
      <text x="450" y="90" fill="#ef4444" font-family="sans-serif" font-weight="bold" font-size="12" text-anchor="middle">STANDING ON TOP CAP (FALL RISK)</text>
      <text x="450" y="455" fill="#ef4444" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">UNAPPROVED BASE (PALLETS)</text>
      `,
      '#ef4444'
    ),
  },
  {
    id: 'chemical-eyewash',
    title: 'Chemical Storage & Blocked Emergency Eyewash',
    category: 'Hazard Communication & Emergency Access',
    description: 'Chemical dispensing room: Unlabeled solvent drums stored adjacent to blocked emergency eyewash station.',
    expectedAlert: 'High Priority — Blocked emergency equipment & unverified chemical containers',
    dataUrl: createIndustrialSvg(
      'EMERGENCY ACCESS & HAZCOM',
      'SCENARIO D: Chemical Dispensing Bay — Drums Stored Directly Obstructing Eyewash Station',
      `
      <!-- Eyewash Station on wall -->
      <rect x="180" y="140" width="80" height="90" fill="#059669" rx="4"/>
      <circle cx="220" cy="180" r="18" fill="#f8fafc"/>
      <text x="220" y="125" fill="#10b981" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">EMERGENCY EYEWASH</text>
      <!-- Pallet of drums blocking path to eyewash -->
      <rect x="150" y="320" width="200" height="150" fill="#334155" stroke="#eab308" stroke-width="3"/>
      <!-- Drum 1 -->
      <rect x="170" y="270" width="65" height="90" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
      <ellipse cx="202" cy="270" rx="32" ry="8" fill="#1d4ed8"/>
      <text x="202" y="320" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">UNLABELED</text>
      <!-- Drum 2 -->
      <rect x="255" y="270" width="65" height="90" rx="6" fill="#991b1b" stroke="#ef4444" stroke-width="2"/>
      <ellipse cx="287" cy="270" rx="32" ry="8" fill="#b91c1c"/>
      <text x="287" y="320" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">SOLVENT</text>
      <!-- Warning tag -->
      <text x="250" y="250" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">ACCESS PATH BLOCKED</text>
      `,
      '#f59e0b'
    ),
  },
  {
    id: 'clean-compliant-shop',
    title: '5S Workshop Workstation (Zero Visible Hazards)',
    category: 'Housekeeping & Visual Organization',
    description: 'Clean electronics repair bench with clear walkways, shadow board tools, and verified PPE.',
    expectedAlert: 'No Obvious Hazards (Testing mandatory EHS compliance disclaimer)',
    dataUrl: createIndustrialSvg(
      '5S BENCHMARK SAMPLE',
      'SCENARIO E: Electronics Repair Cell — Clean Worksurfaces, Demarcated Walkways, Stored Tools',
      `
      <!-- Clean bench -->
      <rect x="200" y="240" width="500" height="180" fill="#334155" stroke="#64748b" stroke-width="2"/>
      <!-- Shadow tool board -->
      <rect x="230" y="110" width="440" height="110" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      <rect x="260" y="130" width="20" height="70" rx="2" fill="#0284c7"/>
      <rect x="300" y="130" width="25" height="50" rx="2" fill="#0284c7"/>
      <rect x="340" y="130" width="20" height="60" rx="2" fill="#0284c7"/>
      <text x="520" y="170" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="bold">SHADOW TOOL BOARD 5S</text>
      <!-- Clear aisle -->
      <rect x="50" y="480" width="800" height="60" fill="url(#stripes)" fill-opacity="0.3"/>
      <text x="450" y="515" fill="#eab308" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">DESIGNATED WALKWAY — CLEAR</text>
      `,
      '#10b981'
    ),
  },
];
