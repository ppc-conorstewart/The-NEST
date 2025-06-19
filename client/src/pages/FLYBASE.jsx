// src/pages/FLYBASE.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FLYBASE() {
  const navigate = useNavigate();
  const palomaLogoPath = '/assets/Paloma_Logo_white_Rounded2.png';
  const [searchTerm, setSearchTerm] = useState('');

  // Ensure Lordicon script is loaded once
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.lordicon.com/lordicon.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.lordicon.com/lordicon.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const tools = [
    {
      key: 'documentation',
      title: 'MFV-Documentation',
      description: 'Download & view all MFV manuals, drawings, and tech sheets',
      route: '/fly-mfv/documentation',
    },
    {
      key: 'field', // Asset Transfer
      title: 'Asset Transfer',
      description: 'Submit your valve reports and documentation',
      route: '/fly-mfv/field',
    },
    {
      key: 'reports',
      title: 'MFV Reports',
      description: 'Submit and review MFV Build, Test, and OEM Reports',
      route: '/fly-mfv/valve-reports',
    },
  ];

  return (
    <div
      className="h-full w-full bg-black text-[#949c7f] flex flex-col items-center p-2 relative"
      style={{ zoom: 0.65, transformOrigin: 'top left' }}
    >
      <button
        onClick={() => navigate('/')}
        className="absolute -left-4 px-4 py-2 bg-black border border-[#494f3c] rounded-md text-[#494f3c] text-sm hover:bg-[#EF4444] hover:text-black transition"
      >
        ← Return to Paloma Suite
      </button>

      <img
        src="/assets/FLY-BASE.png"
        alt="FLY-MFV Logo"
        className="w-[200px] drop-shadow-xl mt-8"
      />

      <h1 className="text-3xl font-bold mt-4 mb-2 text-center">BASE DASHBOARD:</h1>
      <p className="text-[#949c7f] font-semibold mb-4 text-center">
        What would you like to do?
      </p>

      <div className="w-full max-w-md mb-4">
        <input
          type="text"
          placeholder="🔍 Search documentation or field..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-[#222] text-[#949c7f] placeholder-gray-400 border border-[#494f3c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444] transition"
        />
      </div>

      <div className="w-full px-4 flex flex-row flex-wrap justify-center gap-14">
        {tools
          .filter((tool) =>
            tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((tool) => (
            <div
              key={tool.key}
              onClick={() => navigate(tool.route)}
              className="cursor-pointer w-[240px] bg-transparent border-2 border-[#494f3c] rounded-2xl shadow-lg p-4  flex flex-col justify-between transition hover:bg-[#1a1a1a]"
            >
              <div className="flex flex-col font-erbaum items-center">
                {tool.key === 'field' ? (
                  // Asset Transfer: use your JSON Lottie icon here
                  <lord-icon
                    src="/assets/asset-transfer-icon.json"
                    trigger="loop"
                    delay="2000"
                    style={{ width: '80px', height: '80px' }}
                    colors="primary:#6a7257,secondary:#6a7257"
                    className="mx-auto gap-4  "
                  />
                ) : (
                  <img
                    src={palomaLogoPath}
                    alt="Paloma Logo"
                    className="w-24 h-24 "
                  />
                )}
                <h2 className="text-xl font-bold text-white mb-2 text-center">
                  {tool.title}
                </h2>
                <p className="text-gray-300 text-sm text-center">
                  {tool.description}
                </p>
              </div>
              <span className="mt-6 text-[#494f3c] font-semibold text-lg text-center w-full">
                Go →
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
