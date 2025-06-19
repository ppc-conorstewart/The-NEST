import React, { useState, useMemo } from 'react';

export default function BOMPage({
  bomItems,
  consumables = [],
  dfitBuildQtys = [],
  umaBuildQtys = []
}) {
  const [activeTab, setActiveTab] = useState('assets');

  // Set of codes in consumables
  const consumableSet = useMemo(
    () => new Set(consumables.map(c => c.name)),
    [consumables]
  );

  // Assets only
  const assetItems = useMemo(
    () => bomItems.filter(i => !consumableSet.has(i.description)),
    [bomItems, consumableSet]
  );

  // Unique consumables grouped & multiplied once
  const consumableItems = useMemo(() => {
    const agg = {};
    consumables.forEach(({ name, qty, page, tab }) => {
      if (agg[name] !== undefined) return;
      const multArr = page === 'DFIT' ? dfitBuildQtys : umaBuildQtys;
      const mult = multArr[tab] || 0;
      agg[name] = qty * mult;
    });
    return Object.entries(agg)
      .map(([name, quantity]) => ({
        name,
        quantity: Math.round(quantity)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [consumables, dfitBuildQtys, umaBuildQtys]);

  return (
    <div className="flex flex-col h-full w-full text-center uppercase overflow-auto text-[18px]">
      <div className=" border-b align-center border-gray-700 mb-2">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 uppercase font-bold ${
            activeTab === 'assets'
              ? 'border-b-2 border-[#6a7257] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Assets
        </button>
        <button
          onClick={() => setActiveTab('consumables')}
          className={`px-4 py-2 uppercase font-bold ${
            activeTab === 'consumables'
              ? 'border-b-2 border-[#6a7257] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Consumables
        </button>
      </div>

      {activeTab === 'assets' ? (
        <div className="overflow-auto flex-grow">
          <table className="min-w-half backdrop-blur-xl divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-2 text-left text-gray-400 uppercase">
                  Asset
                </th>
                <th className="px-6 py-2 text-right text-gray-400 uppercase">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {assetItems.map((item, i) => (
                <tr key={i} className="hover:bg-gray-800">
                  <td className="px-6 py-1 text-0.5rem text-xs uppercase text-blue-400">{item.description}</td>
                  <td className="px-6 py-2 text-right text-white">
                    {Math.round(item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-auto flex-grow space-y-2 p-4">
          {consumableItems.map((c, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-800 p-2 rounded"
            >
              <span className="text-white">{c.name}</span>
              <span className="text-white">{c.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
