// src/components/Consumables.jsx

import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const gasketOptions = [
  { value: 'BX-156', label: 'BX-156' },
  { value: 'BX-169', label: 'BX-169' },
  { value: 'BX-155', label: 'BX-155' },
  { value: 'BX-154', label: 'BX-154' }
];

const boltupOptions = [
  { value: '5-1/8" 15K - Standard Bolt-up', label: '5-1/8" 15K - Standard Bolt-up' },
  { value: '5-1/8" 15K - INST Flange Bolt-up', label: '5-1/8" 15K - INST Flange Bolt-up' },
  { value: '7-1/16" 15K - Standard Bolt-up', label: '7-1/16" 15K - Standard Bolt-up' },
  { value: '7-1/16" 15K - INST Flange Bolt-up', label: '7-1/16" 15K - INST Flange Bolt-up' },
  { value: '4-1/16" 15K - Standard Bolt-up', label: '4-1/16" 15K - Standard Bolt-up' },
  { value: '3-1/16" 15K - Standard Bolt-up', label: '3-1/16" 15K - Standard Bolt-up' }
];

const selectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: 'black',
    borderColor: '#6a7257',
    fontSize: '0.6rem',
    height: '1.1rem',
    minHeight: '1.1rem',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 4,
    paddingRight: 4,
    alignItems: 'center',
    display: 'flex',
    boxShadow: 'none'
  }),
  valueContainer: (base) => ({
    ...base,
    padding: 0,
    height: '1.1rem',
    display: 'flex',
    alignItems: 'center'
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white',
    fontSize: '0.6rem',
    lineHeight: '1rem'
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#111',
    fontSize: '0.6rem'
  }),
  option: (base, { isFocused }) => ({
    ...base,
    backgroundColor: isFocused ? '#374151' : '#111',
    color: 'white',
    fontSize: '0.6rem'
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0 2px',
    height: '1rem'
  }),
  indicatorSeparator: () => null
};

export default function Consumables({
  buildQty,
  activeTab,
  page,
  addConsumable,
  savedItems = { gaskets: [], boltups: [] },
  setSavedItems
}) {
  const [gaskets, setGaskets] = useState([]);
  const [boltups, setBoltups] = useState([]);
  const [gasketSelect, setGasketSelect] = useState(null);
  const [boltupSelect, setBoltupSelect] = useState(null);

  useEffect(() => {
    setGaskets(savedItems?.gaskets || []);
    setBoltups(savedItems?.boltups || []);
  }, [savedItems]);

  const syncToParent = (g = gaskets, b = boltups) => {
    setSavedItems({ gaskets: g, boltups: b });
  };

  const handleAddGasket = (o) => {
    if (!o) return;
    const next = [...gaskets, { code: o.value, qty: 1 }];
    setGaskets(next);
    syncToParent(next, boltups);
    addConsumable(o.value, 1, page, activeTab);
    setGasketSelect(null);
  };

  const updateGasketQty = (i, v) => {
    const q = parseInt(v, 10) || 0;
    const updated = gaskets.map((g, idx) => (idx === i ? { ...g, qty: q } : g));
    setGaskets(updated);
    syncToParent(updated, boltups);
  };

  const removeGasket = (i) => {
    const updated = gaskets.filter((_, idx) => idx !== i);
    setGaskets(updated);
    syncToParent(updated, boltups);
  };

  const handleAddBoltup = (o) => {
    if (!o) return;
    const next = [...boltups, { code: o.value, qty: 1 }];
    setBoltups(next);
    syncToParent(gaskets, next);
    addConsumable(o.value, 1, page, activeTab);
    setBoltupSelect(null);
  };

  const updateBoltupQty = (i, v) => {
    const q = parseInt(v, 10) || 0;
    const updated = boltups.map((b, idx) => (idx === i ? { ...b, qty: q } : b));
    setBoltups(updated);
    syncToParent(gaskets, updated);
  };

  const removeBoltup = (i) => {
    const updated = boltups.filter((_, idx) => idx !== i);
    setBoltups(updated);
    syncToParent(gaskets, updated);
  };

  return (
    <div
      className="flex-shrink-0 bg-black rounded border-[#6a7257] border p-2 flex flex-col font-[Inter] leading-tight"
      style={{ width: '13.5rem', height: '16rem' }}
    >
      <h3 className="text-[#6a7257] font-bold uppercase text-base font-erbaum text-center mb- tracking-tight">
        Consumables
      </h3>
      <p className="text-[3px] text-center mb-1">(QTY's Per 1X Build)</p>

      {/* Gaskets */}
      <div className="flex flex-col mb-1 space-y-[1px]">
        <h4 className="text-[6px] text-center underline text-[#6a7257] uppercase">GASKETS</h4>
        <Select
          options={gasketOptions}
          value={gasketSelect}
          onChange={handleAddGasket}
          placeholder="+ Add"
          styles={selectStyles}
          className="text-[6px] mt-0"
        />
        {gaskets.map((g, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => removeGasket(i)}
              className="text-red-500 text-xs leading-none mr-1 select-none"
              title="Remove"
            >
              ×
            </button>
            <span className="text-[6px] flex-1 truncate">{g.code}</span>
            <input
              type="number"
              min="0"
              step="1"
              value={g.qty}
              onChange={(e) => updateGasketQty(i, e.target.value)}
              className="w-8 text-[6px] px-1 py-0.5 bg-black border border-gray-700 text-white rounded ml-1"
            />
          </div>
        ))}
      </div>

      {/* Bolt-Ups */}
      <div className="flex flex-col space-y-[1px]">
        <h4 className="text-[6px] underline text-center text-[#6a7257] uppercase">BOLT-UP</h4>
        <Select
          options={boltupOptions}
          value={boltupSelect}
          onChange={handleAddBoltup}
          placeholder="+ Add"
          styles={selectStyles}
          className="text-[6px] mt-0"
        />
        {boltups.map((b, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => removeBoltup(i)}
              className="text-red-500 text-xs leading-none mr-1 select-none"
              title="Remove"
            >
              ×
            </button>
            <span className="text-[6px] flex-1 truncate">{b.code}</span>
            <input
              type="number"
              min="0"
              step="1"
              value={b.qty}
              onChange={(e) => updateBoltupQty(i, e.target.value)}
              className="w-8 text-[6px] px-1 py-0.5 bg-black border border-gray-700 text-white rounded ml-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
