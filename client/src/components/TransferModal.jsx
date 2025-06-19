// src/components/TransferModal.jsx
import React from 'react';

/**
 * Props:
 * - isOpen: boolean
 * - selectedCount: number of selected assets
 * - onClose: () => void
 * - locationOptions: array of strings
 * - newLocation: string
 * - onLocationChange: (val) => void
 * - onTransfer: () => void
 */
export default function TransferModal({
  isOpen,
  selectedCount,
  onClose,
  locationOptions,
  newLocation,
  onLocationChange,
  onTransfer,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-w-full">
        <h2 className="text-xl font-bold mb-4 text-black">Shop to Shop Transfer</h2>
        <p className="text-gray-700 mb-2 text-sm">
          Selected Assets: <strong>{selectedCount}</strong>
        </p>
        <label className="block mb-2 text-gray-700 font-medium">New Location:</label>
        <select
          value={newLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full border border-gray-600 bg-black text-white px-3 py-2 rounded mb-6"
        >
          <option value="">-- Select a Location --</option>
          {locationOptions.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onTransfer}
            className="px-4 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-400"
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
