/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  HardHat,
  Search,
  Camera,
  Activity,
  Layers,
  FileText,
  Printer,
  ChevronDown,
  Wrench,
  QrCode,
} from 'lucide-react';
import { PhotoUploader } from './components/PhotoUploader.tsx';
import { ImagePreview } from './components/ImagePreview.tsx';
import { ImageHazardOverlay } from './components/ImageHazardOverlay.tsx';
import { RiskSummary } from './components/RiskSummary.tsx';
import { LifesavingRuleAlert } from './components/LifesavingRuleAlert.tsx';
import { StopWorkAlert } from './components/StopWorkAlert.tsx';
import { HazardCard } from './components/HazardCard.tsx';
import { HumanVerification } from './components/HumanVerification.tsx';
import { SafetyReminders } from './components/SafetyReminders.tsx';
import { Disclaimer } from './components/Disclaimer.tsx';
import { PrivacyBanner } from './components/PrivacyBanner.tsx';
import { NoHazardResult } from './components/NoHazardResult.tsx';
import { PrintReport } from './components/PrintReport.tsx';
import { DiagnosticsModal } from './components/DiagnosticsModal.tsx';
import { ModelSelector } from './components/ModelSelector.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import type { EHSAssessmentResponse, EHSHazardFinding } from './types/safety.ts';
import type { SampleImageScenario } from './data/sampleImages.ts';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; mimeType: string } | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<EHSAssessmentResponse | null>(null);
  const [selectedHazardId, setSelectedHazardId] = useState<number | null>(null);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const handleImageSelected = (
    base64: string,
    info: { name: string; size: string; mimeType: string }
  ) => {
    setSelectedImage(base64);
    setFileInfo(info);
    setAssessment(null);
    setSelectedHazardId(null);
    setError(null);
  };

  const handleSelectScenario = (scenario: SampleImageScenario) => {
    // Render SVG into an off-screen canvas to produce a clean raster PNG for Gemini
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngBase64 = canvas.toDataURL('image/png', 0.95);
        setSelectedImage(pngBase64);
        setFileInfo({
          name: scenario.title,
          size: '0.8 MB (Rendered)',
          mimeType: 'image/png',
        });
      } else {
        setSelectedImage(scenario.dataUrl);
        setFileInfo({
          name: scenario.title,
          size: 'Scenario Vector',
          mimeType: 'image/svg+xml',
        });
      }
      setAssessment(null);
      setSelectedHazardId(null);
      setError(null);
    };
    img.onerror = () => {
      setSelectedImage(scenario.dataUrl);
      setFileInfo({
        name: scenario.title,
        size: 'Scenario Vector',
        mimeType: 'image/svg+xml',
      });
      setAssessment(null);
      setSelectedHazardId(null);
      setError(null);
    };
    img.src = scenario.dataUrl;
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setFileInfo(null);
    setAssessment(null);
    setSelectedHazardId(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-safety', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
          mimeType: fileInfo?.mimeType || 'image/jpeg',
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Server returned ${response.status}`);
      }

      const data: EHSAssessmentResponse = await response.json();
      setAssessment(data);

      // Select first critical or lifesaving hazard if present
      if (data.hazards && data.hazards.length > 0) {
        const priorityHazard =
          data.hazards.find((h) => h.actionPriority === 'STOP WORK' || h.lifesavingRule) ||
          data.hazards[0];
        setSelectedHazardId(priorityHazard.id);
      }
    } catch (err: unknown) {
      console.error('Inspection request failed:', err);
      const details = err instanceof Error ? err.message : 'Unknown communication error';
      setError({
        message: 'Safety analysis could not be completed. Please try again.',
        details,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHazard = (id: number) => {
    setSelectedHazardId(id);
    const element = document.getElementById(`hazard-card-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Filter hazards for display
  const getFilteredHazards = () => {
    if (!assessment) return [];
    if (filter === 'all') return assessment.hazards;
    if (filter === 'lifesaving') return assessment.hazards.filter((h) => h.lifesavingRule);
    return assessment.hazards.filter((h) => h.riskLevel === filter);
  };

  const filteredHazards = getFilteredHazards();

  // Grouped findings by priority
  const criticalStopWorkHazards = assessment?.hazards.filter(
    (h) => h.riskLevel === 'Critical' || h.actionPriority === 'STOP WORK'
  ) || [];

  const highPriorityHazards = assessment?.hazards.filter(
    (h) => h.riskLevel === 'High' && h.actionPriority !== 'STOP WORK'
  ) || [];

  const otherObservations = assessment?.hazards.filter(
    (h) => h.riskLevel === 'Medium' || h.riskLevel === 'Low'
  ) || [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-amber-400 selection:text-slate-950 pb-16">
      {/* Top Industrial Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b-2 border-amber-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-black shadow-xs flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight uppercase text-white">
                  EHS Safety Vision
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 hidden sm:inline">
                  WORKPLACE SAFETY
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Workplace Visual Hazard Screening • EHS Handbook Principles
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {assessment && (
              <button
                onClick={handleRemoveImage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Inspection</span>
              </button>
            )}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300 transition-colors"
              title="Mobile QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <button
              onClick={() => setIsDiagnosticsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300 transition-colors"
              title="Run System Diagnostics & Troubleshoot"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Troubleshoot</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Engine Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Diagnostics & Troubleshooter Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Pre-Inspection Mode: Photo Uploader & Preview */}
        {!assessment && (
          <div className="space-y-6">
            <PrivacyBanner />

            {selectedImage ? (
              <div className="space-y-6">
                <ImagePreview
                  imageSrc={selectedImage}
                  fileName={fileInfo?.name}
                  fileSize={fileInfo?.size}
                  onReplace={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/jpeg,image/png,image/webp,image/jpg';
                    input.onchange = (e: Event) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            handleImageSelected(ev.target.result as string, {
                              name: file.name,
                              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                              mimeType: file.type || 'image/jpeg',
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  onRemove={handleRemoveImage}
                  isAnalyzing={isAnalyzing}
                />

                {/* Explicit "Analyze EHS Risks" Banner */}
                <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                        Ready for Evaluation
                      </div>
                      <div className="text-lg font-black text-white">
                        Inspect Workplace for Hazards & Lifesaving Rules
                      </div>
                      <div className="text-xs text-slate-400">
                        Evaluates 5 Lifesaving Rules, Housekeeping, PPE, Machine Guarding, Rigging & More
                      </div>
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Analyzing EHS Risks...</span>
                        </>
                      ) : (
                        <>
                          <HardHat className="w-4 h-4" />
                          <span>Analyze EHS Risks</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Model Selector in Preview Card */}
                  <div className="pt-2 border-t border-slate-700/80">
                    <ModelSelector
                      selectedModel={selectedModel}
                      onSelectModel={setSelectedModel}
                      disabled={isAnalyzing}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <PhotoUploader
                onImageSelected={handleImageSelected}
                selectedImage={selectedImage}
                fileInfo={fileInfo}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                onSelectScenario={handleSelectScenario}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
              />
            )}
          </div>
        )}

        {/* Loading Spinner State */}
        {isAnalyzing && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-md space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto animate-bounce shadow-md">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Scanning Photograph Against EHS Standards...
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Applying workplace EHS handbook logic, inspecting for Lifesaving Rule exposures,
                calculating bounding boxes, and structuring observations vs. non-visual verifications.
              </p>
            </div>
            <div className="w-48 h-2 bg-slate-100 rounded-full mx-auto overflow-hidden border border-slate-200">
              <div className="bg-amber-500 h-full w-2/3 animate-pulse" />
            </div>
          </div>
        )}

        {/* Error Handling State with Retry */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-md max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-red-950">{error.message}</h3>
              {error.details && (
                <p className="text-xs text-red-800 font-mono bg-red-100/60 p-2 rounded max-w-lg mx-auto">
                  {error.details}
                </p>
              )}
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleAnalyze}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Inspection</span>
              </button>
              <button
                onClick={() => setIsDiagnosticsOpen(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Run System Diagnostics</span>
              </button>
              <button
                onClick={handleRemoveImage}
                className="px-4 py-2.5 bg-white border border-red-300 text-red-900 hover:bg-red-100/60 rounded-xl font-bold text-xs transition-all"
              >
                Upload Different Photo
              </button>
            </div>
          </div>
        )}

        {/* Assessment Results Dashboard */}
        {assessment && selectedImage && !isAnalyzing && (
          <div className="space-y-6">
            {/* Print & Share Bar */}
            <PrintReport assessment={assessment} imageSrc={selectedImage} />

            {/* Risk Summary KPI Metrics */}
            <RiskSummary
              assessment={assessment}
              selectedFilter={filter}
              onFilterChange={setFilter}
            />

            {/* Interactive Image Hazard Map Overlay */}
            <ImageHazardOverlay
              imageSrc={selectedImage}
              hazards={assessment.hazards}
              selectedHazardId={selectedHazardId}
              onSelectHazard={handleSelectHazard}
            />

            {/* STOP WORK Alert Banner if Imminent / Critical Condition */}
            {(assessment.stopWorkRecommended || criticalStopWorkHazards.length > 0) && (
              <StopWorkAlert
                hazards={assessment.hazards}
                onSelectHazard={handleSelectHazard}
              />
            )}

            {/* Lifesaving Rules Alert Box */}
            {assessment.lifesavingRuleAlert && (
              <LifesavingRuleAlert
                hazards={assessment.hazards}
                onSelectHazard={handleSelectHazard}
              />
            )}

            {/* If No Hazards Were Detected: Strict Compliant Presentation */}
            {assessment.hazards.length === 0 ? (
              <NoHazardResult />
            ) : (
              /* Grouped Findings Section */
              <div className="space-y-6">
                {/* 1. Critical / STOP WORK Group */}
                {criticalStopWorkHazards.length > 0 && filter === 'all' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-red-200 pb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                      <h3 className="text-base font-black uppercase tracking-wider text-red-950">
                        CRITICAL / STOP WORK FINDINGS ({criticalStopWorkHazards.length})
                      </h3>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {criticalStopWorkHazards.map((hazard) => (
                        <HazardCard
                          key={hazard.id}
                          hazard={hazard}
                          isSelected={selectedHazardId === hazard.id}
                          onSelect={handleSelectHazard}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. High Priority Group */}
                {highPriorityHazards.length > 0 && filter === 'all' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                      <h3 className="text-base font-black uppercase tracking-wider text-orange-950">
                        HIGH PRIORITY FINDINGS ({highPriorityHazards.length})
                      </h3>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {highPriorityHazards.map((hazard) => (
                        <HazardCard
                          key={hazard.id}
                          hazard={hazard}
                          isSelected={selectedHazardId === hazard.id}
                          onSelect={handleSelectHazard}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Other Observations (Medium & Low) */}
                {otherObservations.length > 0 && filter === 'all' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                      <h3 className="text-base font-black uppercase tracking-wider text-slate-800">
                        OTHER OBSERVATIONS & HOUSEKEEPING ({otherObservations.length})
                      </h3>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {otherObservations.map((hazard) => (
                        <HazardCard
                          key={hazard.id}
                          hazard={hazard}
                          isSelected={selectedHazardId === hazard.id}
                          onSelect={handleSelectHazard}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Filtered View (if user selected a specific filter tab) */}
                {filter !== 'all' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="text-base font-black uppercase tracking-wider text-slate-800">
                        Filter: {filter.toUpperCase()} ({filteredHazards.length})
                      </h3>
                      <button
                        onClick={() => setFilter('all')}
                        className="text-xs text-amber-600 font-bold hover:underline"
                      >
                        Reset Filter
                      </button>
                    </div>
                    {filteredHazards.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-xl border text-slate-500 text-sm">
                        No findings match the selected filter.
                      </div>
                    ) : (
                      <div className="grid gap-4 lg:grid-cols-2">
                        {filteredHazards.map((hazard) => (
                          <HazardCard
                            key={hazard.id}
                            hazard={hazard}
                            isSelected={selectedHazardId === hazard.id}
                            onSelect={handleSelectHazard}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Human Verification Checklist */}
            <HumanVerification items={assessment.humanVerificationItems} />

            {/* Safety Reminders & Standards */}
            <SafetyReminders reminders={assessment.safetyReminders} />

            {/* Action Bar at bottom of Results */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">
                Inspection completed. Conduct required physical verification with area supervisor.
              </span>
              <button
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Inspect Another Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Pinned Disclaimer on Every Page */}
        <Disclaimer />
      </main>
    </div>
  );
}
