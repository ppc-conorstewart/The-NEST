// src/components/ActivityLogTable.jsx

import React from 'react';
import { FILTER_KEYS } from '../constants/assetFields';

/**
 * Props:
 * - logs: array of activity log objects (from /api/activity)
 * - assetNameMap: object mapping asset IDs → current asset name
 */
export default function ActivityLogTable({ logs, assetNameMap }) {
  return (
    <div className="mt-10 bg-[#111] p-6 rounded-lg shadow-xl overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Activity Log</h2>
      <table className="w-full table-auto text-sm text-left">
        <thead className="bg-gray-700 text-white sticky top-0">
          <tr>
            <th className="px-4 py-2">Timestamp (User)</th>
            <th className="px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log) => {
              let detailsObj = {};
              try {
                detailsObj = JSON.parse(log.details);
              } catch {
                detailsObj = {};
              }

              let descriptionNode = null;

              // 1) Batch‐transfer entry:
              //    either action === "Transferred Multiple Assets"
              //    or action === "Update Multiple Assets"
              if (
                (log.action === 'Transferred Multiple Assets' ||
                  log.action === 'Update Multiple Assets') &&
                Array.isArray(detailsObj.items) &&
                detailsObj.newLocation
              ) {
                const itemListNodes = detailsObj.items.map((x, idx) => (
                  <span key={x.id + idx}>
                    <span className="text-red-500">{x.id}</span> ({x.name})
                    {idx < detailsObj.items.length - 1 ? ', ' : ''}
                  </span>
                ));
                descriptionNode = (
                  <div className="whitespace-pre-line">
                    <div>Shop to Shop Transfer:</div>
                    <div>
                      Transferred Assets {itemListNodes} to{' '}
                      {detailsObj.newLocation}
                    </div>
                  </div>
                );
              }
              // 2) Single‐asset “Updated Asset” entry (edits vs. transfer)
              else if (log.action === 'Updated Asset') {
                const assetId = log.asset_id;
                const existingName = assetNameMap[assetId] || 'Unknown';

                // If location changed, treat as a transfer:
                if (detailsObj.newLocation || detailsObj.location) {
                  const toLoc = detailsObj.newLocation || detailsObj.location;
                  descriptionNode = (
                    <div className="whitespace-pre-line">
                      <div>Shop to Shop Transfer:</div>
                      <div>
                        Transferred Asset{' '}
                        <span className="text-red-500">{assetId}</span> (
                        {existingName}) to {toLoc}
                      </div>
                    </div>
                  );
                } else {
                  // Otherwise, list each changed field under "Asset Edited"
                  const changes = [];
                  FILTER_KEYS.forEach((key) => {
                    // If the key exists in detailsObj and isn't empty…
                    if (
                      key in detailsObj &&
                      detailsObj[key] !== undefined &&
                      detailsObj[key] !== '' &&
                      // For "name", compare to existingName; for other fields we just show them
                      (key !== 'name' || detailsObj[key] !== existingName)
                    ) {
                      changes.push(
                        `${key.charAt(0).toUpperCase() + key.slice(1)} → ${
                          detailsObj[key]
                        }`
                      );
                    }
                  });
                  const changesText = changes.join(', ');
                  descriptionNode = (
                    <div className="whitespace-pre-line">
                      <div>Asset Edited:</div>
                      <div>
                        <span className="text-red-500">{assetId}</span> (
                        {existingName}){' '}
                        {changesText ? `fields: ${changesText}` : ''}
                      </div>
                    </div>
                  );
                }
              }
              // 3) “Added Asset” entry: match either "Add Asset" or "Added Asset"
              else if (
                (log.action === 'Added Asset' || log.action === 'Add Asset') &&
                (detailsObj.location || detailsObj.newLocation)
              ) {
                const assetId = log.asset_id;
                const location = detailsObj.location || detailsObj.newLocation;
                const name =
                  detailsObj.name || assetNameMap[assetId] || 'Unknown';
                descriptionNode = (
                  <div className="whitespace-pre-line">
                    Added Asset{' '}
                    <span className="text-red-500">{assetId}</span> ({name}) to{' '}
                    {location}
                  </div>
                );
              }
              // 4) “Deleted Asset” entry
              else if (log.action === 'Deleted Asset') {
                const assetId = log.asset_id;
                const name = detailsObj.name || assetNameMap[assetId] || 'Unknown';
                const location = detailsObj.location || 'Unknown';
                descriptionNode = (
                  <div className="whitespace-pre-line">
                    Deleted Asset{' '}
                    <span className="text-red-500">{assetId}</span> ({name}) from{' '}
                    {location}
                  </div>
                );
              }
              // 5) Fallback for any other action or invalid/malformed JSON
              else {
                descriptionNode = (
                  <div>
                    {log.action} {log.asset_id} – {log.details}
                  </div>
                );
              }

              return (
                <tr key={log.id} className="hover:bg-[#222] transition">
                  <td className="px-4 py-2">
                    {new Date(log.timestamp).toLocaleString()} ({log.user})
                  </td>
                  <td className="px-4 py-2">{descriptionNode}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="2" className="text-center text-gray-400 py-6">
                No activity recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
