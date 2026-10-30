/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, ChevronDown, Check, Zap, Sparkles, Shield } from 'lucide-react';
import { AVAILABLE_GEMINI_MODELS, type GeminiModelOption } from '../types/models.ts';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const activeModel =
    AVAILABLE_GEMINI_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_GEMINI_MODELS[0];

  return (
    <div className="relative">
      {/* Selector Trigger Button */}
      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                AI Vision Model:
              </span>
              <span className="text-xs font-black text-amber-400 truncate">{activeModel.name}</span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                {activeModel.costTier}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {activeModel.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{activeModel.tagline}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1 shrink-0 border border-slate-700 disabled:opacity-50"
        >
          <span>Change</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Model Selection Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 left-0 bottom-full mb-2 z-40 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2.5 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-300">
                Models (Cheapest to Most Expensive)
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                $ Cheapest → $$$$ Premium
              </span>
            </div>

            <div className="grid gap-1.5 max-h-80 overflow-y-auto pt-1">
              {AVAILABLE_GEMINI_MODELS.map((model, idx) => {
                const isCurrent = model.id === selectedModel;

                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-500/15 border border-amber-500/50 text-white shadow-xs'
                        : 'hover:bg-slate-900 border border-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-white">{model.name}</span>
                        <span className="text-[10px] font-black font-mono px-1.5 py-0.2 rounded bg-slate-900 text-emerald-400 border border-emerald-800/70">
                          {model.costTier}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                            model.costTier === '$'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : model.costTier === '$$'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                                : model.costTier === '$$$'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                  : 'bg-purple-950 text-purple-300 border border-purple-700'
                          }`}
                        >
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight font-medium">
                        {model.tagline}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {model.description}
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
