# EHS Safety Vision — Global Repair Operations

**AI-Assisted Workplace Visual Hazard Inspection & Screening Tool**

*EHS Safety Vision* is an industrial visual inspection application designed for employees, supervisors, repair engineers, and EHS professionals across **Global Repair Operations** service facilities, repair centers, workshops, and job sites. It uses multimodal Gemini models to evaluate workplace photographs against the company's **Employee Environmental, Health, and Safety Handbook** and its **5 Lifesaving Rules**.

---

## 1. Install Dependencies

Ensure Node.js (v18+) is installed on your workstation.

```bash
npm install
```

---

## 2. Run Locally

Start the full-stack development server (Express server mounting Vite middlewares and `/api/analyze-safety`):

```bash
npm run dev
```

The application will be live at:
```
http://localhost:3000
```

---

## 3. Configure Gemini

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

> **Security Guardrail:** The frontend client **never** accesses `process.env.GEMINI_API_KEY`. All multimodal Gemini requests pass through the server-side endpoint `/api/analyze-safety`.

---

## 4. Configure `GEMINI_API_KEY` in Vercel

When deploying to Vercel:

1. Open your project on [Vercel Dashboard](https://vercel.com).
2. Navigate to **Settings > Environment Variables**.
3. Add a new variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** `<Your Google Gemini API Key>`
   - **Environments:** Production, Preview, Development.
4. Click **Save**. The serverless function `/api/analyze-safety` will automatically access `process.env.GEMINI_API_KEY` during execution.

---

## 5. Deploy to Vercel

You can deploy directly using the Vercel CLI or Git integration:

### Via Vercel CLI:
```bash
npm i -g vercel
vercel
```

For production deployment:
```bash
vercel --prod
```

The repository includes `/api/analyze-safety.ts` which Vercel automatically deploys as a serverless function alongside the Vite static build.

---

## 6. How to Test Image Analysis

1. **Use Phone/Tablet Camera:**
   - Tap **"Take Photo (Camera)"** on any mobile device or tablet to capture direct shop-floor photos with rear-facing camera (`capture="environment"`).
2. **Upload Existing Photos:**
   - Tap **"Upload from Device"** or drag-and-drop any JPG, JPEG, PNG, or WebP photo of a workshop, crane bay, grinding bench, or storage yard.
3. **Use Pre-Configured Workshop Scenarios:**
   - On desktop, click any of the 5 built-in benchmark scenarios:
     - *Scenario A:* Overhead Crane Suspended Load Over Walkway (Triggers Lifesaving Rule 4 & STOP WORK).
     - *Scenario B:* Pedestal Grinder Missing Guard & Floor Oil Spill (Triggers Lifesaving Rule 3 & 5S).
     - *Scenario C:* Working at Heights — Unsecured Stepladder on Pallet (Triggers Lifesaving Rule 2).
     - *Scenario D:* Chemical Storage & Blocked Emergency Eyewash Station (HazCom & Egress).
     - *Scenario E:* 5S Workshop Benchmark (Zero visible hazards — tests mandatory compliance caveat).
4. **Trigger Inspection:**
   - Click the prominent **"Analyze EHS Risks"** button (photos are never sent automatically without explicit user confirmation).
5. **Review Results:**
   - **Visual Hazard Markers:** Click any numbered pin on the photo to scroll to and highlight its hazard card, or click a hazard card to highlight the photo region.
   - **STOP WORK Banner:** Displayed immediately if imminent life-critical hazards are found.
   - **Observation vs. Inference:** Review factual visual evidence vs. potential risk consequences.
   - **Human Verification Checklist:** Check off physical controls (LOTO zero energy, permits, JHA).
   - **Print / PDF:** Click **"Print / Save PDF Report"** for field shift handover.

---

## 7. Important Limitations of AI Visual EHS Inspection

This application is an **awareness and screening tool**, not a replacement for qualified human safety oversight:

1. **Absence of Evidence Is Not Evidence of Safety:**
   - When no hazards are detected, the app displays: *"No obvious EHS hazards were identified from this image. This does not confirm that the workplace or activity is safe or compliant."*
   - Never treat a photo scan as certification that an area is "100% compliant" or "certified safe."
2. **Non-Visual Requirements Cannot Be Confirmed:**
   - Photographs cannot verify Lockout/Tagout (LOTO) zero-energy states, active permits (Hot Work, Confined Space Entry, Working at Heights), operator certifications, atmospheric air quality readings, SDS reviews, or pre-job risk assessments (PJRA).
3. **No Biometric Identification:**
   - The inspection engine does not identify individuals, perform facial recognition, or deduce demographic or medical attributes.
4. **Unknown Substances & Pressures:**
   - Chemical names cannot be inferred purely from container colors ("Unknown liquid/material").
   - Compressed air line pressures, crane capacities, and decibel levels cannot be reliably estimated without legible certified signage in the frame.
5. **Ephemeral Processing:**
   - Images are processed in temporary server memory and are not permanently retained.
