
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from './lib/api';

type DashboardData = {
  total_subjects: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_sessions: number;
  completed_sessions: number;
  total_notes: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('studyflow_token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const data = await apiRequest('/api/dashboard/');
      setDashboard(data as DashboardData);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not load your dashboard.';

      if (
        message.toLowerCase().includes('token') ||
        message.toLowerCase().includes('credentials') ||
        message.toLowerCase().includes('unauthorized') ||
        message.includes('401')
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
    void loadDashboard();
  }, [loadDashboard]);

  const pageClass = darkMode
    ? 'min-h-screen bg-slate-950 p-6 text-slate-100 transition-colors duration-200 md:p-10'
    : 'min-h-screen bg-[#fff9fc] p-6 text-slate-800 transition-colors duration-200 md:p-10';

  if (loading) {
    return (
      <main className={pageClass}>
        <p className="text-lg font-semibold">
          Loading your StudyFlow dashboard... 🌸
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={pageClass}>
        <div className={`mx-auto max-w-3xl rounded-2xl border p-6 shadow-sm ${
          darkMode
            ? 'border-slate-700 bg-slate-900'
            : 'border-pink-200 bg-white'
        }`}>
          <h1 className="text-2xl font-bold">
            Could not load your dashboard
          </h1>

          <p className={`mt-3 ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {error}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={loadDashboard}
              className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
            >
              Try Again
            </button>

            <button
              onClick={() => router.push('/login')}
              className={`rounded-xl border px-5 py-3 font-semibold ${
                darkMode
                  ? 'border-slate-600 text-slate-100 hover:bg-slate-800'
                  : 'border-pink-200 text-slate-800 hover:bg-pink-50'
              }`}
            >
              Return to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className={pageClass}>
        <p>No dashboard data is available.</p>
        <button
          onClick={loadDashboard}
          className="mt-4 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
        >
          Load Dashboard
        </button>
      </main>
    );
  }

  const cards = [
    {
      title: 'My Subjects',
      value: dashboard.total_subjects,
      icon: '🌸',
      description: 'Subjects you are learning',
    },
    {
      title: 'Total Tasks',
      value: dashboard.total_tasks,
      icon: '📝',
      description: 'Tasks in your study plan',
    },
    {
      title: 'Completed Tasks',
      value: dashboard.completed_tasks,
      icon: '✅',
      description: 'Tasks you have finished',
    },
    {
      title: 'Pending Tasks',
      value: dashboard.pending_tasks,
      icon: '⏳',
      description: 'Tasks left to complete',
    },
    {
      title: 'Study Sessions',
      value: dashboard.total_sessions,
      icon: '📚',
      description: 'Sessions created',
    },
    {
      title: 'Completed Sessions',
      value: dashboard.completed_sessions,
      icon: '✨',
      description: 'Sessions marked complete',
    },
    {
      title: 'My Notes',
      value: dashboard.total_notes,
      icon: '💌',
      description: 'Notes saved in StudyFlow',
    },
  ];

  const completion =
    dashboard.total_tasks > 0
      ? Math.round(
          (dashboard.completed_tasks / dashboard.total_tasks) * 100
        )
      : 0;

  return (
    <main className={pageClass}>
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-pink-500">
          YOUR LITTLE STUDY SPACE 🌷
        </p>

        <h1 className={`mt-2 text-3xl font-bold md:text-4xl ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Welcome to StudyFlow!
        </h1>

        <p className={`mt-3 ${
          darkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Every little step brings you closer to your goals. 💗
        </p>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-3xl border p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md ${
                darkMode
                  ? 'border-slate-700 bg-slate-900 hover:border-pink-500'
                  : 'border-pink-200 bg-white hover:border-pink-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={`font-semibold ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  {card.title}
                </p>

                <span className="text-2xl" aria-hidden="true">
                  {card.icon}
                </span>
              </div>

              <p className={`mt-4 text-4xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {card.value}
              </p>

              <p className={`mt-2 text-sm ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {card.description}
              </p>
            </div>
          ))}
        </section>

        <section className={`mt-6 rounded-3xl border p-6 shadow-sm ${
          darkMode
            ? 'border-slate-700 bg-slate-900'
            : 'border-purple-200 bg-white'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Your Task Progress ✨
              </h2>

              <p className={`mt-1 text-sm ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Progress based on your completed tasks.
              </p>
            </div>

            <span className="text-2xl font-bold text-pink-500">
              {completion}%
            </span>
          </div>

          <div
            className={`mt-5 h-3 overflow-hidden rounded-full ${
              darkMode ? 'bg-slate-700' : 'bg-pink-100'
            }`}
            role="progressbar"
            aria-label="Task completion"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-pink-600 transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>

          <p className={`mt-3 text-sm font-medium ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {dashboard.completed_tasks} of {dashboard.total_tasks} tasks completed
          </p>
        </section>
      </div>
    </main>
  );
}
