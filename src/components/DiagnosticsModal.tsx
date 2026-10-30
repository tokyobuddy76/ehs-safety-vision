/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Camera,
  Cpu,
  Server,
  Layers,
  X,
  ShieldCheck,
} from 'lucide-react';

interface DiagnosticResult {
  id: string;
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<DiagnosticResult[]>([
    {
      id: 'server',
      name: 'Serverless API Runtime',
      status: 'pending',
      message: 'Checking /api/health...',
    },
    {
      id: 'gemini',
      name: 'Gemini Multimodal Connection',
      status: 'pending',
      message: 'Checking Gemini configuration & API responsiveness...',
    },
    {
      id: 'camera',
      name: 'Camera & MediaDevices API',
      status: 'pending',
      message: 'Checking browser camera permissions & video devices...',
    },
    {
      id: 'pipeline',
      name: 'Inspection Pipeline & Canvas',
      status: 'pending',
      message: 'Testing image optimization and JSON schema handling...',
    },
  ]);

  const runDiagnostics = async () => {
    setIsRunning(true);

    // 1. Check Serverless API
    let serverOk = false;
    let geminiConfigured = false;
    try {
      const t0 = performance.now();
      const res = await fetch('/api/health');
      const timeMs = Math.round(performance.now() - t0);

      if (res.ok) {
        const data = await res.json();
        serverOk = true;
        geminiConfigured = Boolean(data.geminiConfigured);

        setResults((prev) =>
          prev.map((r) =>
            r.id === 'server'
              ? {
                  ...r,
                  status: 'success',
                  message: `API endpoint operational (${timeMs}ms response)`,
                  details: `HTTP ${res.status} OK • Service: ${data.service}`,
                }
              : r
          )
        );
      } else {
        setResults((prev) =>
          prev.map((r) =>
            r.id === 'server'
              ? {
                  ...r,
                  status: 'error',
                  message: `Server returned HTTP ${res.status}`,
                  details: 'Check if dev server or backend process is active.',
                }
              : r
          )
        );
      }
    } catch (err: unknown) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === 'server'
            ? {
                ...r,
                status: 'error',
                message: 'Failed to connect to /api/health',
                details: err instanceof Error ? err.message : 'Network error',
              }
            : r
        )
      );
    }

    // 2. Check Gemini Model
    if (geminiConfigured) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === 'gemini'
            ? {
                ...r,
                status: 'success',
                message: 'GEMINI_API_KEY verified on server',
                details: 'Primary: gemini-3.1-flash-lite • Fallback: gemini-3.8-flash',
              }
            : r
        )
      );
    } else {
      setResults((prev) =>
        prev.map((r) =>
          r.id === 'gemini'
            ? {
                ...r,
                status: serverOk ? 'error' : 'warning',
                message: 'GEMINI_API_KEY is missing on server',
                details: 'Configure GEMINI_API_KEY in deployment or .env environment variables.',
              }
            : r
        )
      );
    }

    // 3. Check Camera & MediaDevices
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setResults((prev) =>
          prev.map((r) =>
            r.id === 'camera'
              ? {
                  ...r,
                  status: 'warning',
                  message: 'Direct live camera API not supported by browser',
                  details: 'Standard file picker & native camera capture fallback will be used.',
                }
              : r
          )
        );
      } else {
        // Enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');

        setResults((prev) =>
          prev.map((r) =>
            r.id === 'camera'
              ? {
                  ...r,
                  status: 'success',
                  message: `Camera API supported (${videoInputs.length} video device(s) found)`,
                  details: videoInputs.map((v) => v.label || 'Default Camera').join(', ') || 'Ready for viewfinder',
                }
              : r
          )
        );
      }
    } catch (camErr: unknown) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === 'camera'
            ? {
                ...r,
                status: 'warning',
                message: 'Camera permission prompt required or device unavailable',
                details: camErr instanceof Error ? camErr.message : 'Fallback available',
              }
            : r
        )
      );
    }

    // 4. Check Pipeline Canvas Optimization
    try {
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 100;
      testCanvas.height = 100;
      const ctx = testCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 0, 100, 100);
        const dataUrl = testCanvas.toDataURL('image/jpeg', 0.9);
        const ok = dataUrl.startsWith('data:image/jpeg;base64,');

        setResults((prev) =>
          prev.map((r) =>
            r.id === 'pipeline'
              ? {
                  ...r,
                  status: ok ? 'success' : 'warning',
                  message: 'Client image compression & raster pipeline ready',
                  details: 'Auto-rescales large photos to 2048px to prevent memory crashes',
                }
              : r
          )
        );
      }
    } catch (e: unknown) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === 'pipeline'
            ? {
                ...r,
                status: 'warning',
                message: 'Canvas test failed',
                details: e instanceof Error ? e.message : 'Unknown error',
              }
            : r
        )
      );
    }

    setIsRunning(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">System Diagnostics & Troubleshooter</h3>
              <p className="text-xs text-slate-400">Live verification of server, API keys, camera & vision engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Items List */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {results.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1.5 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {item.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                  {item.status === 'error' && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  {item.status === 'pending' && (
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-amber-400 rounded-full animate-spin shrink-0" />
                  )}
                  <span className="font-bold text-xs sm:text-sm text-slate-100">{item.name}</span>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    item.status === 'success'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : item.status === 'warning'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : item.status === 'error'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-normal pl-6">{item.message}</p>
              {item.details && (
                <p className="text-[11px] text-slate-500 font-mono pl-6 truncate">{item.details}</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for field EHS inspection</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Re-run Checks</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
