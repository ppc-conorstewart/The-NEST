// src/components/AddAssetModal.jsx
import React, { useState } from 'react';
import FormField from './FormField';

/**
 * Props:
 * - isOpen: boolean (whether modal is visible)
 * - onClose: () => void
 * - onSave: (newAsset) => void
 * - nameOptions, categoryOptions, locationOptions, statusOptions: arrays of strings
 */
export default function AddAssetModal({
  isOpen,
  onClose,
  onSave,
  nameOptions,
  categoryOptions,
  locationOptions,
  statusOptions,
}) {
  const [idNumber, setIdNumber] = useState('');
  const [sn, setSN] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('Available');

  const handleSubmit = () => {
    if (!idNumber.trim()) {
      alert('Please enter the numeric part of the ID.');
      return;
    }
    if (!sn.trim()) {
      alert('Please enter the Serial Number (SN).');
      return;
    }
    if (!name || !category || !location || !status) {
      alert('Please select Name, Category, Location, and Status.');
      return;
    }
    onSave({
      id: `PPC ${idNumber.trim()}`,
      sn,
      name,
      category,
      location,
      status,
    });
    // Reset fields
    setIdNumber('');
    setSN('');
    setName('');
    setCategory('');
    setLocation('');
    setStatus('Available');
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-black text-white p-6 rounded-lg shadow-xl w-[500px] max-w-full">
        <h2 className="text-xl font-bold mb-4">Add New Asset</h2>

        {/* PPC# */}
        <div className="flex items-center gap-2 mb-4">
          <label className="w-[50px] text-lg">PPC#:</label>
          <span className="px-2 py-2 bg-gray-800 rounded border border-gray-600">PPC&nbsp;</span>
          <input
            type="text"
            placeholder="e.g. 000127"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
            className="flex-1 px-3 py-2 border border-gray-600 rounded bg-black text-white"
          />
        </div>

        {/* Serial # */}
        <div className="flex items-center gap-2 mb-4">
          <label className="w-[70px] text-lg">SERIAL #:</label>
          <input
            type="text"
            placeholder="Serial Number"
            value={sn}
            onChange={(e) => setSN(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-600 rounded bg-black text-white"
          />
        </div>

        {/* Name */}
        <FormField
          label="Name"
          type="select"
          value={name}
          onChange={setName}
          placeholder="-- Select Name --"
          options={nameOptions}
        />

        {/* Category */}
        <FormField
          label="Category"
          type="select"
          value={category}
          onChange={setCategory}
          placeholder="-- Select Category --"
          options={categoryOptions}
        />

        {/* Location */}
        <FormField
          label="Location"
          type="select"
          value={location}
          onChange={setLocation}
          placeholder="-- Select Location --"
          options={locationOptions}
        />

        {/* Status */}
        <FormField
          label="Status"
          type="select"
          value={status}
          onChange={setStatus}
          placeholder="-- Select Status --"
          options={statusOptions}
        />

        {/* Buttons */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-500"
          >
            Save Asset
          </button>
        </div>
      </div>
    </div>
  );
}
