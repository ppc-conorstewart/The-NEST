// src/components/WorkorderHeader.jsx
import React from 'react';
import { Bell } from 'lucide-react';

export default function WorkorderHeader({
  currentPageIndex,
  pages,
  onClose,
  metadata,
  woNumber,
  hasAlerts,
  onToggleAlerts,
}) {
  const title = currentPageIndex === 0
    ? 'Customer WO Info'
    : pages[currentPageIndex]?.title || '';

  return (
    <>
      {/* Top bar */}
      <div className="relative flex items-center justify-between px-6 py-2 bg-black">
        {/* Left: WO# */}
        <div className="flex items-center space-x-2">
          {woNumber && (
            <div className="px-2 py-1 text-xs font-bold text-white border border-gray-600 rounded">
              {woNumber}
            </div>
          )}
        </div>

        {/* Center: Title */}
        <h2 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-white">
          {title}
        </h2>

        {/* Right: Bell + Close */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleAlerts}
            className={`${
              hasAlerts ? 'text-red-500 animate-pulse' : 'text-white hover:text-gray-300'
            }`}
            title={hasAlerts ? 'You have alerts' : 'No alerts'}
          >
            <Bell size={20} />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl leading-none"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Metadata bar */}
      {currentPageIndex > 0 && (
        <div className="px-6 py-0 bg-black border-2 border-gray-700">
          <div className="flex flex-wrap justify-center items-center space-x-1 text-xs uppercase text-[#6a7257]">
            <div><span className="font-semibold text-white">Customer:</span> {metadata.customer}</div>
            <div><span className="font-semibold text-white">LSD:</span> {metadata.surfaceLSD}</div>
            <div><span className="font-semibold text-white">Wells:</span> {metadata.numberOfWells}</div>
            <div><span className="font-semibold text-white">Rig-in:</span> {metadata.rigInDate}</div>
            <div><span className="font-semibold text-white">Bank:</span> {metadata.wellBankType}</div>
            <div><span className="font-semibold text-white">Rev:</span> {metadata.workbookRevision}</div>
          </div>
        </div>
      )}
    </>
  );
}
