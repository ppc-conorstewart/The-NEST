// src/pages/JobPlanner.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api';   
import FilterBar from './JobPlannerComponents/FilterBar';
import ViewToggleButtons from './JobPlannerComponents/ViewToggleButtons';
import TableView from './JobPlannerComponents/TableView';
import CalendarView from './JobPlannerComponents/CalendarView';
import JobModal from './JobPlannerComponents/JobModal';
import SourcingModal from './JobPlannerComponents/SourcingModal';

const logo = '/assets/flyhq-logo.png';
const PASSWORD = 'Bird*';

export default function JobPlanner() {
  const navigate = useNavigate();

  // ─── STATE ──────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedTableMonth, setSelectedTableMonth] = useState('');
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState('');
  const [newJob, setNewJob] = useState({
    id: null,
    customer: '',
    surface_lsd: '',
    products: '',
    rig_in_date: '',
    start_date: '',
    end_date: '',
    num_wells: '',
    valve_7_1_16: '',
    valve_5_1_8: '',
    valve_hyd: '',
    valve_man: '',
    gateway_pods: '',
    awc_pods: '',
    grease_unit: '',
    coil_trees: '',
    accumulator: '',
    techs: '',
    work_orders: '',
    status: '',
  });

  // Track each row's status locally, persisted in localStorage
  const [rowStatus, setRowStatus] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jobPlanner_rowStatus')) || {};
    } catch {
      return {};
    }
  });

  // Track which months are unlocked
  const [unlockedMonths, setUnlockedMonths] = useState({});

  // ─── STATE FOR Simple “Submit Sourcing Ticket” MODAL ────────────────────────
  const [showSourcingModal, setShowSourcingModal] = useState(false);
  const [sourcingJob, setSourcingJob] = useState(null);

  // ─── STATE FOR AUDIT CHECKLIST UPLOAD MODAL ────────────────────────────────
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedAuditJob, setSelectedAuditJob] = useState(null);

  // Earliest “in-progress” month for auto-scroll
  const [earliestInProgressMonthKey, setEarliestInProgressMonthKey] = useState(null);
  const scrollRef = useRef(null);

  const currentYear = new Date().getFullYear();

  // ─── FORMAT VALUES ─────────────────────────────────────────────────────────
  const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? '-' : num.toFixed(0);
  };

  // ─── FETCH JOBS FOR CURRENT YEAR ─────────────────────────────────────────────
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      console.log('🔄 [JobPlanner] fetching /api/jobs…');
      const res = await fetch(`${API}/api/jobs`, {
        credentials: 'include',
      });
      console.log('🪝 [JobPlanner] response:', res.status, res.url);
      const data = await res.json();
      console.log('✅ [JobPlanner] parsed data:', data);

      let jobsData = data.map((job) => ({
        ...job,
        customer: job.customer?.trim().toUpperCase() || '',
      }));
      const seen = new Set();
      jobsData = jobsData.filter((job) => {
        const key = `${job.customer}-${job.rig_in_date}-${job.surface_lsd}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Only current-year
      jobsData = jobsData.filter((job) => {
        const rigDate = new Date(job.rig_in_date);
        return rigDate.getFullYear() === currentYear;
      });

      // Sort ascending
      jobsData.sort((a, b) =>
        new Date(a.rig_in_date) - new Date(b.rig_in_date)
      );

      setJobs(jobsData);

    } catch (err) {
      console.error('❌ [JobPlanner] fetch error:', err);
    }
  };

  // ─── CREATE / UPDATE JOB ─────────────────────────────────────────────────────
  const handleCreateOrUpdate = async (jobData) => {
    const method = editMode ? 'PUT' : 'POST';
    const endpoint = editMode
      ? `${API}/api/jobs/${editingJobId}`
      : `${API}/api/jobs`;
    const payload = { ...jobData };
    if (!editMode) delete payload.id;

    try {
      await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      resetForm();
      fetchJobs();
    } catch (err) {
      console.error('Failed to save job:', err);
      alert('Error saving job. Please try again.');
    }
  };

  const handleEdit = (job) => {
    setEditMode(true);
    setEditingJobId(job.id);
    setNewJob({
      id: job.id,
      customer: job.customer || '',
      surface_lsd: job.surface_lsd || '',
      products: job.products || '',
      rig_in_date: job.rig_in_date || '',
      start_date: job.start_date || '',
      end_date: job.end_date || '',
      num_wells: job.num_wells ?? '',
      valve_7_1_16: job.valve_7_1_16 ?? '',
      valve_5_1_8: job.valve_5_1_8 ?? '',
      valve_hyd: job.valve_hyd ?? '',
      valve_man: job.valve_man ?? '',
      gateway_pods: job.gateway_pods ?? '',
      awc_pods: job.awc_pods ?? '',
      grease_unit: job.grease_unit ?? '',
      coil_trees: job.coil_trees ?? '',
      accumulator: job.accumulator ?? '',
      techs: job.techs || '',
      work_orders: job.work_orders || '',
      status: job.status || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await fetch(`${API}/api/jobs/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchJobs();
      } catch (err) {
        console.error('Failed to delete job:', err);
        alert('Error deleting job. Please try again.');
      }
    }
  };

  // ─── HANDLE DELETE AUDIT FILE ──────────────────────────────────────────────────
  const handleDeleteAudit = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this audit file?')) {
      try {
        const res = await fetch(
          `${API}/api/jobs/${jobId}/audit-checklist`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, auditChecklistUrl: null } : j
          )
        );
      } catch (err) {
        console.error('Failed to delete audit file:', err);
        alert('Error deleting audit file. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setNewJob({
      id: null,
      customer: '',
      surface_lsd: '',
      products: '',
      rig_in_date: '',
      start_date: '',
      end_date: '',
      num_wells: '',
      valve_7_1_16: '',
      valve_5_1_8: '',
      valve_hyd: '',
      valve_man: '',
      gateway_pods: '',
      awc_pods: '',
      grease_unit: '',
      coil_trees: '',
      accumulator: '',
      techs: '',
      work_orders: '',
      status: '',
    });
    setShowModal(false);
    setEditMode(false);
    setEditingJobId(null);
  };

  // ─── UPDATE JOB STATUS ─────────────────────────────────────────────────────────
  const updateJobStatus = async (jobId, newStatus) => {
    const currentStatus = rowStatus[jobId] || '';
    const isSame = currentStatus === newStatus;
    const statusToSend = isSame ? '' : newStatus;

    // Prepare new status map and persist it
    const newRowStatus = { ...rowStatus };
    if (isSame) delete newRowStatus[jobId];
    else newRowStatus[jobId] = newStatus;

    setRowStatus(newRowStatus);
    localStorage.setItem('jobPlanner_rowStatus', JSON.stringify(newRowStatus));

    // Append an audit log entry
    const logEntry = {
      jobId,
      oldStatus: currentStatus,
      newStatus: statusToSend,
      timestamp: new Date().toISOString(),
    };
    const prevLog = JSON.parse(localStorage.getItem('jobPlanner_statusLog') || '[]');
    prevLog.push(logEntry);
    localStorage.setItem('jobPlanner_statusLog', JSON.stringify(prevLog));

    try {
      const res = await fetch(`${API}/api/jobs/${jobId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToSend }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updatedJob = await res.json();
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? updatedJob : job))
      );
    } catch (err) {
      console.error('Failed to save status change:', err);
      // Revert on failure
      setRowStatus(rowStatus);
      localStorage.setItem('jobPlanner_rowStatus', JSON.stringify(rowStatus));
      alert('Failed to update status on server. Please try again.');
    }
  };

  // ─── GROUP JOBS BY MONTH ───────────────────────────────────────────────────────
  const groupByMonth = (entries) => {
    const map = new Map();
    entries.forEach((job) => {
      const date = new Date(job.rig_in_date);
      if (!isNaN(date)) {
        const key = date.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        });
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(job);
      }
    });
    return map;
  };
  const monthGroups = groupByMonth(jobs);

  // ─── FILTER UTILITIES ─────────────────────────────────────────────────────────
  const customers = [...new Set(jobs.map((j) => j.customer))].sort();
  const isVisible = (job) => {
    const jobMonth = new Date(job.rig_in_date).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
    return (
      (!selectedCustomer || job.customer === selectedCustomer) &&
      (!selectedTableMonth || selectedTableMonth === jobMonth)
    );
  };

  // ─── MONTH LOCK/UNLOCK UTILITIES ─────────────────────────────────────────────
  // Unlock by long-press
  const unlockMonth = (monthKey) => {
    setUnlockedMonths((prev) => ({ ...prev, [monthKey]: true }));
  };
  // Lock by button
  const lockMonth = (monthKey) => {
    setUnlockedMonths((prev) => {
      const copy = { ...prev };
      delete copy[monthKey];
      return copy;
    });
  };

  // ─── SCROLL INTO VIEW FOR EARLIEST ────────────────────────────────────────────
  useEffect(() => {
    const inProgress = jobs
      .filter((job) => rowStatus[job.id] === 'in-progress')
      .sort((a, b) => new Date(a.rig_in_date) - new Date(b.rig_in_date));
    if (inProgress.length > 0) {
      const key = new Date(inProgress[0].rig_in_date).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      setEarliestInProgressMonthKey(key);
    }
  }, [jobs, rowStatus]);

  useEffect(() => {
    if (earliestInProgressMonthKey && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [earliestInProgressMonthKey]);

  // ─── CALENDAR VIEW PREP ───────────────────────────────────────────────────────
  const filteredJobs = jobs.filter(isVisible);

  let calendarJobs = jobs.filter((job) =>
    !selectedCustomer ||
    job.customer.trim().toUpperCase() === selectedCustomer.trim().toUpperCase()
  );
  calendarJobs = calendarJobs.filter((job) => {
    const d = new Date(job.rig_in_date);
    return d instanceof Date && !isNaN(d);
  });

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const parseMonthKey = (key) => {
    if (!key) return null;
    const [monthName, yearString] = key.trim().split(' ');
    const fixedMonth =
      monthName.charAt(0).toUpperCase() +
      monthName.slice(1).toLowerCase();
    const yearNum = Number(yearString);
    const monthIndex = months.findIndex((m) => m === fixedMonth);
    if (monthIndex < 0 || isNaN(yearNum)) return null;
    return { year: yearNum, monthIndex };
  };
  const singleMonth = parseMonthKey(selectedCalendarMonth);

  let filteredCalendarJobs = calendarJobs;
  if (selectedCalendarMonth && singleMonth) {
    filteredCalendarJobs = calendarJobs.filter((job) => {
      const d = new Date(job.rig_in_date);
      return (
        d instanceof Date &&
        !isNaN(d) &&
        d.getFullYear() === singleMonth.year &&
        d.getMonth() === singleMonth.monthIndex
      );
    });
  }

  const events = filteredJobs.map((job) => ({
    id: job.id?.toString() || '',
    title: `${job.customer} – ${job.surface_lsd}`,
    start: job.rig_in_date,
    end: job.end_date,
    allDay: true,
    extendedProps: { ...job },
  }));
  const calendarEvents = filteredCalendarJobs.map((job) => ({
    id: job.id?.toString() || '',
    title: `${job.customer} – ${job.surface_lsd}`,
    start: job.rig_in_date,
    end: job.end_date,
    allDay: true,
    extendedProps: { ...job },
  }));

  const renderTooltipContent = (info) => {
    const [cust, lsd] = info.event.title.split(' – ');
    const rows = [
      `<tr><td style="font-weight:bold;padding-right:0.5rem;">Customer:</td><td>${cust}</td></tr>`,
      `<tr><td style="font-weight:bold;padding-right:0.5rem;">LSD:</td><td>${lsd}</td></tr>`
    ].join('');
    return `
      <div style="background:white; color:black; padding:0.5rem; border-radius:0.25rem;">
        <table style="font-size:0.75rem; border-collapse:collapse;">
          ${rows}
        </table>
      </div>
    `;
  };

  const handleEventDidMount = (info) => {
    setTimeout(() => {
      new (require('react-tippy').Tooltip)({
        target: info.el,
        html: renderTooltipContent(info),
        position: 'right',
        theme: 'light-border',
        animation: 'scale-subtle',
        inertia: true,
        hideOnClick: false,
        duration: [200, 200],
        arrow: true,
        offset: [0, 10],
      });
    }, 0);
  };

  const openSourcingModalForJob = (job) => {
    setSourcingJob(job);
    setShowSourcingModal(true);
  };

  // ─── SUBMIT SOURCING TICKET ───────────────────────────────────────────────────
  const handleSubmitSourcing = async (jobId, ticketInfo) => {
    try {
      for (let it of ticketInfo.items) {
        const payload = {
          base: ticketInfo.base,
          neededBy: ticketInfo.neededBy,
          project: ticketInfo.project,
          vendor: ticketInfo.vendor,
          category: ticketInfo.category,
          priority: ticketInfo.priority,
          status: ticketInfo.status,
          itemDescription: it.description,
          quantity: it.quantity,
        };
        const res = await fetch(`${API}/api/sourcing`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP ${res.status}`);
        }
      }
      setShowSourcingModal(false);
      setSourcingJob(null);
      alert('Sourcing ticket(s) submitted successfully!');
    } catch (err) {
      console.error('Failed to submit sourcing ticket:', err);
      alert(`Failed to submit sourcing ticket: ${err.message}`);
    }
  };

  return (
    <div
      className="min-h-screen text-white py-10 px-10 relative"
      style={{
        backgroundImage: 'url("/assets/dark-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >

      {/* Header / Filters / Buttons */}
      <div className="flex flex-col items-center mb-2">
        <img src={logo} alt="FLY-HQ Logo" className="w-20 mb-4 drop-shadow-xl" />
        <h1 className="text-2xl font-extrabold mb-2 text-white drop-shadow">JOB PLANNER</h1>
        <p className="text-gray-300 font-semibold mb-4 text-lg">
          Schedule and manage upcoming field deployments
        </p>
        <FilterBar
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          monthGroups={monthGroups}
          selectedMonth={selectedTableMonth}
          setSelectedMonth={setSelectedTableMonth}
        />
        <ViewToggleButtons
          viewMode={viewMode}
          setViewMode={setViewMode}
          setShowModal={setShowModal}
          resetCalendarMonth={() => setSelectedCalendarMonth('')}
        />
      </div>

      {/* Table vs Calendar */}
      {viewMode === 'table' ? (
        <div style={{ zoom: 0.8, transformOrigin: 'top left' }}>
          <TableView
            monthGroups={monthGroups}
            isVisible={isVisible}
            rowStatus={rowStatus}
            unlockedMonths={unlockedMonths}
            unlockMonth={unlockMonth}
            lockMonth={lockMonth}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleSubmitSourcing={openSourcingModalForJob}
            handleStatusChange={updateJobStatus}
            handleDeleteAudit={handleDeleteAudit}
            formatValue={formatValue}
            scrollRef={scrollRef}
            showAuditModal={showAuditModal}
            setShowAuditModal={setShowAuditModal}
            selectedAuditJob={selectedAuditJob}
            setSelectedAuditJob={setSelectedAuditJob}
          />
        </div>
      ) : (
        <CalendarView
          months={months}
          currentYear={currentYear}
          singleMonth={singleMonth}
          setSelectedMonth={setSelectedCalendarMonth}
          events={calendarEvents}
          handleEventDidMount={handleEventDidMount}
        />
      )}

      {/* Modals */}
      <JobModal
        isOpen={showModal}
        onClose={resetForm}
        onSave={handleCreateOrUpdate}
        existingJob={editMode ? newJob : null}
        customers={customers}
      />
      <SourcingModal
        isOpen={showSourcingModal}
        onClose={() => {
          setShowSourcingModal(false);
          setSourcingJob(null);
        }}
        onSubmit={handleSubmitSourcing}
        job={sourcingJob}
      />
    </div>
  );
}
