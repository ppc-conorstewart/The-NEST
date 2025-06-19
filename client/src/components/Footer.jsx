// src/components/Footer.jsx

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white font-bold flex items-center justify-center space-x-3">
   

      {/* Footer text — increased font size for better readability */}
      <span className="text-xs font-bold font-medium">
        © 2025 Paloma Pressure Control | App version 1.0.0 | Last update: June 3, 2025
      </span>
    </footer>
  );
}
