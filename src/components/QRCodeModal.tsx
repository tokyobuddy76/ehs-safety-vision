/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QrCode, X, Download, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';
  const [dataUrlToEncode, setDataUrlToEncode] = useState<string>(currentUrl);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Use the local serverless endpoint which connects to api.qrserver.com
  const serverlessQrUrl = `/api/qr-code?size=240x240&data=${encodeURIComponent(dataUrlToEncode)}`;
  const directApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    dataUrlToEncode
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dataUrlToEncode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(serverlessQrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ehs-safety-inspection-qr-240x240.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(serverlessQrUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md text-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">Mobile Inspection QR Code</h3>
              <p className="text-xs text-slate-400">Serverless connection via api.qrserver.com</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl border-2 border-amber-500/40 shadow-xl relative group">
            <img
              src={serverlessQrUrl}
              alt="EHS Mobile Inspection QR Code"
              width={240}
              height={240}
              className="w-56 h-56 sm:w-60 sm:h-60 block rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Scan with Phone Camera to Open Field Tool</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Opens the EHS Safety Vision inspection screening app on any iOS or Android device.
            </p>
          </div>

          {/* Target URL field */}
          <div className="w-full space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Encoded Target URL
            </label>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1.5">
              <input
                type="text"
                value={dataUrlToEncode}
                onChange={(e) => setDataUrlToEncode(e.target.value)}
                placeholder="https://your-app.vercel.app"
                className="bg-transparent text-xs text-slate-200 px-2 py-1 focus:outline-hidden w-full font-mono truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 shrink-0 transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-500">Presets:</span>
            <button
              type="button"
              onClick={() => setDataUrlToEncode('https://your-app.vercel.app')}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono transition-colors"
            >
              your-app.vercel.app
            </button>
            <button
              type="button"
              onClick={() => setDataUrlToEncode(currentUrl)}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono transition-colors"
            >
              Current Domain
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <a
            href={directApiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <span>Direct API URL</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
