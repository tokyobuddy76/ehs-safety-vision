/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  X,
  RotateCw,
  AlertTriangle,
  Zap,
  ZapOff,
  Check,
  Smartphone,
  Upload,
} from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string, fileInfo: { name: string; size: string; mimeType: string }) => void;
  onFallbackToFilePicker: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onFallbackToFilePicker,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Stop active stream tracks
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream
  const startCamera = async (targetFacingMode: 'environment' | 'user') => {
    setIsInitializing(true);
    setCameraError(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser.');
      }

      let stream: MediaStream;
      try {
        // First try with requested facingMode and high-res constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback to basic video constraint (e.g. desktop webcam)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check for torch capability on track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities ? (videoTrack.getCapabilities() as Record<string, unknown>) : {};
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      }

      setIsInitializing(false);
    } catch (err: unknown) {
      console.warn('Camera initialization error:', err);
      let errorMsg = 'Could not access camera.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg = 'Camera permission was denied. Please allow camera access in browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMsg = 'No camera found on this device.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMsg = 'Camera is already in use by another application.';
        } else {
          errorMsg = err.message || errorMsg;
        }
      }
      setCameraError(errorMsg);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Toggle front/rear camera
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle torch / flash if supported
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      const nextState = !torchOn;
      try {
        await track.applyConstraints({
          advanced: [{ torch: nextState } as MediaTrackConstraintSet],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn('Torch not supported:', e);
      }
    }
  };

  // Take snapshot
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If user camera, mirror it horizontally
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `Workplace_Camera_${timestamp}.jpg`;
      const approxBytes = Math.round((dataUrl.length * 3) / 4);
      const sizeMb = (approxBytes / (1024 * 1024)).toFixed(2);

      // Brief flash effect
      setTimeout(() => {
        stopStream();
        setIsCapturing(false);
        onCapture(dataUrl, {
          name: fileName,
          size: `${sizeMb} MB`,
          mimeType: 'image/jpeg',
        });
        onClose();
      }, 200);
    } else {
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[95vh]">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-slate-900/90 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">Workplace Inspection Camera</span>
          </div>

          <div className="flex items-center gap-2">
            {hasTorch && (
              <button
                onClick={handleToggleTorch}
                className={`p-2 rounded-lg transition-colors ${
                  torchOn ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Toggle Torch/Flash"
              >
                {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={handleToggleFacingMode}
              disabled={isInitializing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
              title="Switch Camera (Front / Rear)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Close Camera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Viewfinder Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] max-h-[65vh] overflow-hidden">
          {/* Live Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-contain ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
          />

          {/* Shutter Flash Animation */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white animate-in fade-in duration-75 z-20 pointer-events-none" />
          )}

          {/* Viewfinder Alignment Overlay */}
          {!cameraError && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-4/5 h-4/5 border border-white/20 rounded-xl relative">
                {/* 4 Corner Crosshairs */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

                <div className="absolute bottom-3 inset-x-0 text-center">
                  <span className="px-3 py-1 rounded bg-black/60 text-white text-xs font-semibold backdrop-blur-xs">
                    Align workplace area, machinery, or activity
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Initializing Spinner */}
          {isInitializing && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white gap-3 z-10">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-300">Activating camera viewfinder...</p>
            </div>
          )}

          {/* Error Message with Fallback */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center gap-4 z-10">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="font-bold text-sm sm:text-base text-white">Direct Camera Access Unavailable</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onFallbackToFilePicker();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Use Device Camera / File Picker</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Shutter Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            <span>Orientation: </span>
            <span className="text-slate-200 font-semibold uppercase">
              {facingMode === 'environment' ? 'Rear (Field / Work Area)' : 'Front (Webcam)'}
            </span>
          </div>

          {/* Center Shutter Button */}
          <div className="mx-auto flex items-center gap-4">
            <button
              onClick={handleSnapPhoto}
              disabled={isInitializing || Boolean(cameraError) || isCapturing}
              className="relative w-16 h-16 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group border-4 border-slate-900 ring-2 ring-amber-400"
              title="Snap Photograph"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500 group-hover:bg-amber-400 transition-colors flex items-center justify-center text-slate-950">
                <Camera className="w-6 h-6" />
              </div>
            </button>
          </div>

          {/* Fallback button on bottom right */}
          <button
            onClick={() => {
              onClose();
              onFallbackToFilePicker();
            }}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
