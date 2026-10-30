/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RefreshCw, Trash2, Image as ImageIcon, Camera, CheckCircle } from 'lucide-react';

interface ImagePreviewProps {
  imageSrc: string;
  fileName?: string;
  fileSize?: string;
  onReplace: () => void;
  onRemove: () => void;
  isAnalyzing: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageSrc,
  fileName = 'Workplace Capture',
  fileSize,
  onReplace,
  onRemove,
  isAnalyzing,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold truncate">{fileName}</span>
          {fileSize && <span className="text-slate-400 text-[11px]">({fileSize})</span>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReplace}
            disabled={isAnalyzing}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Replace</span>
          </button>
          <button
            onClick={onRemove}
            disabled={isAnalyzing}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="relative w-full bg-slate-950 flex items-center justify-center min-h-[260px] max-h-[460px] overflow-hidden">
        <img
          src={imageSrc}
          alt="Workplace preview"
          className="w-full h-auto max-h-[460px] object-contain block"
        />

        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1.5 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ready for EHS visual screening</span>
        </div>
      </div>
    </div>
  );
};
