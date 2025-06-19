// src/components/AssetTable.jsx
import React from 'react';

/**
 * Props:
 * - assets: array of asset objects to display (already paginated)
 * - selectedIds: array of selected asset IDs
 * - onToggle: (id) => void, toggle single checkbox
 * - onToggleAll: () => void, toggle header checkbox
 * - onSort: (key) => void, when a column header is clicked
 * - sortConfig: { key, direction }
 * - headerLabels: object mapping field → display label
 * - onEdit: (asset) => void, when “Edit” button clicked
 * - onDelete: (asset) => void, when “Delete” button clicked
 * - deleteButtonStyle: style object for the Delete button
 */
export default function AssetTable({
  assets,
  selectedIds,
  onToggle,
  onToggleAll,
  onSort,
  sortConfig,
  headerLabels,
  onEdit,
  onDelete,
  deleteButtonStyle,
}) {
  // Determine if header checkbox should be checked
  const allOnPageSelected =
    assets.length > 0 && assets.every((a) => selectedIds.includes(a.id));

  return (
    <div className="w-full backdrop-blur-xl  p-0 shadow-xl overflow-x-auto ">
      <table className="w-full table-auto text-xs text-left bg-black">
        <thead className="bg-black text-center  text-[#6a7257] sticky top-0">
          <tr>
            <th className="px-2 py-2 border border-[#6a7257]">
              <input
                type="checkbox"
                onChange={onToggleAll}
                checked={allOnPageSelected}
              />
            </th>
            {Object.keys(headerLabels).map((key) => (
              <th
                key={key}
                className="px-4 py-2 border border-[#6a7257] cursor-pointer"
                onClick={() => onSort(key)}
              >
                {headerLabels[key]}{' '}
                {sortConfig.key === key
                  ? sortConfig.direction === 'ascending'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            ))}
            <th className="px-4 py-2 border border-[#6a7257]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, idx) => {
            const zebraBg = idx % 2 === 0 ? 'bg-[#0b1320]' : 'bg-[#1a1c23]';
            return (
              <tr key={asset.id} className={`${zebraBg} hover:bg-[#222] transition`}>
                <td className="px-2 py-2 border border-[#6a7257]">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(asset.id)}
                    onChange={() => onToggle(asset.id)}
                  />
                </td>
                {Object.keys(headerLabels).map((field) => (
                  <td key={field} className="px-4 py-2 border border-[#6a7257]">
                    {asset[field]}
                  </td>
                ))}
                <td className="px-4 py-2 border border-[#6a7257] flex space-x-2">
                  {/* Edit button */}
                  <button
                    onClick={() => onEdit(asset)}
                    className="bg-black text-white font-bold px-3 py-1 rounded hover:bg-gray-800 transition"
                  >
                    Edit
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(asset)}
                    style={deleteButtonStyle}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
          {assets.length === 0 && (
            <tr>
              <td
                colSpan={Object.keys(headerLabels).length + 2}
                className="text-center text-gray-400 py-6 border border-fly-blue bg-black"
              >
                No assets found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
