// src/components/EditAssetModal.jsx
import React, { useState, useEffect } from 'react';
import FormField from './FormField';

/**
 * Props:
 * - isOpen: boolean
 * - initialData: the asset object to edit (or null)
 * - onClose: () => void
 * - onSave: (updatedAsset) => void
 * - nameOptions, categoryOptions, locationOptions, statusOptions: arrays of strings
 */
export default function EditAssetModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  nameOptions,
  categoryOptions,
  locationOptions,
  statusOptions,
}) {
  // Local form state, initialized from initialData when it changes
  const [form, setForm] = useState({
    id: '',
    sn: '',
    name: '',
    category: '',
    location: '',
    status: '',
  });

  // When initialData changes (opening modal), populate form
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id || '',
        sn: initialData.sn || '',
        name: initialData.name || '',
        category: initialData.category || '',
        location: initialData.location || '',
        status: initialData.status || '',
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // No additional validation in this example—backend should handle incorrect data
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-black text-white p-6 rounded-lg shadow-xl w-[500px] max-w-full">
        <h2 className="text-xl font-bold mb-4">Edit Asset</h2>

        {/* PPC# (manual) */}
        <FormField
          label="PPC#"
          type="text"
          value={form.id}
          onChange={(val) => setForm((prev) => ({ ...prev, id: val }))}
          placeholder="PPC number"
        />

        {/* Serial # (manual) */}
        <FormField
          label="Serial #"
          type="text"
          value={form.sn}
          onChange={(val) => setForm((prev) => ({ ...prev, sn: val }))}
          placeholder="Serial Number"
        />

        {/* Name (dropdown) */}
        <FormField
          label="Name"
          type="select"
          value={form.name}
          onChange={(val) => setForm((prev) => ({ ...prev, name: val }))}
          placeholder="-- Select Name --"
          options={nameOptions}
        />

        {/* Category (dropdown) */}
        <FormField
          label="Category"
          type="select"
          value={form.category}
          onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
          placeholder="-- Select Category --"
          options={categoryOptions}
        />

        {/* Location (dropdown) */}
        <FormField
          label="Location"
          type="select"
          value={form.location}
          onChange={(val) => setForm((prev) => ({ ...prev, location: val }))}
          placeholder="-- Select Location --"
          options={locationOptions}
        />

        {/* Status (dropdown) */}
        <FormField
          label="Status"
          type="select"
          value={form.status}
          onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
          placeholder="-- Select Status --"
          options={statusOptions}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
