// src/pages/JobPlannerComponents/ViewToggleButtons.jsx

import React from 'react';

export default function ViewToggleButtons({
  viewMode,
  setViewMode,
  setShowModal,
  resetCalendarMonth, // ← ADD THIS
}) {
  return (
    <div className="flex gap-4">
      {/* Table View Button */}
      <button
        onClick={() => setViewMode('table')}
        className={`px-4 py-0 rounded border border-[#6a7257] font-semibold border ${
          viewMode === 'table'
            ? 'bg-black text-[#6a7257]'
            : 'border-[#6a7257] text-[#6a7257]'
        }`}
      >
        Table View
      </button>

      {/* Calendar View Button */}
      <button
        onClick={() => {
          setViewMode('calendar');
          if (typeof resetCalendarMonth === 'function') resetCalendarMonth(); // ← CLEAR MONTH
        }}
        className={`px-3 py-0 rounded bg-black font-semibold border ${
          viewMode === 'calendar'
            ? 'bg-black text-white'
            : 'border-[#6a7257] text-[#6a7257]'
        }`}
      >
        Calendar View
      </button>

      {/* Add New Job Button */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-black text-[#6a7257] border border-[#6a7257] px-4 py-0 rounded font-semibold shadow"
      >
        + Add New Job
      </button>
    </div>
  );
}
