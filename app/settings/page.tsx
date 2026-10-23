
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';

type ProfileSettings = {
  id?: number;
  name: string;
  email: string;
  dark_mode: boolean;
  notifications: boolean;
};

function applyTheme(enabled: boolean) {
  localStorage.setItem('studyflow_dark_mode', String(enabled));

  document.documentElement.classList.toggle('dark', enabled);
  document.body.classList.toggle('dark', enabled);

  window.dispatchEvent(new Event('studyflow-theme-change'));
}

export default function SettingsPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('studyflow_token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const profile = (await apiRequest(
        '/api/auth/me'
      )) as ProfileSettings;

      setName(profile.name ?? '');
      setEmail(profile.email ?? '');
      setDarkMode(profile.dark_mode ?? false);
      setNotifications(profile.notifications ?? true);

      applyTheme(profile.dark_mode ?? false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not load settings.';

      if (
        message.includes('401') ||
        /unauthorized|not authenticated|credentials|token/i.test(message)
      ) {
        localStorage.removeItem('studyflow_token');
        router.replace('/login');
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function handleDarkModeChange(enabled: boolean) {
    setDarkMode(enabled);
    setSaved(false);
    applyTheme(enabled);
  }

  async function saveSettings() {
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const result = (await apiRequest('/api/auth/settings', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          dark_mode: darkMode,
          notifications,
        }),
      })) as ProfileSettings;

      setName(result.name);
      setEmail(result.email);
      setDarkMode(result.dark_mode);
      setNotifications(result.notifications);

      applyTheme(result.dark_mode);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save settings.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function resetSettings() {
    setSaved(false);
    await loadSettings();
  }

  // Log out the current user
  function handleLogout() {
    localStorage.removeItem('studyflow_token');
    router.replace('/login');
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff9fc] p-8 text-slate-800">
        <p className="font-semibold">Loading your settings... 🌸</p>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen p-6 transition-colors duration-200 md:p-8 ${
        darkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-[#fff9fc] text-slate-800'
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-pink-600">
            Make StudyFlow yours 🌸
          </p>
          <h1 className="mt-2 text-3xl font-bold">Settings ⚙️</h1>
          <p
            className={`mt-2 text-sm ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Manage your profile and study preferences.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 font-medium text-red-800"
          >
            {error}
          </div>
        )}

        {saved && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-green-300 bg-green-50 p-4 font-semibold text-green-800"
          >
            Settings saved successfully! 🌷
          </div>
        )}

        <section
          className={`mb-6 rounded-3xl border p-6 shadow-sm ${
            darkMode
              ? 'border-slate-700 bg-slate-900'
              : 'border-pink-200 bg-white'
          }`}
        >
          <h2 className="text-lg font-bold">Profile 💗</h2>
          <p
            className={`mt-1 text-sm ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Update your basic information.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-semibold"
              >
                Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSaved(false);
                }}
                required
                className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 ${
                  darkMode
                    ? 'border-slate-600 bg-slate-800 text-white'
                    : 'border-pink-200 bg-white text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-semibold"
              >
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSaved(false);
                }}
                required
                className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 ${
                  darkMode
                    ? 'border-slate-600 bg-slate-800 text-white'
                    : 'border-pink-200 bg-white text-slate-900'
                }`}
              />
              <p
                className={`mt-2 text-xs ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                If you change your email, use the new email next time you log in.
              </p>
            </div>
          </div>
        </section>

        <section
          className={`mb-6 rounded-3xl border p-6 shadow-sm ${
            darkMode
              ? 'border-slate-700 bg-slate-900'
              : 'border-purple-200 bg-white'
          }`}
        >
          <h2 className="text-lg font-bold">Preferences 🌷</h2>

          <div className="mt-5 space-y-4">
            <label
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-4 ${
                darkMode ? 'bg-slate-800' : 'bg-pink-50'
              }`}
            >
              <div>
                <p className="text-sm font-bold">Study reminders</p>
                <p
                  className={`mt-1 text-xs ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Save your reminder preference.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(event) => {
                  setNotifications(event.target.checked);
                  setSaved(false);
                }}
                className="h-5 w-5 accent-pink-600"
              />
            </label>

            <label
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-4 ${
                darkMode ? 'bg-slate-800' : 'bg-purple-50'
              }`}
            >
              <div>
                <p className="text-sm font-bold">Dark mode</p>
                <p
                  className={`mt-1 text-xs ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Apply the dark theme to the sidebar too.
                </p>
              </div>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(event) =>
                  handleDarkModeChange(event.target.checked)
                }
                className="h-5 w-5 accent-pink-600"
              />
            </label>
          </div>
        </section>

        <section
          className={`mb-6 rounded-3xl border p-6 shadow-sm ${
            darkMode
              ? 'border-slate-700 bg-slate-900'
              : 'border-rose-200 bg-white'
          }`}
        >
          <h2 className="text-lg font-bold">Current Profile ✨</h2>

          <div
            className={`mt-4 flex items-center gap-4 rounded-2xl p-4 ${
              darkMode
                ? 'bg-slate-800'
                : 'bg-gradient-to-r from-pink-50 to-purple-50'
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl">
              🌸
            </div>

            <div className="min-w-0">
              <p className="break-words font-bold">{name}</p>
              <p
                className={`break-words text-sm ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {email}
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 rounded-2xl bg-pink-600 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : saved ? '✓ Settings Saved!' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={resetSettings}
            disabled={saving}
            className={`flex-1 rounded-2xl border py-3 font-semibold transition disabled:opacity-60 ${
              darkMode
                ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800'
                : 'border-pink-200 bg-white text-pink-800 hover:bg-pink-50'
            }`}
          >
            Discard Changes
          </button>
        </div>

        {/* Log Out button */}
        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
          >
            Log Out
          </button>
        </div>
      </div>
    </main>
  );
}
