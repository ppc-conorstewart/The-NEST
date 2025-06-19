// src/components/AlertsModal.jsx

import React from 'react';

export default function AlertsModal({ alerts, onClose }) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* Modal box */}
      <div
        className="relative bg-black text-white w-11/12 max-w-md p-6 overflow-auto rounded-lg"
        style={{ border: '2px solid #6a7257' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-center items-center mb-4 border-b border-gray-700 pb-2">
          <h2 className="text-2xl font-bold text-red-400 text-center w-full">
            Alerts
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-2xl leading-none"
            title="Close alerts"
          >
            ×
          </button>
        </div>

        {/* Empty state */}
        {alerts.length === 0 && (
          <p className="text-center text-gray-400">No alerts.</p>
        )}

        {/* Alert entries */}
        {alerts.map((msg, i) => {
          // parse fields
          const m = msg.match(
            /Insufficient\s+"(.+)"\s+in\s+(.+)\s+for.*need\s+([\d.]+),\s+have\s+([\d.]+)/
          );
          const [_, asset, base, needRaw, haveRaw] = m || [];
          const need = Math.floor(parseFloat(needRaw)) || 0;
          const have = Math.floor(parseFloat(haveRaw)) || 0;

          return (
            <div
              key={i}
              className="mb-6 p-4 bg-gray-900 border border-[#6a7257] rounded"
            >
              <p className="text-xl font-bold text-center text-red-300 mb-2">
                Insufficient
              </p>

              <div className="text-center mb-2">
                <span className="font-semibold">{asset}</span>
                <br />
                in <span className="font-semibold">{base}</span>
              </div>

              <div className="flex justify-center gap-8 mb-2 text-sm">
                <div className="flex items-baseline gap-1">
                  <span className="text-blue-400 font-semibold">Need:</span>
                  <span className="font-mono">{need}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-red-400 font-semibold">Have:</span>
                  <span className="font-mono">{have}</span>
                </div>
              </div>

              <p className="text-center text-gray-400">
                Consider transferring assets.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
