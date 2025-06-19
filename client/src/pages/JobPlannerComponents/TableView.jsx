// src/pages/JobPlannerComponents/TableView.jsx

import React, { useState, useRef } from 'react';
import AuditChecklistModal from '../../components/AuditChecklistModal';

export default function TableView({
  monthGroups,
  isVisible,
  rowStatus,
  unlockedMonths,
  unlockMonth,
  handleEdit,
  handleDelete,
  handleSubmitSourcing,
  handleStatusChange,
  lockMonth,
  handleDeleteAudit,
  formatValue,
  scrollRef,
  showAuditModal,
  setShowAuditModal,
  selectedAuditJob,
  setSelectedAuditJob,
}) {
  // ─── Long‐press “hold to unlock” state ────────────────────────────────────
  const [pressState, setPressState] = useState({ monthKey: null, progress: 0 });
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const startPress = (monthKey) => {
    startTimeRef.current = Date.now();
    setPressState({ monthKey, progress: 0 });
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / 3000) * 100, 100);
      setPressState({ monthKey, progress: pct });
      if (pct >= 100) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setPressState({ monthKey: null, progress: 0 });
        unlockMonth(monthKey);
      }
    }, 50);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPressState({ monthKey: null, progress: 0 });
  };

  return (
    <div
      className="w-full rounded-lg p-0 mx-10 shadow-xl overflow-x-auto"
      style={{ zoom: 0.65, transformOrigin: 'top left' }}
    >
      <table className="table-auto w-full text-sm">
        <tbody>
          {[...monthGroups.entries()].map(([monthKey, monthJobs], idx) => {
            const visibleJobs = monthJobs.filter(isVisible);
            if (visibleJobs.length === 0) return null;

            // Compute monthly totals
            const totals = visibleJobs.reduce(
              (acc, job) => {
                acc.num_wells += Number(job.num_wells) || 0;
                acc.valve_7_1_16 += Number(job.valve_7_1_16) || 0;
                acc.valve_5_1_8 += Number(job.valve_5_1_8) || 0;
                acc.valve_hyd += Number(job.valve_hyd) || 0;
                acc.valve_man += Number(job.valve_man) || 0;
                acc.gateway_pods += Number(job.gateway_pods) || 0;
                acc.awc_pods += Number(job.awc_pods) || 0;
                acc.grease_unit += Number(job.grease_unit) || 0;
                acc.coil_trees += Number(job.coil_trees) || 0;
                acc.accumulator += Number(job.accumulator) || 0;
                acc.techs += Number(job.techs) || 0;
                return acc;
              },
              {
                num_wells: 0,
                valve_7_1_16: 0,
                valve_5_1_8: 0,
                valve_hyd: 0,
                valve_man: 0,
                gateway_pods: 0,
                awc_pods: 0,
                grease_unit: 0,
                coil_trees: 0,
                accumulator: 0,
                techs: 0,
              }
            );

            const monthUnlocked = unlockedMonths[monthKey];
            const isEarliest = idx === 0;

            return (
              <React.Fragment key={monthKey}>
                {/* ── Month Header ─────────────────────────────────── */}
                <tr
                  className="bg-black border-4 border-white"
                  ref={isEarliest ? scrollRef : null}
                >
                  <td
                    colSpan="20"
                    className="px-4 py-4 text-center font-erbaum uppercase text-6xl font-bold text-yellow-200"
                  >
                    {monthKey}
                  </td>
                </tr>

                {/* ── Column Headers ───────────────────────────────── */}
                <tr className="bg-black border border-white text-base text-white">
                  {[
                    'Customer',
                    'LSD',
                    'Product(s)',
                    'Rig-In',
                    'Start',
                    'End',
                    '# Wells',
                    `7-1/16" Valves`,
                    `5-1/8" Valves`,
                    `3-1/16" HYD`,
                    `3-1/16" MAN`,
                    'Gateway Pods',
                    'AWC',
                    'Grease',
                    'Coil Trees',
                    'Accumulator',
                    'Techs',
                    'Work Orders',
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 border border-white text-center font-bold"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-2 border border-white text-center font-bold">
                    Audit File
                  </th>
                  <th className="px-4 py-2 border border-white text-center font-bold">
                    {monthUnlocked ? (
                      <button
                        onClick={() => {
                          Object.keys(rowStatus).forEach((jobId) => {
                            const job = monthJobs.find((j) => j.id === jobId);
                            if (job && isVisible(job)) {
                              handleStatusChange(job.id, 'completed');
                            }
                          });
                          lockMonth(monthKey);
                        }}
                        className="bg-red-600 text-white font-bold px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        🔒 Lock
                      </button>
                    ) : (
                      <button
                        onPointerDown={() => startPress(monthKey)}
                        onPointerUp={cancelPress}
                        onPointerLeave={cancelPress}
                        className="relative bg-black text-white text-xl font-bold px-5 py-1 rounded transition border border-[#6a7257] overflow-hidden"
                      >
                        <span className="relative z-10">HOLD 3s TO UNLOCK</span>
                        {pressState.monthKey === monthKey && (
                          <div
                            className="absolute inset-y-0 left-0 bg-green-800"
                            style={{ width: `${pressState.progress}%` }}
                          />
                        )}
                      </button>
                    )}
                  </th>
                </tr>

                {/* ── Job Rows ───────────────────────────────────────── */}
                {visibleJobs.map((job, idx2) => {
                  const isEven = idx2 % 2 === 0;
                  let rowClass = isEven ? 'bg-black' : 'bg-[#6a7257]/60';
                  let textColor = 'text-2xl';

                  if (rowStatus[job.id] === 'in-progress') {
                    rowClass = 'bg-blue-900';
                  } else if (rowStatus[job.id] === 'completed') {
                    rowClass = 'bg-green-950';
                  } else if (rowStatus[job.id] === 'not-locked') {
                    rowClass = 'bg-yellow-900';
                    textColor = 'text-gray-900';
                  }

                  return (
                    <tr key={job.id} className={rowClass}>
                      {/* Customer */}
                      <td className="px-3 py-2 border-2 border-white bg-white rounded text-xs font-bold text-grey">
                        <div className="flex flex-col items-center">
                          <img
                            src={`/assets/logos/${job.customer
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, '')}.png`}
                            alt={`${job.customer} logo`}
                            className="h-16 w-30 object-contain drop-shadow-xl rounded-md hover:scale-105 transition-transform duration-300"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      </td>
                      {/* LSD */}
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {job.surface_lsd || '-'}
                      </td>
                      {/* Products */}
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {job.products || '-'}
                      </td>
                      {/* Dates */}
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {job.rig_in_date || '-'}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {job.start_date || '-'}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {job.end_date || '-'}
                      </td>
                      {/* Counts */}
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.num_wells)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.valve_7_1_16)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.valve_5_1_8)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.valve_hyd)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.valve_man)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.gateway_pods)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.awc_pods)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.grease_unit)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.coil_trees)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.accumulator)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.techs)}
                      </td>
                      <td
                        className={`px-4 py-2 border border-white text-center font-bold ${textColor}`}
                      >
                        {formatValue(job.work_orders)}
                      </td>
                      {/* Audit File */}
                      <td className="px-4 py-2 border border-white text-center space-x-2">
                        {job.auditChecklistUrl ? (
                          <>
                            <button
                              onClick={() =>
                                window.open(`http://localhost:3001${job.auditChecklistUrl}`, '_blank')
                              }
                              className="px-2 py-1 bg-black border border-fly-blue text-fly-blue rounded"
                            >
                              View Audit
                            </button>
                            <button
                              onClick={() => handleDeleteAudit(job.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded"
                            >
                              Delete File
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => { setSelectedAuditJob(job); setShowAuditModal(true); }}
                            className="px-4 py-2 bg-black border uppercase font-erbaum border-[#6a7257] text-[#6a7257] text-lg font-bold rounded"
                          >
                            Upload Audit
                          </button>
                        )}
                      </td>
                      {/* Actions */}
                      <td
                        className={`px-4 py-2 border border-white text-center w-48 ${
                          !monthUnlocked ? 'bg-black' : ''
                        }`}
                      >
                        {monthUnlocked ? (
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              const action = e.target.value;
                              e.target.value = '';
                              if (action === 'edit') handleEdit(job);
                              else if (action === 'delete') handleDelete(job.id);
                              else if (action === 'submitSourcing') handleSubmitSourcing(job);
                              else handleStatusChange(job.id, action);
                            }}
                            className="w-[200px] h-[84px] bg-black border border-[#6a7257] text-white text-xl font-bold rounded text-center whitespace-normal leading-tight flex items-center justify-center"
                          >
                            <option value="">Choose an Action</option>
                            <option value="edit">Edit</option>
                            <option value="delete">Delete</option>
                            <option value="" disabled style={{ fontStyle: 'italic' }}>
                              ── Other Actions ──
                            </option>
                            <option value="submitSourcing">Submit Sourcing Ticket</option>
                            <option
                              value="in-progress"
                              style={{ backgroundColor: '#2563EB', color: 'white' }}
                            >
                              In Progress
                            </option>
                            <option
                              value="not-locked"
                              style={{ backgroundColor: '#D97706', color: 'white' }}
                            >
                              Not Yet Locked
                            </option>
                            <option
                              value="completed"
                              style={{ backgroundColor: '#16A34A', color: 'white' }}
                            >
                              Completed
                            </option>
                          </select>
                        ) : (
                          <span className="font-bold text-4xl text-red-600">🔒</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* ── Monthly Totals Row ───────────────────────────────── */}
                <tr className="bg-black border border-white text-white text-xl font-bold">
                  <td className="px-4 py-2">Monthly Totals</td>
                  <td colSpan="5" />
                  <td className="px-4 py-2 text-center">{totals.num_wells.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.valve_7_1_16.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.valve_5_1_8.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.valve_hyd.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.valve_man.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.gateway_pods.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.awc_pods.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.grease_unit.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.coil_trees.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.accumulator.toFixed(0)}</td>
                  <td className="px-4 py-2 text-center">{totals.techs.toFixed(0)}</td>
                  <td />
                  <td />
                </tr>

                {/* ── Spacer Between Months ──────────────────────────── */}
                <tr className="h-10">
                  <td colSpan="20" />
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* ── Upload Modal ───────────────────────────────────── */}
      <AuditChecklistModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        job={selectedAuditJob}
      />
    </div>
  );
}
