import React, { useEffect, useState } from 'react';

export default function Leaderboard({ onClose }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/leaderboard')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load leaderboard:', err));
  }, []);

  const renderList = (title, moduleId) => {
    const filtered = data
      .filter(entry => entry.module === moduleId)
      .sort((a, b) => b.score - a.score);

    return (
      <div className="flex-1 p-4">
        <h2 className="text-xl font-bold text-center mb-2">{title}</h2>
        <ul className="space-y-2">
          {filtered.length > 0 ? (
            filtered.map((entry, i) => (
              <li key={entry.userId + moduleId} className="flex justify-between bg-[#2b2b2b] px-4 py-2 rounded">
                <span>{i + 1}. {entry.username}</span>
                <span className="text-green-400 font-semibold">{entry.score} XP</span>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-400">No scores yet.</li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-[#1c1c1c] text-white max-w-4xl w-full rounded-xl p-6 shadow-xl relative flex flex-col sm:flex-row gap-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-white text-lg hover:text-red-500"
        >
          ✕
        </button>
        {renderList('🧠 The Name Game', 'module1')}
        {renderList('🧩 Gaskets 101', 'module2')}
      </div>
    </div>
  );
}
