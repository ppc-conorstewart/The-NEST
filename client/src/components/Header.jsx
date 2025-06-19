// src/components/Header.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [user, setUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('flyiq_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('flyiq_user')
      }
    }
  }, [])

  const onClickLogin = () => {
  window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/discord`;
}


  const onClickLogout = () => {
    localStorage.removeItem('flyiq_user')
    setUser(null)
    window.location.href = '/'
  }

  // Construct a proper Discord CDN URL (or fallback to default avatar)
  const getAvatarUrl = () => {
    if (!user) return ''
    // If it's already a full URL (unlikely), just use it
    if (user.avatar?.startsWith('http')) {
      return user.avatar
    }
    // If no custom avatar, use one of Discord's default embed avatars
    if (!user.avatar) {
      const disc = user.discriminator ?? '0'
      const defaultIndex = parseInt(disc, 10) % 5
      return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`
    }
    // Otherwise, build the CDN path
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
  }

  return (
    <header
      className="relative w-full backdrop backdrop-blur-lg border-b border-black/30 shadow-md px-4 py-0 flex items-center justify-between z-20"
      style={{ minHeight: '3rem' }}
    >
      {/* Foreground content */}
      <div
        className="relative flex items-center justify-between w-full"
        style={{ minHeight: '3rem' }}
      >
        {/* Centered Paloma logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img src="/assets/headerlogo.png" alt="Paloma Logo" className="h-8" />
        </div>

        {/* Left spacer */}
        <div className="w-8" />

        {/* Right: Contact List & Auth buttons */}
        <div className="flex items-center space-x-4 text-white">
          {user ? (
            <>
              <Link
                to="/contact-list"
                className="hover:opacity-80 transition text-white font-bold text-sm"
              >
                Contact List
              </Link>
              <div className="flex items-center bg-black px-2 py-1 rounded-md text-xs">
                <img
                  src={getAvatarUrl()}
                  alt="Discord Avatar"
                  className="w-6 h-6 rounded-full mr-2 border border-white"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png'
                  }}
                />
                <span className="font-semibold">{user.username || user.id}</span>
              </div>
              <button
                onClick={onClickLogout}
                className="bg-red-600 hover:bg-red-700 transition font-bold text-white px-2 py-1 rounded-md text-xs"
              >
                LOG OUT
              </button>
            </>
          ) : (
            <button
              onClick={onClickLogin}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-3 py-1 rounded-md text-sm"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
