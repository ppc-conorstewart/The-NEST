// src/components/Layout.jsx
import React from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

// paths where we want the Sidebar
const MODULE_PATHS = [
  '/fly-hq',
  '/fly-hq-tools',      // ← added so sidebar shows on the Tools page too
  '/job-planner',
  '/workorder-hub',
  '/sourcing',
  '/analytics',
  
]

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const showSidebar = MODULE_PATHS.some(p => pathname.startsWith(p))

  return (
    <div className="flex h-screen">
      {showSidebar && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main
          className={
            'flex-1 overflow-auto text-white ' + 
            (showSidebar ? 'ml-' : '')
          }
        >
          {children}
        </main>

        <Footer />
      </div>
    </div>
  )
}
