// src/index.js

// ─── POLYFILL process FOR BROWSER ───────────────────────────────────────────────
// This ensures any `process.env` references in dependencies won’t blow up.
import process from 'process';
window.process = window.process || process;

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// ─── Browser Process Polyfill ──────────────────────────
// Some libraries assume `process` exists (e.g., for env lookups).
// We've given them a minimal stub above so they don’t crash.

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
