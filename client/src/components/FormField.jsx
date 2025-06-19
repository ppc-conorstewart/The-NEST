// src/components/FormField.jsx
import React from 'react';

/**
 * A reusable form field component that renders either a text input or a select dropdown.
 *
 * Props:
 * - label: the field’s label text
 * - type: "text" or "select"
 * - value: current value
 * - onChange: callback to update value
 * - placeholder: placeholder text (for select)
 * - options: array of strings (for select)
 */
export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  options = [],
}) {
  return (
    <div className="mb-4">
      <label className="block mb-1">{label}</label>
      {type === 'text' ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-black text-white"
        />
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-black text-white"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
