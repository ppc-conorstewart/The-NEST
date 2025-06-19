// src/components/DFITPage.jsx

import React from 'react';
import Select from 'react-select';
import Consumables from './Consumables'; // <- Ensure this is imported

export default function DFITPage({
  metadata,
  assets,
  buildQtys,
  setBuildQtys,
  activeTab,
  setActiveTab,
  handleChange,
  baseColors,
  addConsumable,
  savedItems,
  setSavedItems
}) {
  const abbr = { 'Red Deer': 'RD', 'Grand Prairie': 'GP', Nisku: 'NIS' };
  const grouped = Object.entries(
    assets.reduce((acc, a) => {
      acc[a.name] = (acc[a.name] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const assetOptions = grouped.map((a) => ({
    value: a.name,
    label: (
      <span className="flex justify-between">
        <span>{a.name}</span>
        <span className="text-blue-400">({a.count})</span>
      </span>
    )
  }));

  const toggleVoid = (n) =>
    handleChange(`void${n}`, !metadata[`void${n}`]);

  return (
    <div className="flex flex-col h-full overflow-hidden text-[10px]">
      {/* Header row: Build QTY & Tabs */}
      <div className="flex justify-between items-center mb-2 px-4">
        <div className="flex items-center">
          <label className="text-[10px] text-white mr-1">Build QTY:</label>
          <input
            type="number"
            step="1"
            min="0"
            value={buildQtys[activeTab]}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10) || 0;
              setBuildQtys((p) => p.map((x, i) => (i === activeTab ? v : x)));
            }}
            className="w-12 text-[10px] px-1 py-1 rounded bg-black border border-gray-700 text-white"
          />
        </div>
        <div className="flex gap-1">
          {['DFIT-1', 'DFIT-2'].map((lbl, i) => (
            <button
              key={lbl}
              onClick={() => setActiveTab(i)}
              className={`px-2 py-1 text-[9px] rounded ${
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

      {/* Consumables Panel */}
      <div className="flex mb-4 px-4">
        <Consumables
          buildQty={buildQtys[activeTab]}
          activeTab={activeTab}
          page="DFIT"
          addConsumable={addConsumable}
          savedItems={savedItems}
          setSavedItems={setSavedItems}
        />

        {/* Schematic Display */}
        <div className="flex-1 flex justify-center items-center">
          <div
            className="relative bg-gray-800 p-2 rounded-lg shadow-xl border-2 border-[#6a7257]"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(60,60,60,0.6), #000)',
              width: '16rem',
              height: '16rem'
            }}
          >
            <div
              className="absolute justify-center inset-0"
              style={{
                backgroundImage: "url('/assets/blueprint-grid.png')",
                backgroundSize: 'cover',
                opacity: 0.1,
                pointerEvents: 'none'
              }}
            />
            <img
              src="/assets/DFIT-Schematic.png"
              alt="DFIT Schematic"
              className="h-full w-full object-contain"
              onError={(e) => (e.target.style.display = 'none')}
            />
          </div>
        </div>
      </div>

      {/* Location Selectors */}
      <div className="overflow-y-auto justify-center text-center  pr-0 px-0">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const key = `location${n}`;
          const sel = metadata[key];
          const isVoid = !!metadata[`void${n}`];

          const summary = {};
          assets
            .filter((a) => a.name === sel && a.status === 'Available')
            .forEach((a) => {
              summary[a.location] = (summary[a.location] || 0) + 1;
            });
          const inUse = assets.filter(
            (a) => a.name === sel && /in[\s-]?use/i.test(a.status)
          ).length;

          return (
            <div key={n} className="mb-0 justify-center ">
              <div className=" ">
                <span className="text-[#6a7257] uppercase text-[8px] font-semibold">
                  Location #{n}
                </span>
                <div className="flex items-right w-1/3 ">
                  <span
                    onClick={() => toggleVoid(n)}
                    className="text-red-500 cursor-pointer mr-2 text-lg select-none"
                    title="Void this location"
                  >
                    ×
                  </span>

                  {isVoid ? (
                    <div className="w-full text-center text-[5px] text-[#6a7257] font-bold bg-white border border-gray-700 rounded py-1">
                      VOID
                    </div>
                  ) : (
                    <Select
                      options={assetOptions}
                      value={assetOptions.find((o) => o.value === sel) || null}
                      onChange={(o) => handleChange(key, o?.value || '')}
                      isClearable
                      placeholder="Select asset..."
                      className="w-full text-[8px]"
                      styles={{
                        control: (s) => ({
                          ...s,
                          backgroundColor: 'black',
                          borderColor: '#374151',
                          minHeight: '1.25rem',
                          fontSize: '0.65rem',
                        }),
                        singleValue: (s) => ({ ...s, color: 'white' }),
                        input: (s) => ({ ...s, color: 'white' }),
                        menu: (s) => ({ ...s, backgroundColor: '#111' }),
                        option: (s, { isFocused }) => ({
                          ...s,
                          backgroundColor: isFocused ? '#374151' : '#111',
                          color: 'white'
                        }),
                        menuPortal: (b) => ({ ...b, zIndex: 9999 })
                      }}
                      menuPortalTarget={document.body}
                      menuPlacement="auto"
                      menuPosition="fixed"
                      maxMenuHeight={240}
                    />
                  )}
                </div>
              </div>

              {!isVoid && sel && (
                <div className="text-[8px] leading-tight text-gray-400 mt-1 sm:w-2/3  text-right">
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
