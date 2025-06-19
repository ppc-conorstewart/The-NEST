// src/pages/LandingPage.jsx

import React, { useEffect, useState } from 'react';
import FLYBASE from './pages/FLYBASE';

const flyIqLogo = '/assets/logo.png';
const flyHqLogo = '/assets/flyhq-logo.png';
const FLYBASELogo = '/assets/FLY-BASE.png';
const palomaLogo = '/assets/Paloma_Logo_White_Rounded.png';
const backgroundGif = '/assets/card-bg.gif';

export default function LandingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userData = params.get('user');

    if (userData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userData));
        setUser(parsed);
        localStorage.setItem('flyiq_user', JSON.stringify(parsed));
        window.history.replaceState({}, document.title, '/');
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    } else {
      const stored = localStorage.getItem('flyiq_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem('flyiq_user');
        }
      }
    }
  }, []);
// … earlier useEffect and state logic …

// Read from CRA env var, default to localhost:
const BASE_URL = process.env.REACT_APP_API_URL;

const handleDiscordLogin = () => {
  console.log('BACKEND URL:', BASE_URL);
 window.location.href = `${BASE_URL}/auth/discord`;
};


// … rest of your component …




  if (!user) {
    return (
      <div
        className="relative w-full h-full overflow-hidden"
        
      >
        {/* Animated Background */}
        <img
          src={backgroundGif}
          alt="Background Animation"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-80 z-0" />

        {/* Centered Login Prompt */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          {/* Paloma Logo */}
          <img
            src={palomaLogo}
            alt="Paloma Logo"
            className="w-[240px] sm:w-[300px] lg:w-[300px] drop-shadow-[0_0_25px_rgba(154,162,125,0.6)]"
          />

          {/* “To Gain Access” Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-8 text-center">
            To Gain Access to The Nest
          </h1>

          {/* Discord Login Button */}
          <button
            onClick={handleDiscordLogin}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg text-lg font-semibold transition shadow-md"
          >
            Log in with Discord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
    
    >
      {/* Animated Background */}
      <img
        src={backgroundGif}
        alt="Background Animation"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-80 z-0" />

      {/* Main Content */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-start p-0">
        {/* Paloma Logo with 3D Spin on Hover */}
        

        {/* Welcome Title */}
        <h1 className=" uppercase  font-erbaum font-extrabold text-3xl text-[white] mt-4 text-center">
          Welcome to The Nest,
           {user.username || user.id}!
        </h1>

        {/* Module Selector Prompt */}
        <h2 className="text-base font-bold font-erbaum mt-6 mb-6 text-white">SELECT A HUB:</h2>

        {/* FLY-IQ, FLY-HQ, FLY-MFV Cards */}
        <div className="flex justify-center items-start w-full max-w-6xl gap-10 flex-wrap px-4">
          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* FLY-IQ Card (Green Border) */}
          <div
            onClick={() => (window.location.href = '/fly-iq')}
            className="
              cursor-pointer 
              bg-[black] bg-opacity-80 
              rounded-2xl 
              w-80 h-[24rem] 
              p-5 
              flex flex-col 
              items-center 
              text-center 
              backdrop-blur-md 
              border border-[#6a7257] 
              border-2
              shadow-lg 
              hover:scale-105 hover:shadow-xl 
              transition-all duration-300
            "
          >
            <img
              src={flyIqLogo}
              alt="FLY-IQ Logo"
              className="w-52 mb-4 drop-shadow"
            />
            
            <div className="text-gray-300 font-erbaum font-bold text-sm  text-bold leading-snug">
              <p>• Interactive Field Training</p>
              <p>• Paloma Points</p>
              <p>• Paloma Shop Access</p>
            </div>
          </div>

          {/* FLY-HQ Card (Blue Border) */}
          <div
            onClick={() => (window.location.href = '/fly-hq-tools')}
            className="
              cursor-pointer 
              bg-[black] bg-opacity-80 
              rounded-2xl 
              w-80 h-[24rem] 
              p-5 
              flex flex-col 
              items-center 
              text-center 
              backdrop-blur-md 
              border border-[#6a7257] 
              border-2
              shadow-lg 
              hover:scale-105 hover:shadow-xl 
              transition-all duration-300
            "
          >
            <img
              src={flyHqLogo}
              alt="FLY-HQ Logo"
              className="w-52 mb-4 drop-shadow"
            />
            
            <div className="text-gray-300 font-erbaum font-bold text-sm text-bold leading-snug">
              <p>• Asset Management</p>
              <p>• Job Planner</p>
              <p>• Sourcing</p>
            </div>
          </div>

          {/* FLY-MFV Card (Red Border) */}
          <div
            onClick={() => (window.location.href = '/fly-mfv')}
            className="
              cursor-pointer 
              bg-[black] bg-opacity-80 
              rounded-2xl 
              w-80 h-[24rem] 
              p-5 
              flex flex-col 
              items-center 
              text-center 
              backdrop-blur-md 
              border border-[#6a7257] 
              border-2
              shadow-lg 
              hover:scale-105 hover:shadow-xl 
              transition-all duration-300
            "
          >
            <img
              src={FLYBASELogo}
              alt="FLY-BASE.png"
              className="w-52 mb-4 drop-shadow"
            />
            
            <div className="text-gray-300 font-erbaum font-bold text-sm text-bold leading-snug">
              <p>• Valve Reports</p>
              <p>• Valve Documentation</p>
              <p>• Shop guides </p>
            </div>
          </div>
          {/* ───────────────────────────────────────────────────────────────────────── */}
        </div>

      
      </div>
    </div>
  );
}
