 'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';

interface Subject {
  id: number;
  name: string;
  icon: string;
  color: string;
  progress: number;
}

const colors = [
  { name: 'pink', className: 'bg-pink-100' },
  { name: 'purple', className: 'bg-purple-100' },
  { name: 'rose', className: 'bg-rose-100' },
  { name: 'fuchsia', className: 'bg-fuchsia-100' },
];

export default function SubjectsPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📚');
  const [newColor, setNewColor] = useState('pink');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadSubjects = useCallback(async () => {
    try {
      setError('');
      const data = await apiRequest('/api/subjects');
      setSubjects(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      const text =
        err instanceof Error ? err.message : 'Could not load subjects.';

      if (
        text.toLowerCase().includes('token') ||
        text.toLowerCase().includes('credentials') ||
        text.includes('401')
      ) {
        localStorage.removeItem('studyflow_token');
        router.push('/login');
        return;
      }

      setError(text);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem('studyflow_token')) {
      router.push('/login');
      return;
    }

    void loadSubjects();
  }, [loadSubjects, router]);

  const filteredSubjects = useMemo(
    () =>
      subjects.filter((subject) =>
        subject.name.toLowerCase().includes(search.toLowerCase())
      ),
    [subjects, search]
  );

  async function addSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newName.trim()) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await apiRequest('/api/subjects', {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          icon: newIcon,
          color: newColor,
        }),
      });

      setNewName('');
      setNewIcon('📚');
      setNewColor('pink');
      setMessage('Subject added successfully! 🌷');

      await loadSubjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not add subject.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubject(id: number) {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/subjects/${id}`, {
        method: 'DELETE',
      });

      setSubjects((current) =>
        current.filter((subject) => subject.id !== id)
      );

      setMessage('Subject deleted successfully.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not delete subject.'
      );
    }
  }

  async function increaseProgress(subject: Subject) {
    const nextProgress = Math.min(subject.progress + 5, 100);

    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/subjects/${subject.id}`, {
        method: 'PUT',
        body: JSON.stringify({ progress: nextProgress }),
      });

      setSubjects((current) =>
        current.map((item) =>
          item.id === subject.id
            ? { ...item, progress: nextProgress }
            : item
        )
      );

      setMessage(`Progress updated for ${subject.name}! 💗`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update progress.'
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#fff9fc] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-pink-500">
            Your learning garden 🌷
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            My Subjects 🌸
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Organize your subjects and track your learning progress.
          </p>
        </header>

        <form
          onSubmit={addSubject}
          className="mb-6 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-800">
            Add a new subject ✨
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Subject name"
              required
              maxLength={100}
              className="rounded-xl border border-pink-100 px-4 py-3 text-slate-800 outline-none focus:border-pink-300"
            />

            <select
              value={newIcon}
              onChange={(event) => setNewIcon(event.target.value)}
              className="rounded-xl border border-pink-100 bg-white px-4 py-3 text-slate-700"
              aria-label="Choose subject icon"
            >
              <option value="📚">📚 Books</option>
              <option value="🐍">🐍 Python</option>
              <option value="🤖">🤖 AI / ML</option>
              <option value="🌐">🌐 Networks</option>
              <option value="📐">📐 Mathematics</option>
              <option value="💻">💻 Programming</option>
            </select>

            <select
              value={newColor}
              onChange={(event) => setNewColor(event.target.value)}
              className="rounded-xl border border-pink-100 bg-white px-4 py-3 text-slate-700"
              aria-label="Choose subject color"
            >
              {colors.map((color) => (
                <option key={color.name} value={color.name}>
                  {color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-pink-500 px-4 py-3 font-semibold text-white transition hover:bg-pink-600 disabled:opacity-60"
            >
              {saving ? 'Adding...' : '+ Add Subject'}
            </button>
          </div>
        </form>

        <input
          type="search"
          placeholder="🔍 Search your subjects..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-6 w-full max-w-md rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none shadow-sm focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
        />

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <p
            role="status"
            className="mb-5 rounded-2xl bg-pink-50 p-4 text-sm text-pink-700"
          >
            {message}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-slate-500">
            Growing your subject garden... 🌱
          </p>
        ) : filteredSubjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white p-10 text-center">
            <div className="text-4xl">🌷</div>
            <p className="mt-3 font-semibold text-slate-700">
              {search ? 'No subjects found' : 'Your garden is empty'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? 'Try another search.'
                : 'Add your first subject above to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredSubjects.map((subject) => {
              const color =
                colors.find((item) => item.name === subject.color) ??
                colors[0];

              return (
                <article
                  key={subject.id}
                  className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${color.className}`}
                      >
                        {subject.icon || '📚'}
                      </div>

                      <div>
                        <h2 className="font-bold text-slate-800">
                          {subject.name}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Your learning progress
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void deleteSubject(subject.id)}
                      aria-label={`Delete ${subject.name}`}
                      className="rounded-xl px-3 py-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-pink-600">
                        {subject.progress}%
                      </span>
                    </div>

                    <div
                      className="h-3 overflow-hidden rounded-full bg-pink-50"
                      role="progressbar"
                      aria-valuenow={subject.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500"
                        style={{
                          width: `${subject.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void increaseProgress(subject)}
                    disabled={subject.progress >= 100}
                    className="mt-5 w-full rounded-2xl bg-pink-50 py-3 text-sm font-medium text-pink-700 transition hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {subject.progress >= 100
                      ? '✨ Completed'
                      : 'I studied this today 💗 (+5%)'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}