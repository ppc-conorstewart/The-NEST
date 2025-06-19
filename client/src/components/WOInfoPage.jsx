import React, { useState } from 'react';

export default function WOInfoPage({
  metadata,
  handleChange,
  logoSrc
}) {
  // local edit‐mode flags per field
  const [editModes, setEditModes] = useState({});

  // toggle a single field into/out of edit mode
  const toggleEdit = field =>
    setEditModes(m => ({ ...m, [field]: !m[field] }));

  const labelMap = {
    surfaceLSD:       'Surface LSD',
    numberOfWells:    '# of Wells',
    rigInDate:        'Rig-in Date',
    wellBankType:     'Bank Type',
    workbookRevision: 'Revision',
    buildingBase:     'Building Base'
  };

  // only show the six fields we care about
  const fields = Object.entries(metadata).filter(
    ([key]) =>
      key !== 'customer' &&
      !/^location\d+$/.test(key)
  );

  return (
    <div className="flex flex-col h-full w-full overflow-auto">
      {/* logo */}
      <div className="flex justify-center mb-4">
        <img
          src={logoSrc}
          alt={`${metadata.customer} logo`}
          className="h-16 object-contain"
          onError={e => (e.target.style.display = 'none')}
        />
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 justify-items-center">
        {fields.map(([field, value]) => {
          const label = labelMap[field] || field;
          const isBase = field === 'buildingBase';

          return (
            <div key={field} className="w-full max-w-md text-center">
              <label className="block text-[#6a7257] uppercase text-sm font-semibold mb-1">
                {label}:
              </label>

              <div className="flex items-center justify-center mb-2">
                {editModes[field] ? (
                  isBase ? (
                    <select
                      value={value}
                      onChange={e => handleChange(field, e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="" disabled>
                        Select base…
                      </option>
                      <option value="Red Deer">Red Deer</option>
                      <option value="Grand Prairie">Grand Prairie</option>
                      <option value="Nisku">Nisku</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={e => handleChange(field, e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded px-2 py-1 text-xs text-white"
                    />
                  )
                ) : (
                  <div className="text-white whitespace-nowrap text-center text-sm">
                    {value || '—'}
                  </div>
                )}

                <button
                  onClick={() => toggleEdit(field)}
                  className="ml-4 text-yellow-400 text-xs font-medium"
                >
                  {editModes[field] ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
