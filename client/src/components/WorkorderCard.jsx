// src/components/WorkorderCard.jsx

import React, { useState, useEffect } from 'react';

export default function WorkorderCard({
  job,
  onStart,
  onEdit = () => {},
  onSubmit = () => {},
}) {
  // derive customer & LSD
  const customer = (job.customer || job.Customer || job.client || '').trim();
  const surfaceLSD = (job.surface_lsd || job.surfaceLSD || job.lsd || '').trim();

  // key must match WorkorderForm’s storageKey
  const jobKey = `${customer.replace(/\s+/g, '-')}_${surfaceLSD}`;
  const storageKey = `workorderProgress_${jobKey}`;

  // track saved-progress flag
  const [inProgress, setInProgress] = useState(false);
  useEffect(() => {
    setInProgress(!!localStorage.getItem(storageKey));
  }, [storageKey]);

  // display fields
  const date = job.rig_in_date || job.rigInDate || 'N/A';
  const wells = job.num_wells ?? job.numberOfWells ?? 'N/A';

  // revision text
  const revision = inProgress ? 'REV - A' : 'N/A';

  return (
    <div className="bg-[#111] p-4 rounded-md border-2 border-[#6a7257] flex flex-col justify-between text-sm">
      <div className="mb-3 text-center">
        <h2 className="text-xl font-bold text-[#6a7257]">{customer || 'Unknown'}</h2>
        <p className="text-gray-300 mt-1">
          <span className="font-semibold">LSD:</span> {surfaceLSD || 'N/A'}
        </p>
        <p className="text-gray-300 mt-1">
          <span className="font-semibold">Rig-in Date:</span> {date}
        </p>
        <p className="text-gray-300 mt-1">
          <span className="font-semibold">Month:</span>{' '}
          {isNaN(Date.parse(date))
            ? 'N/A'
            : new Date(date).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
        </p>
        <p className="text-gray-300 mt-1">
          <span className="font-semibold">Wells:</span> {wells}
        </p>
        <p className="mt-1 text-sm">
          <span className="font-bold text-white">Current Workorder:&nbsp;</span>
          {revision === 'N/A' ? (
            <span className="font-semibold text-gray-400">{revision}</span>
          ) : (
            <span className="font-semibold text-red-500">{revision}</span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {inProgress ? (
          <div className="inline-block px-3 py-1 bg-blue-500 text-black font-bold rounded text-center">
            In-Progress
          </div>
        ) : (
          <button
            onClick={() => onStart(job)}
            className="bg-[#6a7257] text-black font-bold px-3 py-1 rounded-md hover:bg-[#5c634a] transition text-sm"
          >
            Create Preliminary Workorder
          </button>
        )}

        <button
          onClick={() => onEdit(job)}
          disabled={!inProgress}
          className={`bg-[#333] text-white font-bold px-3 py-1 rounded-md text-sm transition ${
            !inProgress
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#444]'
          }`}
        >
          Edit Current Workorder
        </button>

        <button
          onClick={() => onSubmit(job)}
          disabled={!inProgress}
          className={`bg-[#333] text-white font-bold px-3 py-1 rounded-md text-sm transition ${
            !inProgress
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#444]'
          }`}
        >
          Submit Completed Workorder
        </button>
      </div>
    </div>
  );
}
