import React, { useState, useCallback } from 'react';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import Consumables from './Consumables'; // ← NEW import

export default function UpperMasterAssemblyPage({
  metadata,
  assets,
  tabs,               
  selections,
  buildQtys,
  setBuildQtys,
  activeTab,
  setActiveTab,
  handleChange,
  baseColors,
  addConsumable            // ← This prop is expected in WorkorderForm
}) {
  const jobPrefix = `workorderProgress_${metadata.customer.replace(/\s+/g,'-')}_${metadata.surfaceLSD}_UMA`;

  const abbr = {
    'Red Deer': 'RD',
    'Grand Prairie': 'GP',
    Nisku: 'NIS'
  };

  const [files, setFiles] = useState(() =>
    tabs.map((_, i) => localStorage.getItem(`${jobPrefix}_${i}`) || null)
  );
  const [voided, setVoided] = useState(() =>
    tabs.map(() => ({}))
  );

  const onDrop = useCallback(
    accepted => {
      if (!accepted.length) return;
      const f = accepted[0];
      const preview = URL.createObjectURL(f);
      setFiles(fs => {
        const next = fs.map((old, idx) => (idx === activeTab ? preview : old));
        localStorage.setItem(`${jobPrefix}_${activeTab}`, preview);
        return next;
      });
    },
    [activeTab, jobPrefix]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });
  const removeFile = idx => {
    setFiles(fs => {
      const next = fs.map((old, i) => (i === idx ? null : old));
      localStorage.removeItem(`${jobPrefix}_${idx}`);
      return next;
    });
  };

  const grouped = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.name] = (acc[a.name] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const assetOptions = grouped.map(a => ({
    value: a.name,
    label: (
      <span className="flex justify-between">
        <span>{a.name}</span>
        <span className="text-blue-400">({a.count})</span>
      </span>
    )
  }));

  const toggleVoid = n => {
    setVoided(vs =>
      vs.map((map, i) => (i === activeTab ? { ...map, [n]: !map[n] } : map))
    );
    handleChange(`location${n}`, '');
  };

  const selObj = selections[activeTab];
  const file = files[activeTab];
  const voidMap = voided[activeTab] || {};

  return (
    <div className="flex flex-col h-full overflow-hidden text-[10px]">
      {/* Build QTY & Tabs */}
      <div className="flex justify-between items-center mb-2 px-4">
        <div className="flex items-center">
          <label className="text-[10px] text-white mr-2">Build QTY:</label>
          <input
            type="number"
            step="1"
            min="0"
            value={buildQtys[activeTab]}
            onChange={e => {
              const v = parseInt(e.target.value, 10) || 0;
              setBuildQtys(bqs => bqs.map((x, i) => (i === activeTab ? v : x)));
            }}
            className="w-16 text-[10px] px-1 py-1 rounded bg-black border border-gray-700 text-white"
          />
        </div>
        <div className="flex gap-2">
          {tabs.map((lbl, i) => (
            <button
              key={lbl}
              onClick={() => setActiveTab(i)}
              className={`px-3 py-1 text-[9px] rounded transition ${
                activeTab === i
                  ? 'bg-[#6a7257] text-black'
                  : 'bg-[#333] text-white hover:bg-[#6a7257]'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop + Consumables Row */}
      <div className="flex justify-center gap-6 mb-4 px-4">
        {/* Shared Consumables component */}
        <Consumables
          buildQty={buildQtys[activeTab]}
          activeTab={activeTab}
          page="UMA"
          addConsumable={(name, qty) => addConsumable(name, qty, 'UMA', activeTab)}
        />

        {/* Image Upload Zone */}
        <div
          {...getRootProps()}
          className="relative bg-gray-800 p-2 rounded-lg shadow-xl border-2 border-[#6a7257] max-w-md w-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(60,60,60,0.6), #000)',
            height: '16rem'
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/assets/blueprint-grid.png')",
              backgroundSize: 'cover',
              opacity: 0.1,
              pointerEvents: 'none'
            }}
          />
          <input {...getInputProps()} />
          {file ? (
            <>
              <img
                src={file}
                alt={`UMA-${activeTab + 1} Preview`}
                className="h-full w-full object-contain relative"
              />
              <button
                onClick={e => {
                  e.stopPropagation();
                  removeFile(activeTab);
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-75"
                title="Remove image"
              >
                ×
              </button>
            </>
          ) : (
            <p className="absolute inset-0 flex items-center justify-center text-gray-400 text-[11px]">
              {isDragActive
                ? 'Drop image here…'
                : 'Drag & drop an image, or click to select'}
            </p>
          )}
        </div>
      </div>

      {/* Location selectors with void & availability */}
      <div className="overflow-y-auto flex-grow pr-2 px-4">
        {[1, 2, 3, 4, 5, 6, 7].map(n => {
          const locKey = `location${n}`;
          const val = selObj[locKey] || '';
          const isVoid = !!voidMap[n];

          const summary = {};
          assets
            .filter(a => a.name === val && a.status === 'Available')
            .forEach(a => {
              summary[a.location] = (summary[a.location] || 0) + 1;
            });
          const inUse = assets.filter(
            a => a.name === val && /in[\s-]?use/i.test(a.status)
          ).length;

          return (
            <div key={n} className="mb-2">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1">
                <span className="text-[#6a7257] uppercase text-[8px] font-semibold">
                  Location #{n}
                </span>
                <div className="flex items-center w-full sm:w-2/3">
                  <span
                    onClick={() => toggleVoid(n)}
                    className="text-red-500 cursor-pointer mr-2 text-lg select-none"
                    title="Void this location"
                  >
                    ×
                  </span>
                  {isVoid ? (
                    <div className="w-full text-center text-[9px] text-[#6a7257] font-bold bg-black border border-gray-700 rounded py-1">
                      VOID
                    </div>
                  ) : (
                    <Select
                      options={assetOptions}
                      value={assetOptions.find(o => o.value === val) || null}
                      onChange={o => handleChange(locKey, o?.value || '')}
                      isClearable
                      placeholder="Select asset..."
                      className="w-full text-[8px]"
                      styles={{
                        control: s => ({
                          ...s,
                          backgroundColor: 'black',
                          borderColor: '#374151',
                          minHeight: '1.25rem',
                          fontSize: '0.65rem'
                        }),
                        singleValue: s => ({ ...s, color: 'white' }),
                        input: s => ({ ...s, color: 'white' }),
                        menu: s => ({ ...s, backgroundColor: '#111' }),
                        option: (s, { isFocused }) => ({
                          ...s,
                          backgroundColor: isFocused ? '#374151' : '#111',
                          color: 'white'
                        }),
                        menuPortal: b => ({ ...b, zIndex: 9999 })
                      }}
                      menuPortalTarget={document.body}
                      menuPlacement="auto"
                      menuPosition="fixed"
                      maxMenuHeight={240}
                    />
                  )}
                </div>
              </div>

              {!isVoid && val && (
                <div className="text-[6px] text-gray-400 mt-1 sm:w-2/3 ml-auto text-right">
                  <div className="flex justify-end flex-wrap gap-x-3">
                    <span className="flex gap-1 items-center">
                      <span className="text-white font-semibold">In-use:</span>
                      <span className="text-yellow-400 font-bold">{inUse}</span>
                    </span>
                    {Object.entries(summary).map(([base, cnt]) => (
                      <span
                        key={base}
                        className="flex gap-1 items-center text-[8px]"
                      >
                        <span className={`${baseColors[base]} font-semibold`}>
                          {abbr[base] || base}:
                        </span>
                        <span
                          className={
                            cnt > 0
                              ? 'text-green-400 font-bold'
                              : 'text-red-400 font-bold'
                          }
                        >
                          {cnt} Available
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
