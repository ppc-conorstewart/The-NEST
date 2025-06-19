// src/components/Sidebar.jsx
import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaBoxes,
  FaClipboardList,
  FaSearch,
  FaChartBar,
  FaArrowLeft,
} from 'react-icons/fa'

// ─── ICON PATHS ──────────────────────────────────────────────────────────────
const flyhqLogo = '/assets/flyhq-logo.png'
const nestLogo  = '/assets/paloma-favicon.png'
const mfvIcon2  = '/assets/mfv-icon.png'

export default function Sidebar() {
  const location = useLocation()
  const navigate  = useNavigate()

  return (
    <aside
        className="
        fixed
        top-[3rem]
        left-0
        h-auto
        w-11
        backdrop-blur-3xl    /* ← now fully transparent */
        hover:bg-transparent/* ← stays transparent on hover */
        text-fly-blue
        border-2
        border-black
        rounded
        group hover:w-44
        transition-all duration-300 ease-in-out
        
        
        flex flex-col
        py-2
        z-30
      "
    >
      {/* ─── FLY-HQ LOGO IN FLY-HQ MODULE ─────────────────────────────────── */}
      {location.pathname.startsWith('/fly-hq') && (
        <div className="flex items-center ml-1 px-0 py-0 justify-center hover:bg-gray-800 overflow-visible">
          <img
            src={flyhqLogo}
            alt="FLY-HQ Logo"
            className="h-12 w-auto flex-none"
          />
          <span className="ml-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-0 ">
            {/* optional label */}
          </span>
        </div>
      )}

      {/* ─── BACK BUTTON AT TOP ─────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center w-full px-1 py-1 hover:bg-gray-800"
      >
        <FaArrowLeft size={28} className="flex-shrink-0 ml-1" />
        <span className="ml-2 text-white  text-base font-bold font-erbaum opacity-0 font-erbaum group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Go Back
        </span>
      </button>

      {/* ─── NEST ICON / RETURN TO THE NEST ────────────────────────────────── */}
      <NavLink
        to="/"
        className="flex items-center w-full px-1 hover:bg-gray-800 mt-2"
      >
        <img
          src={nestLogo}
          alt="The NEST"
          className="flex-shrink-0 w-6 h-6 ml-1"
        />
        <span className="ml-2 text-white text-sm font-bold font-erbaum whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ">
         The NEST
        </span>
      </NavLink>

      {/* ─── NAV LINKS ───────────────────────────────────────────────────────── */}
      <NavLink
        to="/job-planner"
        className="flex items-center w-full px-1 hover:bg-gray-800 mt-4"
      >
        <FaCalendarAlt size={24} className="flex-shrink-0 ml-1" />
        <span className="ml-3 text-white text-sm font-bold font-erbaum  opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Job Planner
        </span>
      </NavLink>

      <NavLink
        to="/fly-hq"
        className="flex items-center w-full px-1 hover:bg-gray-800 mt-4"
      >
        <FaBoxes size={24} className="flex-shrink-0 ml-1" />
        <span className="ml-3 text-white text-sm font-bold font-erbaum  opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Asset Manager
        </span>
      </NavLink>

      <NavLink
        to="/workorder-hub"
        className="flex items-center w-full px-1 hover:bg-gray-800 mt-4"
      >
        <FaClipboardList size={24} className="flex-shrink-0 ml-1" />
        <span className="ml-3 text-white text-sm font-bold font-erbaum  opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Workorder Hub
        </span>
      </NavLink>

      <NavLink
        to="/sourcing"
        className="flex items-center w-full px-1 hover:bg-gray-800 mt-4"
      >
        <FaSearch size={24} className="flex-shrink-0 ml-1" />
        <span className="ml-3 text-white text-sm font-bold font-erbaum  opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Sourcing
        </span>
      </NavLink>

      <NavLink
        to="/analytics"
        className="flex items-center w-full px-1 hover:bg-gray-800 mt-4"
      >
        <FaChartBar size={24} className="flex-shrink-0 ml-1" />
        <span className="ml-3 text-white text-sm font-bold font-erbaum opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Analytics
        </span>
      </NavLink>

      {/* ─── MFV PAGE LINK ────────────────────────────────────────────────────── */}
      <NavLink
        to="/fly-hq/mfv"
        className="flex items-center w-full px-.5 hover:bg-gray-800 mt-4"
      >
        <img
          src={mfvIcon2}
          alt="MFV Info Hub"
          className="flex-shrink-0 w-8 h-6 ml-1"
        />
        <span className="ml-1 text-white text-sm font-bold font-erbaum opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          MFV Info Hub
        </span>
      </NavLink>
    </aside>
  )
}
