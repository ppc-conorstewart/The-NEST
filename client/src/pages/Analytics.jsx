// src/pages/Analytics.jsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import AssetsOverview from '../components/AssetsOverview'

const COLORS = ['#6a7257', '#4ade80', '#60a5fa', '#f87171']

export default function Analytics() {
  const navigate = useNavigate()
  const [view, setView] = useState('metrics')
  const [yearTotals, setYearTotals] = useState({})
  const [sampleLineData, setSampleLineData] = useState([])
  const [pieData, setPieData] = useState([])
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(new Date().getMonth())
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetch('http://localhost:3001/api/jobs/monthly-totals')
      .then(r => r.json())
      .then(data => {
        setSampleLineData(data)
        // Default to current month if in data bounds
        const idx = Math.min(selectedMonthIdx, data.length - 1)
        const monthObj = data[idx] || {}
        setYearTotals(monthObj)
        // build pie for this month
        const totalVals = Object.keys(monthObj)
          .filter(key => key !== 'month')
          .map(key => Number(monthObj[key] || 0))
          .reduce((a, b) => a + b, 0)
        const pie = Object.entries(monthObj)
          .filter(([k]) => k !== 'month')
          .map(([k, v], i) => ({
            name: k,
            value: Number(v),
            percent: totalVals ? ((v / totalVals) * 100).toFixed(1) : 0
          }))
        setPieData(pie)
      })
      .catch(console.error)
  }, [currentYear, selectedMonthIdx])

  return (

    <div className="min-h-screen w-full bg-black text-white p-6">
   

      {/* Centered View toggle */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setView('metrics')}
          className={`px-4 py-2 rounded font-bold bg-black border border-[#6a7257] transition ${
            view === 'metrics' ? 'text-[#6a7257]' : 'text-white'
          }`}
        >
          Metrics
        </button>
        <button
          onClick={() => setView('assets')}
          className={`px-4 py-2 rounded font-bold bg-black border border-[#6a7257] transition ${
            view === 'assets' ? 'text-[#6a7257]' : 'text-white'
          }`}
        >
          Assets Overview
        </button>
      </div>

      {view === 'metrics' ? (
        <>
          <h1 className="text-3xl font-bold mb-2 text-center">Analytics</h1>
          <p className="text-gray-300 mb-6 text-center">
            Monthly Wells Totals for {currentYear}
          </p>

          {/* KPI Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#111] rounded-xl p-6 text-center">
              <p className="text-xl text-gray-300">Total Wells</p>
              <p className="text-3xl font-bold">{yearTotals.wells}</p>
            </div>
          </div>

          {/* Line chart */}
          <div className="bg-[#111] rounded-xl p-4 mb-12 w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleLineData}>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip formatter={val => val} />
                <Line
                  type="monotone"
                  dataKey="wells"
                  stroke="#6a7257"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-[#111] rounded-xl p-4 w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  label={({ percent }) => `${percent}%`}
                >
                  {pieData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val}`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <AssetsOverview />
      )}
    </div>
  )
}
