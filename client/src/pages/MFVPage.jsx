// src/pages/MFVPage.jsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Configure your three CSV-based tables
const tablesConfig = [
  { key: 'build',   label: 'Build & Tolerance', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtTEOWnW6i4BOpwiY7vZ_LmVymZGwXBapgyZ_fRtqD6NcWUpI_r-1wrn5bWDrX0ANOzCDpbwqMUG0R/pub?gid=0&single=true&output=csv' },
  { key: 'summary', label: 'MFV Test Reports',  url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVHS7FlbKTZtslOKoa6x8GsTW02jqRttmMgArSkJ2AzLr3jyxF9lR0YXb4zMoJZ-yl6__OLVuAFYW3/pub?gid=0&single=true&output=csv' },
  { key: 'field',   label: 'OEM Reports',       url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFbz1FlLmX9w-sJMhtsnyRQ5DaLXuiWaw9nEJ7nRfV1CZUIBxEKk9UTurxIhaLq7491cAXWYoEfyS1/pub?gid=0&single=true&output=csv' },
]

// Initial Body-pressures pads configuration
const initialPads = [
  { key: 'teine',      label: 'Teine 01-06',     url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLHtSKTc29pm8huFkwTphIywjrtBttCZUE3Ll8gmRtTUdGgH4tX1d1PgJJlE49-tr9eLlAQ-0139RS/pub?gid=0&single=true&output=csv' },
  { key: 'whitecap15', label: 'Whitecap 15-16',  url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTGXWvP0KgUII6T5wD6L2tyjXN5iUCPpLcEvv4FKyri3nkSrOWnj8mvPawUCYjz0hKvzfsK1XhKM-Pv/pub?gid=0&single=true&output=csv' },
  { key: 'paramount',  label: 'Paramount 04-16', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSSmOrAehy2_E_xFUAQcyVAeJ556W7nAd6QhH4dc5ZKrBJPuQCBdk-NcoxnglTcLoGUGyrGRMUL0dcQ/pub?gid=0&single=true&output=csv' },
  { key: 'whitecap11', label: 'Whitecap 11-35',  url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT0EytQCKf5PcHjEKCD72PWQb_To71HMZKDZfgZS1_nJKvo8PV2uqryWkm1YEPvyR2PM0v9uOpGa3Xk/pub?gid=0&single=true&output=csv' },
]

export default function MFVPageWrapper() {
  const navigate = useNavigate()

  // sheet data state
  const [allSheets, setAllSheets] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // filter/search state
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('build')

  // pad selection state
  const [pads, setPads] = useState(initialPads)
  const [archived, setArchived] = useState([])
  const [selectedPad, setSelectedPad] = useState(initialPads[0].key)

  // UI toggles
  const [showAdd, setShowAdd] = useState(false)
  const [showArchivedModal, setShowArchivedModal] = useState(false)

  // add‐pad form
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')

  // ─── read persisted pads & archive on mount ────────────────────────────────
  useEffect(() => {
    const savedPads = JSON.parse(localStorage.getItem('mfvPads') || 'null')
    const savedArch = JSON.parse(localStorage.getItem('mfvArchived') || 'null')
    if (savedPads) setPads(savedPads)
    if (savedArch) setArchived(savedArch)
  }, [])

  // ─── persist pads when they change ────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('mfvPads', JSON.stringify(pads))
  }, [pads])

  // ─── persist archived when it changes ─────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('mfvArchived', JSON.stringify(archived))
  }, [archived])

  // ─── fetch all spreadsheets when pads change ──────────────────────────────
  useEffect(() => {
    const sources = [...tablesConfig, ...pads]
    Promise.all(
      sources.map(t =>
        fetch(t.url)
          .then(res => {
            if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`)
            return res.text()
          })
          .then(text => {
            const parsed = Papa.parse(text, { skipEmptyLines: true })
            const rows = parsed.data
            const headers = rows[0] || []
            const dataRows = rows.slice(1).filter(r => r.length === headers.length)
            return { key: t.key, headers, rows: dataRows }
          })
          .catch(() => ({ key: t.key, headers: [], rows: [] }))
      )
    )
      .then(results => {
        const map = {}
        results.forEach(r => { map[r.key] = { headers: r.headers, rows: r.rows } })
        setAllSheets(map)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [pads])

  if (loading) return <p className="text-gray-100 p-4">Loading data…</p>
  if (error)   return <p className="text-red-500 p-4">Error loading sheets: {error}</p>

  // ─── pick which sheet to display ──────────────────────────────────────────
  const displayHeaders = activeTab === 'body'
    ? allSheets[selectedPad]?.headers || []
    : allSheets[activeTab]?.headers || []
  const displayRows = activeTab === 'body'
    ? allSheets[selectedPad]?.rows || []
    : allSheets[activeTab]?.rows || []

  // ─── build the chart ──────────────────────────────────────────────────────
  let chart = null
  if (activeTab === 'body' && displayHeaders.length && displayRows.length) {
    const dateColIdx = 0
    const startIdx = 3
    const dates = displayRows.map(r => r[dateColIdx])
    const valveCols = displayHeaders.slice(startIdx)
    const softerPalette = [
      '#A3BE8C','#88C0D0','#EBCB8B','#B48EAD',
      '#81A1C1','#D08770','#8FBCBB','#5E81AC'
    ]

    const datasets = valveCols.map((col,i) => ({
      label: col,
      data: displayRows.map(r => {
        const raw = r[startIdx+i]||''
        const num = parseInt(raw.toString().replace(/\D/g,''),10)
        return isNaN(num)?0:num
      }),
      fill: false,
      borderWidth: 2,
      borderColor: softerPalette[i%softerPalette.length],
      backgroundColor: softerPalette[i%softerPalette.length],
      pointRadius: 2,
      pointHoverRadius: 5,
      tension: 0.3,
    }))

    // threshold line
    const thresholdData = Array(dates.length).fill(9000)
    datasets.push({
      label: '9000 PSI Threshold',
      data: thresholdData,
      fill: false,
      borderColor: 'rgba(220,20,60,0.8)',
      borderWidth: 3,
      borderDash: [6,4],
      pointRadius: 0,
      order: 0,
    })

    chart = (
      <div className="w-full max-w-2xl mb-6 p-4 bg-[#111] border-2 border-[#6a7257] rounded shadow-lg">
        <Line
          data={{ labels: dates, datasets }}
          options={{
            responsive: true,
            plugins: {
              legend: { position:'bottom', labels:{ boxWidth:12, color:'#fff' } },
              title: {
                display: true,
                text: `Daily Body Pressure – ${pads.find(p=>p.key===selectedPad).label}`,
                color:'#fff', font:{ size:18 }
              },
            },
            scales: {
              x: {
                ticks:{ color:'#ddd' },
                grid:{ color:'#333' },
                title:{ display:true, text:'Date', color:'#aaa' }
              },
              y: {
                beginAtZero:true,
                min:0,
                max:13000,
                ticks:{ color:'#ddd' },
                grid:{ color:'#333' },
                title:{ display:true, text:'PSI', color:'#aaa' }
              }
            }
          }}
        />
      </div>
    )
  }

  // ─── handlers ────────────────────────────────────────────────────────────
  const handleAddPad = () => {
    if (!newLabel.trim()||!newUrl.trim()) return
    const key = newLabel.toLowerCase().replace(/\W+/g,'-')
    setPads([...pads,{key,label:newLabel,url:newUrl}])
    setNewLabel(''); setNewUrl(''); setShowAdd(false)
    setSelectedPad(key)
  }
  const handleArchive = () => {
    const pad = pads.find(p=>p.key===selectedPad)
    if(!pad) return
    setPads(pads.filter(p=>p.key!==selectedPad))
    setArchived([...archived,pad])
    const next = pads.find(p=>p.key!==selectedPad)
    setSelectedPad(next? next.key : '')
  }
  const handleRestore = key => {
    const pad = archived.find(a=>a.key===key)
    if(!pad) return
    setArchived(archived.filter(a=>a.key!==key))
    setPads([...pads,pad])
  }

  return (
    <div
      className="h-full w-full text-white flex flex-col items-center p-4 overflow-auto"
      style={{
        /* base paper texture */
        backgroundImage: 'url("/assets/black-paper-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',

        /* dark overlay */
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backgroundBlendMode: 'multiply'
      }}
    >

      <img src="/assets/mfv-icon2.png" alt="MFV Icon"
           className="w-28 h-auto mb-2"/>

      <h1 className="text-xl font-extrabold font-erbaum uppercase mb-4 text-center w-full">
        MFV Information Hub
      </h1>

      {/* search */}
      <div className="w-half max-w-xs mb-0">
        <input
          type="text"
          placeholder="🔍VALVE SEARCH (PPC)"
          value={searchTerm}
          onChange={e=>setSearchTerm(e.target.value)}
          style={{borderColor:'#6a7257',color:'#6a7257'}}
          className="w-full p-1 mb-2 bg-black border-2 font-erbaum  text-center text-white placeholder-[#6a7257] rounded"
        />
      </div>

      {/* tabs */}
      <div className="w-full max-w-8xl mb-4 flex justify-center">
        <div className="flex flex-wrap justify-center space-x-2 mb-4">
          {tablesConfig.concat({ key:'body', label:'Body Pressures' }).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setSearchTerm(''); setActiveTab(tab.key) }}
              className={`px-4 py-2 font-bold border-b-2 ${
                activeTab === tab.key
                  ? 'border-[#6a7257] text-white'
                  : 'border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* pad selector + controls */}
      {activeTab === 'body' && (
        <div className="mb-4 flex flex-col items-center w-full">
          <label className="font-bold mb-2">Choose Which Pad:</label>
          <div className="flex space-x-2">
            <select
              value={selectedPad}
              onChange={e => setSelectedPad(e.target.value)}
              className="bg-black text-white font-erbaum border border-gray-600 px-5 rounded"
            >
              {pads.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="bg-[#6a7257] hover:bg-[#57614f] text-black font-erbaum px-3 rounded"
            >
              + Add Pad
            </button>
            <button
              onClick={handleArchive}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-erbaum px-3 rounded"
            >
              Archive Pad
            </button>
            <button
              onClick={() => setShowArchivedModal(true)}
              className="bg-[#6a7257] hover:bg-gray-600 text-black font-erbaum px-3 rounded"
            >
              Show Archived
            </button>
          </div>

          {showAdd && (
            <div className="mt-2 flex space-x-2">
              <input
                type="text"
                placeholder="Label"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="p-1 rounded bg-gray-800 text-white"
              />
              <input
                type="text"
                placeholder="CSV URL"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="p-1 rounded bg-gray-800 text-white"
              />
              <button
                onClick={handleAddPad}
                className="bg-green-600 hover:bg-green-700 text-white px-3 rounded"
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* chart */}
      {chart}

      {/* table */}
      <div className="bg-[#111] rounded mb-6 px-2 py-4 w-full max-w-6xl text-[0.65rem]">
        <table
          className="table-fixed font-erbaum uppercase w-full border border-gray-600"
          style={{ tableLayout: 'fixed' }}
        >
          <colgroup>
            {displayHeaders.map((_, idx) => (
              <col key={idx} style={{ width: `${100 / displayHeaders.length}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-black">
              {displayHeaders.map((h, i) => (
                <th
                  key={i}
                  className="px-1 py-1 border border-[#6a7257] text-center font-bold uppercase tracking-wide text-[#6a7257] whitespace-normal break-words"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows
              .filter(row =>
                row.some(cell =>
                  cell.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-[#6a725740]' : ''}>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-1 py-1 border border-[#6a7257] text-center text-gray-300 font-bold whitespace-normal break-words"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Archived Pads Modal */}
      {showArchivedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#222] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Archived Pads</h3>
              <button
                onClick={() => setShowArchivedModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            {archived.length > 0 ? (
              <ul className="space-y-2">
                {archived.map(p => (
                  <li key={p.key} className="flex justify-between items-center bg-black bg-opacity-20 p-2 rounded">
                    <span className="text-white">{p.label}</span>
                    <button
                      onClick={() => { handleRestore(p.key); }}
                      className="text-green-400 hover:text-green-600"
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No archived pads.</p>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
