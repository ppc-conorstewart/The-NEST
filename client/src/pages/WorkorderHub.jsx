// src/pages/WorkorderHub.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api';

// ─── Workorder generator imports ────────────────────────────────────────
import WorkorderCard from '../components/WorkorderCard';
import WorkorderForm from '../components/WorkorderForm';
import { transformJobToPackage } from '../workorderData';

export default function WorkorderHub() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);
  const [groupedJobs, setGroupedJobs] = useState({});
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/jobs`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        // filter out monthly totals
        const filtered = data.filter(job => {
          const name = (job.customer || job.Customer || '').trim().toLowerCase();
          return name !== 'monthly totals';
        });

        // sort by rig-in date
        const sorted = filtered.slice().sort((a, b) => {
          const aDate = new Date(a.rig_in_date || a.rigInDate || '');
          const bDate = new Date(b.rig_in_date || b.rigInDate || '');
          if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
          if (!isNaN(aDate)) return -1;
          if (!isNaN(bDate)) return 1;
          return 0;
        });

        // dedupe on LSD
        const unique = [];
        const seen = new Set();
        for (let job of sorted) {
          const lsd = (job.surface_lsd || job.surfaceLSD || '').trim();
          if (lsd && !seen.has(lsd)) {
            seen.add(lsd);
            unique.push(job);
          }
        }
        setJobs(unique);

        // group by month-year
        const groups = {};
        unique.forEach(job => {
          const d = new Date(job.rig_in_date || job.rigInDate || '');
          if (isNaN(d)) return;
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(job);
        });

        // sort tabs
        const keys = Object.keys(groups).sort((a, b) => {
          const [ay, am] = a.split('-').map(Number);
          const [by, bm] = b.split('-').map(Number);
          return ay !== by ? ay - by : am - bm;
        });

        setGroupedJobs(groups);
        setTabs(keys);

        // default to current month
        const now = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        setSelectedTab(keys.includes(currentKey) ? currentKey : (keys[0] || ''));
      })
      .catch(err => setError(err));
  }, []);

  if (error) {
    return (
      <div className="relative min-h-screen bg-[#6a7257] p-8 text-red-500">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 px-3 py-1 bg-[#6a7257] text-black font-bold rounded-md"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-extrabold text-black text-center">
          WORKORDER HUB
        </h1>
        <p>Error fetching jobs: {error.message}</p>
      </div>
    );
  }

  if (jobs === null) {
    return (
      <div
        className="relative ml-12 min-h-screen p-8 text-white"
        style={{
          backgroundImage: "url('/assets/dark-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 px-3 py-1 bg-[#6a7257] text-black font-bold rounded-md"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-extrabold text-black text-center mb-4">
          WORKORDER HUB
        </h1>
        <p>Loading jobs…</p>
      </div>
    );
  }

  const getMonthYear = ym => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleStartWorkorder = job => {
    const packageData = transformJobToPackage(job);
    setDraft(packageData);
  };

  return (
    <div
      className="relative ml-12 min-h-screen p-8 text-white"
      style={{
        backgroundImage: "url('/assets/dark-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div style={{ zoom: 0.75, transformOrigin: 'top center' }}>
        <h1 className="text-4xl font-extrabold text-white text-center mb-8">
          WORKORDER HUB
        </h1>

        {tabs.length === 0 ? (
          <p className="mt-4 text-lg text-center">No jobs found.</p>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2 justify-center">
              {tabs.map(key => {
                const active = key === selectedTab;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTab(key)}
                    className={
                      `px-4 py-2 rounded-md font-medium ` +
                      (active
                        ? 'bg-[#6a7257] text-black'
                        : 'bg-[#333] text-white hover:bg-[#444]')
                    }
                  >
                    {getMonthYear(key)}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {groupedJobs[selectedTab]?.map(job => {
                const cust = (job.customer || job.Customer || '').trim();
                const lsd  = (job.surface_lsd || job.surfaceLSD || '').trim();
                const keyName = `workorderProgress_${cust.replace(/\s+/g, '-')}_${lsd}`;
                const inProg = cust && lsd && !!localStorage.getItem(keyName);
                const revision = inProg ? 'REV - A' : 'N/A';

                return (
                  <WorkorderCard
                    key={lsd || job.id}
                    job={job}
                    inProgress={inProg}
                    currentRevision={revision}
                    onStart={handleStartWorkorder}
                    onEdit={handleStartWorkorder}
                    onSubmit={handleStartWorkorder}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {draft && (
        <WorkorderForm
          initialData={draft}
          onClose={() => setDraft(null)}
        />
      )}
    </div>
  );
}
