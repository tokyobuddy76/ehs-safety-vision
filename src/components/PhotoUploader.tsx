/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Smartphone,
} from 'lucide-react';
import { CameraModal } from './CameraModal.tsx';
import { ModelSelector } from './ModelSelector.tsx';
import { SAMPLE_WORKPLACE_SCENARIOS, type SampleImageScenario } from '../data/sampleImages.ts';

interface PhotoUploaderProps {
  onImageSelected: (base64: string, fileInfo: { name: string; size: string; mimeType: string }) => void;
  selectedImage: string | null;
  fileInfo: { name: string; size: string; mimeType: string } | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onSelectScenario: (scenario: SampleImageScenario) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onImageSelected,
  selectedImage,
  fileInfo,
  onAnalyze,
  isAnalyzing,
  onSelectScenario,
  selectedModel,
  onSelectModel,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

function optimizeImage(
  file: File,
  maxDim = 2048,
  quality = 0.92
): Promise<{ dataUrl: string; sizeFormatted: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            dataUrl: e.target?.result as string,
            sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          });
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeMb = (approxBytes / (1024 * 1024)).toFixed(2);
        resolve({ dataUrl, sizeFormatted: `${sizeMb} MB (Optimized)` });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

  const processFile = async (file: File) => {
    setUploadError(null);

    // Validate type: JPG, JPEG, PNG, WebP
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Please select a JPG, JPEG, PNG, or WebP photo.');
      return;
    }

    try {
      const optimized = await optimizeImage(file, 2048, 0.92);
      onImageSelected(optimized.dataUrl, {
        name: file.name,
        size: optimized.sizeFormatted,
        mimeType: 'image/jpeg',
      });
    } catch {
      // Fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
          onImageSelected(result, {
            name: file.name,
            size: `${sizeMb} MB`,
            mimeType: file.type || 'image/jpeg',
          });
        }
      };
      reader.onerror = () => {
        setUploadError('Failed to read the photograph file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCameraClick = () => {
    // Check if mediaDevices.getUserMedia is available
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setIsCameraModalOpen(true);
    } else {
      // Direct fallback to native device camera input
      cameraInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Camera Viewfinder Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={onImageSelected}
        onFallbackToFilePicker={() => cameraInputRef.current?.click()}
      />

      {/* Prominent Header Banner */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-bold tracking-wide uppercase shadow-xs">
          <Shield className="w-3.5 h-3.5" />
          <span>Workplace Visual EHS Screening</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Take or Upload a Workplace Photo
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Capture or upload an image of a workshop, repair center bay, warehouse, equipment cell, or job site.
          Gemini inspects observable conditions against the EHS Handbook and Lifesaving Rules.
        </p>
      </div>

      {/* Main Upload Dropzone & Action Buttons */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-200 bg-white ${
          isDragging
            ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-slate-400 shadow-sm'
        }`}
      >
        {/* Hidden HTML Inputs */}
        {/* 1. Direct device camera capture for phones/tablets */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/jpeg,image/png,image/webp,image/jpg"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 2. Standard file picker */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Camera className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-slate-900">
              Select Shop Floor Photo for AI Screening
            </p>
            <p className="text-xs text-slate-500">
              Supports live camera viewfinder or JPG, JPEG, PNG, WebP uploads (up to 20MB)
            </p>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs font-semibold text-red-800 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Action Button Row: Phone Camera vs File Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleCameraClick}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] border border-slate-700"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Take Photo (Camera)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 border border-slate-300 shadow-xs transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 text-slate-700" />
              <span>Upload from Device</span>
            </button>
          </div>

          {/* Model Selector in Dropzone */}
          <div className="pt-2">
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={onSelectModel}
              disabled={isAnalyzing}
            />
          </div>
        </div>
      </div>

      {/* Explicit "Analyze EHS Risks" Trigger Button */}
      {selectedImage && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Photo Loaded • Ready for Inspection
                </div>
                <div className="text-base font-bold text-white truncate max-w-md">
                  {fileInfo?.name || 'Selected workplace photo'}
                </div>
                <div className="text-xs text-slate-400">
                  {fileInfo?.size} • Explicit confirmation required below to analyze
                </div>
              </div>
            </div>

            {/* Crucial requirement: Explicit "Analyze EHS Risks" action */}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing EHS Risks...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze EHS Risks</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Model Selector inside active inspection card */}
          <div className="pt-2 border-t border-slate-800">
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={onSelectModel}
              disabled={isAnalyzing}
            />
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Inspection runs against Workplace EHS Handbook & 5 Lifesaving Rules.</span>
          </div>
        </div>
      )}

      {/* Preset Workshop Test Scenarios (Instant Testing for desktop / review) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Or Test With Realistic Workshop Scenarios:
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click to load mock scenario photo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SAMPLE_WORKPLACE_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              disabled={isAnalyzing}
              className="text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-500 hover:shadow-xs transition-all flex flex-col justify-between group disabled:opacity-50"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors">
                    {scenario.category}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  {scenario.title}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-medium text-amber-700">{scenario.expectedAlert}</span>
                <span className="font-bold text-slate-700 group-hover:translate-x-0.5 transition-transform">
                  Load &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
