// src/pages/JobPlannerComponents/FilterBar.jsx

import React from 'react';

export default function FilterBar({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  monthGroups,
  selectedMonth,
  setSelectedMonth,
}) {
  return (
    <div className="flex gap-4 mb-4">
      {/* Customer Filter */}
      <select
        value={selectedCustomer}
        onChange={(e) => setSelectedCustomer(e.target.value)}
        className="bg-black border border-white px-2 py-1 text-white"
      >
        <option value="">All Customers</option>
        {customers.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Month Filter */}
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="bg-black border border-white px-2 py-1 text-white"
      >
        <option value="">All Months</option>
        {Object.keys(monthGroups).map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
);
}
