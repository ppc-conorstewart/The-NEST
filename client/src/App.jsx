// src/App.jsx

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ─── FIXED: Point to the pages folder so we load the animated LandingPage ───
import LandingPage from './LandingPage';
// ──────────────────────────────────────────────────────────────────────────────

import ModuleSelector from './pages/ModuleSelector';
import FlyHQTools from './FlyHQTools';
import FlyHQ from './pages/FlyHQ';
import JobPlanner from './pages/JobPlanner';
import WorkorderHub from './pages/WorkorderHub';
import SourcingPage from './pages/SourcingPage';
import Analytics from './pages/Analytics';       // ← New import for Analytics page
import FLYBASE from './pages/FLYBASE';
import MFVSummary from './pages/MFVSummary';
import MFVField from './pages/MFVField';
import MFVDocumentation from './pages/MFVDocumentation';
import MFVPage from './pages/MFVPage';

// 🆕 NEW IMPORT for your per-job chart page
import ValveReports from './pages/ValveReports';

function AuthListener() {
  const location = useLocation();
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userParam = params.get('user');
    if (userParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('flyiq_user', JSON.stringify(parsed));
      } catch {}
      finally {
        window.history.replaceState({}, document.title, '/');
      }
    }
  }, [location]);
  return null;
}

export default function App() {
  return (
    <Router>
      <AuthListener />

      <Layout>
        <Routes>
          {/* Landing with animated background */}
          <Route path="/" element={<LandingPage />} />

          {/* FLY-IQ Module Selector */}
          <Route
            path="/fly-iq"
            element={
              <ProtectedRoute>
                <ModuleSelector />
              </ProtectedRoute>
            }
          />

          {/* FLY-HQ Tools */}
          <Route
            path="/fly-hq-tools"
            element={
              <ProtectedRoute>
                <FlyHQTools />
              </ProtectedRoute>
            }
          />

          {/* FLY-HQ Dashboard */}
          <Route
            path="/fly-hq"
            element={
              <ProtectedRoute>
                <FlyHQ />
              </ProtectedRoute>
            }
          />

          {/* MFV Hub within Fly-HQ */}
          <Route
            path="/fly-hq/mfv"
            element={
              <ProtectedRoute>
                <MFVPage />
              </ProtectedRoute>
            }
          />

          {/* Job Planner */}
          <Route
            path="/job-planner"
            element={
              <ProtectedRoute>
                <JobPlanner />
              </ProtectedRoute>
            }
          />

          {/* Workorder Hub */}
          <Route
            path="/workorder-hub"
            element={
              <ProtectedRoute>
                <WorkorderHub />
              </ProtectedRoute>
            }
          />

          {/* Sourcing */}
          <Route
            path="/sourcing"
            element={
              <ProtectedRoute>
                <SourcingPage />
              </ProtectedRoute>
            }
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* FLY-MFV */}
          <Route
            path="/fly-mfv"
            element={
              <ProtectedRoute>
                <FLYBASE />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fly-mfv/summary"
            element={
              <ProtectedRoute>
                <MFVSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fly-mfv/documentation"
            element={
              <ProtectedRoute>
                <MFVDocumentation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fly-mfv/field"
            element={
              <ProtectedRoute>
                <MFVField />
              </ProtectedRoute>
            }
          />

          {/* 🆕 Valve Reports: list view */}
          <Route
            path="/fly-mfv/valve-reports"
            element={
              <ProtectedRoute>
                <ValveReports />
              </ProtectedRoute>
            }
          />

          {/* 🆕 Valve Reports: per-pad/job chart */}
          <Route
            path="/fly-mfv/valve-reports/:padKey"
            element={
              <ProtectedRoute>
                <ValveReports />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <div className="bg-black text-white p-10">
                  Page Not Found
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
