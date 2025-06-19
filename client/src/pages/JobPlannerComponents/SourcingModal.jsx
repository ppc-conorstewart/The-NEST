// src/pages/JobPlannerComponents/SourcingModal.jsx

import React, { useState, useEffect, useRef } from 'react';

export default function SourcingModal({ isOpen, onClose, job, onSubmit }) {
  const firstField = useRef(null);

  const [form, setForm] = useState({
    base: '',
    neededBy: '',
    project: '',
    vendor: '',
    category: 'Other',
    priority: 'Medium',
    status: 'Requested',
    items: [{ description: '', quantity: '' }],
  });
  const [error, setError] = useState('');

  // Whenever the modal opens (and job changes), reset + prefill
  useEffect(() => {
    if (!isOpen) return;

    // Focus the base dropdown
    setTimeout(() => firstField.current?.focus(), 0);

    // Prefill the project line with "CUSTOMER – LSD"
    const prefilledProject = job
      ? `${job.customer} – ${job.surface_lsd}`
      : '';

    setForm({
      base: '',
      neededBy: '',
      project: prefilledProject,
      vendor: '',
      category: 'Other',
      priority: 'Medium',
      status: 'Requested',
      items: [{ description: '', quantity: '' }],
    });
    setError('');
  }, [isOpen, job]);

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx][field] = value;
      return { ...f, items };
    });
  };

  const addItemRow = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { description: '', quantity: '' }],
    }));

  const removeItemRow = (i) =>
    setForm((f) => {
      const items = f.items.filter((_, idx) => idx !== i);
      return {
        ...f,
        items: items.length ? items : [{ description: '', quantity: '' }],
      };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.base || !form.neededBy) {
      setError('Base and Needed By are required.');
      return;
    }
    for (let it of form.items) {
      if (!it.description.trim() || !it.quantity.trim()) {
        setError('Each item needs a description and quantity.');
        return;
      }
    }

    try {
      // call the parent handler
      await onSubmit(job.id, form);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to submit ticket. Please try again.');
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-black border border-[#6a7257] p-4 rounded-lg w-full max-w-lg text-[#6a7257]">
        <h2 className="text-xl font-erbaum text-center font-bold mb-4">
          Submit Sourcing Ticket
        </h2>
        {error && <div className="text-red-500 mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Base */}
          <div>
            <label className="block text-[#6a7257] text-base text-center uppercase font-bold  mb-1">Base:</label>
            <select
              name="base"
              ref={firstField}
              value={form.base}
              onChange={handleField}
              className="w-full bg-black text-center text-white  border border-gray-700 px-3 py-2 rounded"
              required
            >
              <option value="" disabled>
                Select a Base
              </option>
              <option>Red Deer</option>
              <option>Nisku</option>
              <option>Grande Prairie</option>
            </select>
          </div>

          {/* Needed By */}
          <div>
            <label className="block text-[#6a7257] text-base text-center uppercase font-bold  mb-1">Needed By:</label>
            <input
              type="date"
              name="neededBy"
              value={form.neededBy}
              onChange={handleField}
              className="w-full bg-black text-center text-[#6a7257] border border-gray-700 px-3 py-2 rounded"
              required
            />
          </div>

          {/* Project (locked) */}
          <div>
            <label className="block text-[#6a7257] text-base  text-center uppercase font-bold  mb-1">Project:</label>
            <input
              name="project"
              value={form.project}
              readOnly
              className="w-full bg-[#6a7257] text-black text-center font-erbaum  border border-gray-700 px-3 py-2 rounded cursor-not-allowed"
            />
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-[#6a7257] text-base text-center uppercase font-bold  mb-1">Vendor (optional):</label>
            <input
              name="vendor"
              value={form.vendor}
              onChange={handleField}
              placeholder="e.g. Acme Supplies"
              className="w-full text-center bg-black text-white border border-gray-700 px-3 py-2 rounded"
            />
          </div>

          {/* Category / Priority / Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#6a7257] text-base text-center uppercase font-bold  mb-1">Category:</label>
              <select
                name="category"
                value={form.category}
                onChange={handleField}
                className="w-full bg-black text-white border border-gray-700 px-3 py-2 rounded"
              >
                <option>Consumables</option>
                <option>Equipment</option>
                <option>Spare Parts</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[#6a7257] text-base text-center uppercase font-bold  mb-1">Priority:</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleField}
                className="w-full bg-black text-white border border-gray-700 px-3 py-2 rounded"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[#6a7257] text-base text-center uppercase font-bold  mb-1">Status:</label>
              <select
                name="status"
                value={form.status}
                onChange={handleField}
                className="w-full bg-black text-white border border-gray-700 px-3 py-2 rounded"
              >
                <option>Requested</option>
                <option>Ordered</option>
                <option>Received</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg text-white font-semibold">Items</h3>
              <button
                type="button"
                onClick={addItemRow}
                className="text-green-500 hover:underline text-sm"
              >
                + Add Item
              </button>
            </div>

            {form.items.map((it, idx) => (
              <div key={idx} className="relative grid grid-cols-3 gap-2 mb-3">
                {form.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="absolute top-0 right-0 text-red-500"
                  >
                    &times;
                  </button>
                )}
                <input
                  type="text"
                  value={it.description}
                  onChange={(e) =>
                    handleItemChange(idx, 'description', e.target.value)
                  }
                  placeholder="Item description"
                  className="col-span-2 bg-black text-[#6a7257] border border-gray-700 px-3 py-2 rounded"
                  required
                />
                <input
                  type="number"
                  value={it.quantity}
                  onChange={(e) =>
                    handleItemChange(idx, 'quantity', e.target.value)
                  }
                  placeholder="Qty"
                  className="bg-black text-[#6a7257] border border-gray-700 px-3 py-2 rounded"
                  required
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
