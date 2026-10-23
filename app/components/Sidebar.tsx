
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const menuItems = [
  { name: 'Dashboard', icon: '🏠', path: '/' },
  { name: 'My Tasks', icon: '📝', path: '/tasks' },
  { name: 'Study Sessions', icon: '📚', path: '/sessions' },
  { name: 'Subjects', icon: '🌸', path: '/subjects' },
  { name: 'Notes', icon: '💌', path: '/notes' },
  { name: 'Progress', icon: '✨', path: '/progress' },
  { name: 'Settings', icon: '⚙️', path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = () => {
      setDarkMode(localStorage.getItem('studyflow_dark_mode') === 'true');
    };

    loadTheme();

    window.addEventListener('storage', loadTheme);
    window.addEventListener('studyflow-theme-change', loadTheme);

    return () => {
      window.removeEventListener('storage', loadTheme);
      window.removeEventListener('studyflow-theme-change', loadTheme);
    };
  }, []);

  return (
    <aside
      className={`sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r px-4 py-6 transition-colors duration-200 md:flex ${
        darkMode
          ? 'border-slate-700 bg-slate-950'
          : 'border-pink-100 bg-white'
      }`}
    >
      <Link href="/" className="mb-8 flex items-center gap-3 px-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-xl">
          🎀
        </div>

        <div>
          <h1 className="text-lg font-bold text-pink-600">
            StudyFlow
          </h1>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            study • grow • sparkle ✨
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-2">
        <p className={`mb-3 px-3 text-xs font-semibold uppercase tracking-wider ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Menu
        </p>

        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-pink-100 text-pink-700 shadow-sm'
                  : darkMode
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-pink-300'
                    : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>

              {isActive && (
                <span className="ml-auto text-xs">♡</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`rounded-3xl p-4 ${
        darkMode
          ? 'bg-slate-800'
          : 'bg-gradient-to-br from-pink-50 to-purple-50'
      }`}>
        <div className="mb-2 text-xl">🌷</div>

        <p className={`text-sm font-semibold ${
          darkMode ? 'text-slate-100' : 'text-slate-800'
        }`}>
          Keep going!
        </p>

        <p className={`mt-1 text-xs leading-5 ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Every little step brings you closer to your goals. ✨
        </p>
      </div>
    </aside>
  );
}
