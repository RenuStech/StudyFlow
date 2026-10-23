'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

interface Session {
  id: number;
  subject_id: number | null;
  duration: number;
  scheduled_for: string | null;
  completed: boolean;
  completed_at: string | null;
}

interface Subject {
  id: number;
  name: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState('45');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [sessionsData, subjectsData] = await Promise.all([
        apiRequest('/api/sessions/'),
        apiRequest('/api/subjects/'),
      ]);

      setSessions(sessionsData);
      setSubjects(subjectsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load your study sessions.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const completedSessions = sessions.filter(
    (session) => session.completed
  ).length;

  const totalMinutes = sessions.reduce(
    (total, session) => total + session.duration,
    0
  );

  function getSubjectName(id: number | null) {
    if (id === null) return 'General Study';

    return (
      subjects.find((subject) => subject.id === id)?.name ??
      'Unknown Subject'
    );
  }

  async function addSession() {
    setError('');
    setMessage('');

    const minutes = Number(duration);

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
      setError('Enter a whole number between 1 and 1440 minutes.');
      return;
    }

    setSaving(true);

    try {
      const newSession = await apiRequest('/api/sessions/', {
        method: 'POST',
        body: JSON.stringify({
          subject_id: subjectId ? Number(subjectId) : null,
          duration: minutes,
          scheduled_for: null,
        }),
      });

      setSessions((current) => [...current, newSession]);
      setSubjectId('');
      setDuration('45');
      setMessage('Study session added successfully! 💗');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create the session.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleSession(session: Session) {
    setError('');
    setMessage('');

    try {
      const updatedSession = await apiRequest(
        `/api/sessions/${session.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            completed: !session.completed,
          }),
        }
      );

      setSessions((current) =>
        current.map((item) =>
          item.id === session.id ? updatedSession : item
        )
      );

      setMessage(
        updatedSession.completed
          ? 'Session marked as completed! ✨'
          : 'Session marked as incomplete.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update the session.'
      );
    }
  }

  async function deleteSession(id: number) {
    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/sessions/${id}`, {
        method: 'DELETE',
      });

      setSessions((current) =>
        current.filter((session) => session.id !== id)
      );

      setMessage('Study session deleted successfully.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete the session.'
      );
    }
  }

  function formatDate(date: string | null) {
    if (!date) return 'Not scheduled';

    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <main className="min-h-screen bg-[#fff9fc] p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-purple-700">
            Focus time 🌷
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Study Sessions 📚
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Plan your study time and keep your focus streak going. ✨
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-pink-200 bg-pink-50 p-4 text-sm font-medium text-pink-800">
            {message}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-pink-200 bg-white p-5 shadow-sm">
            <p className="text-2xl">📚</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {sessions.length}
            </p>
            <p className="text-sm font-medium text-slate-600">
              Total sessions
            </p>
          </div>

          <div className="rounded-3xl border border-purple-200 bg-white p-5 shadow-sm">
            <p className="text-2xl">⏰</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {totalMinutes} min
            </p>
            <p className="text-sm font-medium text-slate-600">
              Planned study time
            </p>
          </div>

          <div className="rounded-3xl border border-rose-200 bg-white p-5 shadow-sm">
            <p className="text-2xl">✨</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {completedSessions}
            </p>
            <p className="text-sm font-medium text-slate-600">
              Completed sessions
            </p>
          </div>
        </div>

        {/* Create session */}
        <div className="mb-6 rounded-3xl border border-pink-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Plan a study session 💗
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Choose a subject and enter your preferred study duration.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px_auto]">
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            >
              <option value="">General Study (no subject)</option>

              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <div>
              <input
                type="number"
                min="1"
                max="1440"
                step="1"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === '-' || event.key === 'e') {
                    event.preventDefault();
                  }
                }}
                placeholder="Minutes"
                aria-label="Study duration in minutes"
                className="w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-500 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />

              <p className="mt-1 text-xs font-medium text-slate-600">
                Duration in minutes (1–1440)
              </p>
            </div>

            <button
              type="button"
              onClick={() => void addSession()}
              disabled={saving}
              className="rounded-2xl bg-pink-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : '+ Add'}
            </button>
          </div>
        </div>

        {/* Session list */}
        {loading ? (
          <p className="py-10 text-center text-sm font-medium text-slate-600">
            Loading your study sessions... 📚
          </p>
        ) : sessions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-pink-300 bg-white p-10 text-center">
            <div className="text-4xl">📚</div>

            <p className="mt-3 font-bold text-slate-900">
              No study sessions yet
            </p>

            <p className="mt-1 text-sm font-medium text-slate-600">
              Plan your first session above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center gap-4 rounded-3xl border bg-white p-5 shadow-sm ${
                  session.completed
                    ? 'border-green-200'
                    : 'border-purple-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => void toggleSession(session)}
                  aria-label={
                    session.completed
                      ? 'Mark session incomplete'
                      : 'Mark session completed'
                  }
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${
                    session.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {session.completed ? '✓' : '📚'}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`font-bold ${
                      session.completed
                        ? 'text-slate-500 line-through'
                        : 'text-slate-800'
                    }`}
                  >
                    {getSubjectName(session.subject_id)}
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    🌸 {formatDate(session.scheduled_for)} · ⏰{' '}
                    {session.duration} minutes
                  </p>

                  {session.completed && (
                    <p className="mt-1 text-xs font-semibold text-green-700">
                      Completed
                      {session.completed_at
                        ? ` on ${formatDate(session.completed_at)}`
                        : ''}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void deleteSession(session.id)}
                  aria-label="Delete study session"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}