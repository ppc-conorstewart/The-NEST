// src/FlyHQTools.jsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaBoxes,
  FaClipboardList,
  FaSearch,
  FaChartBar,
  FaTools,
} from 'react-icons/fa';

export default function FlyHQTools() {
  const navigate = useNavigate()

  // ─── ICON PATHS ──────────────────────────────────────────────────────────────
  const flyhqLogoPath = '/assets/flyhq-logo.png'
  const mfvIconPath = '/assets/mfv-icon.png'

  // ─── STATE FOR STATS BOXES ────────────────────────────────────────────────────
  const [jobsInProgress, setJobsInProgress] = useState([])
  const [yearTotals, setYearTotals] = useState({
    wells: 0,
    valve_7_1_16: 0,
    valve_5_1_8: 0,
    hyd_3_1_16: 0,
    man_3_1_16: 0,
  })
  const currentYear = new Date().getFullYear()

  // ─── STATE TOGGLE SUMMARY CARD ────────────────────────────────────────────────
  const [showSummary, setShowSummary] = useState(false)

  // ─── FETCH SUMMARY DATA ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showSummary) return

    fetch('/api/jobs')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Jobs fetch failed: ${res.status}`)
        }
        return res.json()
      })
      .then((allJobs) => {
        const inProgress = allJobs.filter((job) => job.status === 'in-progress')
        setJobsInProgress(inProgress)

        const completedThisYear = allJobs.filter((job) => {
          if (job.status !== 'completed') return false
          const rigDate = new Date(job.rig_in_date)
          return rigDate.getFullYear() === currentYear
        })

        const totals = completedThisYear.reduce(
          (acc, job) => ({
            wells: acc.wells + Number(job.num_wells || 0),
            valve_7_1_16: acc.valve_7_1_16 + Number(job.valve_7_1_16 || 0),
            valve_5_1_8: acc.valve_5_1_8 + Number(job.valve_5_1_8 || 0),
            hyd_3_1_16: acc.hyd_3_1_16 + Number(job.valve_hyd || 0),
            man_3_1_16: acc.man_3_1_16 + Number(job.valve_man || 0),
          }),
          { wells: 0, valve_7_1_16: 0, valve_5_1_8: 0, hyd_3_1_16: 0, man_3_1_16: 0 }
        )

        setYearTotals(totals)
      })
      .catch((err) => {
        console.error('Error fetching jobs for summary:', err)
        setJobsInProgress([])
        setYearTotals({
          wells: 0,
          valve_7_1_16: 0,
          valve_5_1_8: 0,
          hyd_3_1_16: 0,
          man_3_1_16: 0,
        })
      })
  }, [showSummary, currentYear])

  // ─── TOOL CARDS DEFINITION ─────────────────────────────────────────────────────
  const tools = [
    {
      key: 'jobPlanner',
      title: 'Job Planner',
      description: 'View and manage job schedules',
      route: '/job-planner',
      icon: FaCalendarAlt,
    },
    {
      key: 'assetManagement',
      title: 'Asset Management',
      description: 'Track and update component inventory',
      route: '/fly-hq',
      icon: FaBoxes,
    },
    {
      key: 'workorderHub',
      title: 'Workorder Hub',
      description: 'Create and plan new workorders',
      route: '/workorder-hub',
      icon: FaClipboardList,
    },
    {
      key: 'sourcing',
      title: 'Sourcing',
      description: 'Find and request new components',
      route: '/sourcing',
      icon: FaSearch,
    },
    {
      key: 'analytics',
      title: 'Analytics',
      description: 'An overlook at various Metrics and Statistics',
      route: '/analytics',
      icon: FaChartBar,
    },
    {
      key: 'mfv',
      title: 'MFV',
      description: 'Valve logs and MFV Information Hub',
      route: '/fly-hq/mfv',    // ← now points here
      icon: FaTools,           // fallback if image fails
    },
  ]

  return (
   
 <div className="h-full w-full bg-black text-white flex flex-col items-center pl-36 pr-6 relative">

      <img
        src={flyhqLogoPath}
        alt="FLY-HQ Logo"
        className="w-48 sm:w-56 md:w-64 lg:w-72 xl:w-[200px] drop-shadow-xl mt-8"
      />

      {/* spacer */}
      <div className="my-8" />

      <div className="w-full px-4 flex flex-row flex-wrap justify-center gap-6">
        {tools.map((tool) => (
          <div
            key={tool.key}
            onClick={() => navigate(tool.route)}
            className="cursor-pointer w-[200px] bg-[#111] border border-white rounded-xl shadow p-4 flex flex-col justify-between transition hover:bg-black"
          >
            <div className="flex flex-col items-center">
              {tool.key === 'mfv' ? (
                <img
                  src={mfvIconPath}
                  alt="MFV Icon"
                  className="w-26 h-12 mb-2"
                />
              ) : (
                <tool.icon size={56} className="text-fly-blue mb-1" />
              )}
              <h2 className="text-lg font-bold text-white underline mb-1 text-center">
                {tool.title}
              </h2>
              <p className="text-gray-300 text-xs text-center">
                {tool.description}
              </p>
            </div>
            <span className="mt-4 text-fly-blue font-bold text-base text-center w-full">
              Go →
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
