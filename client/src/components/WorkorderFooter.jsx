// src/components/WorkorderFooter.jsx

import React from 'react';

export default function WorkorderFooter({
  currentPageIndex,
  prevPageLabel,
  nextPageLabel,
  onPrev,
  onNext,
  onGenerate,
  onSave,
  canNext
}) {
  return (
    <footer className="relative px-4 py-1 border-t flex items-center justify-between text-xs">
      {/* Back button */}
      <button
        onClick={onPrev}
        disabled={currentPageIndex === 0}
        className="px-2 py-1 bg-black text-[#6a7257] rounded disabled:opacity-50"
      >
        ◀ {prevPageLabel}
      </button>

      {/* Centered Generate / Save */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-2">
        <button
          onClick={onGenerate}
          className="px-2 py-1 bg-green-600 bg-opacity-50 text-white rounded"
        >
          ✔️ Publish Revision 
        </button>
        <button
          onClick={onSave}
          className="px-2 py-1 bg-blue-600 bg-opacity-50 text-white rounded"
        >
          Save Progress
        </button>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!canNext}
        className="ml-auto px-2 py-1 bg-black text-[#6a7257] rounded disabled:opacity-50"
      >
        {nextPageLabel} ▶
      </button>
    </footer>
  );
}
