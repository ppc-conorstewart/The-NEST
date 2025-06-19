// src/pages/ModuleSelector.jsx

import React, { useState, useEffect } from 'react';
import Leaderboard from '../components/Leaderboard';

const flyIqLogo = '/assets/logo.png';

export default function ModuleSelector() {
  const [user, setUser] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [palomaPointsMap, setPalomaPointsMap] = useState(() =>
    JSON.parse(localStorage.getItem('flyiq_points_map') || '{}')
  );

  const userPoints = user ? (palomaPointsMap[user.id] || 0) : 0;

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('flyiq_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleDiscordLogin = () => {
    window.location.href = 'http://localhost:3001/auth/discord';
  };

  const redeemItem = (item) => {
    if (!user) return alert("Login first");
    const current = palomaPointsMap[user.id] || 0;
    if (current < item.cost) return alert("Not enough Paloma Points🪙!");
    const updated = { ...palomaPointsMap, [user.id]: current - item.cost };
    setPalomaPointsMap(updated);
    localStorage.setItem('flyiq_points_map', JSON.stringify(updated));
    alert(`Redeemed: ${item.name}`);
  };

  const shopItems = [
    { name: 'Paloma Hat', description: 'A stylish cap embroidered with the Paloma logo.', cost: 50, image: '/assets/shop/hat.png' },
    { name: 'Paloma Pen', description: 'Sleek metal ballpoint pen with Paloma branding.', cost: 30, image: '/assets/shop/pen.png' },
    { name: 'Paloma Journal', description: 'Lined leather-bound journal for field notes.', cost: 60, image: '/assets/shop/journal.png' },
    { name: 'Paloma Mystery Box', description: 'A surprise bundle of Paloma merch!', cost: 100, image: '/assets/shop/mysterybox.png' },
    { name: 'Paloma Decanter with Whiskey Glasses', description: 'Premium decanter set with custom glasses.', cost: 150, image: '/assets/shop/decanter.png' }
  ];

  return (
    <div className="min-h-screen w-full bg-black text-white flex justify-center items-center p-6 relative">
      <button
        onClick={() => window.location.href = '/'}
        className="absolute top-4 left-4 px-4 py-2 bg-black border border-white rounded-md text-white text-sm hover:bg-white hover:text-black transition"
      >
        ← Return to Paloma Suite
      </button>

      <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-6">
        <img src={flyIqLogo} alt="FLY-IQ Logo" className="w-48 sm:w-56 md:w-64 lg:w-72 xl:w-[300px] drop-shadow-xl mt-8" />

        {!user ? (
          <button
            onClick={handleDiscordLogin}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg text-lg font-semibold transition shadow-md"
          >
            Login with Discord
          </button>
        ) : (
          <>
            <h2 className="text-lg font-bold">Welcome, {user.username}</h2>
            <p>Your Paloma Points: 🪙 <strong>{userPoints}</strong></p>

            <div className="flex justify-center gap-6 mt-4">
              <button
                onClick={() => setShowLeaderboard(true)}
                className="px-6 py-3 border border-white rounded-xl hover:bg-white hover:text-black transition"
              >
                Leaderboard
              </button>
              <button
                onClick={() => setShowShop(true)}
                className="px-6 py-3 border border-white rounded-xl hover:bg-white hover:text-black transition"
              >
                Shop
              </button>
            </div>

            <h2 className="text-xl font-bold pt-4">Select a Module to Start Earning:</h2>
            <div className="flex flex-wrap justify-center gap-8">
              <button
                onClick={() => alert('Module 1 selected')}
                className="module-btn"
              >
                Module 1<br/><small>The Name Game</small>
              </button>
              <button
                onClick={() => alert('Module 2 selected')}
                className="module-btn"
              >
                Module 2<br/><small>Gaskets 101</small>
              </button>
            </div>
          </>
        )}

        {showLeaderboard && (
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        )}

        {showShop && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-black p-6 rounded-xl shadow-2xl max-w-lg w-full text-white relative">
              <h2 className="text-2xl mb-4">Shop</h2>
              <p>Your Points: 🪙 <strong>{userPoints}</strong></p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {shopItems.map((it,i) => (
                  <div key={i} className="p-3 bg-[#2b2b2b] rounded flex flex-col items-center">
                    <img src={it.image} alt={it.name} className="h-20 mx-auto mb-2"/>
                    <h3 className="font-semibold">{it.name}</h3>
                    <p className="text-xs mb-2">{it.description}</p>
                    <button
                      onClick={() => redeemItem(it)}
                      className="bg-green-600 py-1 rounded text-xs"
                    >
                      Redeem ({it.cost})
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowShop(false)}
                className="absolute top-2 right-3 text-xl text-white hover:text-red-400"
              >
                ✖
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
