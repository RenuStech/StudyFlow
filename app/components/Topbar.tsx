
'use client';

import { useEffect, useState } from 'react';

export default function Topbar() {
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setDarkMode(
        localStorage.getItem('studyflow_dark_mode') === 'true'
      );
    };

    updateTheme();

    window.addEventListener('storage', updateTheme);
    window.addEventListener('studyflow-theme-change', updateTheme);

    return () => {
      window.removeEventListener('storage', updateTheme);
      window.removeEventListener('studyflow-theme-change', updateTheme);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 flex h-20 items-center justify-between border-b px-4 transition-colors duration-200 sm:px-8 ${
        darkMode
          ? 'border-slate-700 bg-slate-900'
          : 'border-pink-100 bg-white'
      }`}
    >
      {/* Search */}
      <div className="relative w-80 max-w-[55%]">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">
          🔍
        </span>

        <input
          type="text"
          placeholder="Search your study space..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200 ${
            darkMode
              ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-400'
              : 'border-pink-100 bg-pink-50/50 text-slate-800 placeholder:text-slate-500'
          }`}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className={`relative flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
            darkMode
              ? 'bg-slate-800 hover:bg-slate-700'
              : 'bg-pink-50 hover:bg-pink-100'
          }`}
        >
          🔔
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-pink-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-purple-200 text-lg">
            🌸
          </div>

          <div className="hidden sm:block">
            <p
              className={`text-sm font-semibold ${
                darkMode ? 'text-slate-100' : 'text-slate-800'
              }`}
            >
              Study Girl
            </p>
            <p
              className={`text-xs ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Keep sparkling ✨
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
