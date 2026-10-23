'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

interface Note {
  id: number;
  title: string;
  content: string;
  subject_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [notesData, subjectsData] = await Promise.all([
        apiRequest('/api/notes/'),
        apiRequest('/api/subjects/'),
      ]);

      setNotes(notesData);
      setSubjects(subjectsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load your notes.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function addNote() {
    if (!title.trim() || !content.trim()) {
      setError('Please enter both a title and note content.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const newNote = await apiRequest('/api/notes/', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          subject_id: subjectId ? Number(subjectId) : null,
        }),
      });

      setNotes((current) => [newNote, ...current]);
      setTitle('');
      setContent('');
      setSubjectId('');
      setMessage('Your note has been saved! 💗');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save the note.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: number) {
    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      setNotes((current) => current.filter((note) => note.id !== id));

      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }

      setMessage('Note deleted successfully.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not delete the note.'
      );
    }
  }

  function getSubjectName(id: number | null) {
    if (id === null) return 'General';
    return subjects.find((subject) => subject.id === id)?.name ?? 'Subject';
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <main className="min-h-screen bg-[#fff9fc] p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-pink-500">
            Your little knowledge corner 🌷
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            My Notes 💌
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Save important things so you can find them later. ✨
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Create a new note 💗
          </h2>

          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              className="w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm text-slate-700 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
            />

            <textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm text-slate-700 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className="rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-slate-600 outline-none"
              >
                <option value="">General (no subject)</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={addNote}
                disabled={saving}
                className="rounded-2xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : '+ Save Note'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-pink-100 bg-pink-50 p-4 text-sm text-pink-700">
            {message}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Loading your notes... 💗
          </p>
        ) : notes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white p-10 text-center">
            <div className="text-4xl">💌</div>
            <p className="mt-3 font-semibold text-slate-700">No notes yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Create your first study note above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-xl">
                    💌
                  </div>

                  <button
                    type="button"
                    onClick={() => void deleteNote(note.id)}
                    aria-label={`Delete ${note.title}`}
                    className="rounded-xl px-2 py-1 text-sm text-slate-300 transition hover:bg-red-50 hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>

                <h2 className="mt-4 font-bold text-slate-800">
                  {note.title}
                </h2>

                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                  {note.content}
                </p>

                <div className="mt-5 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-500">
                    🌸 {getSubjectName(note.subject_id)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(note.created_at)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNote(note)}
                  className="mt-4 w-full rounded-2xl bg-pink-50 py-2.5 text-sm font-medium text-pink-600 transition hover:bg-pink-100"
                >
                  Read Note 💗
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-5">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-pink-500">
                  💌 {getSubjectName(selectedNote.subject_id)}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-800">
                  {selectedNote.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                aria-label="Close note"
                className="rounded-xl bg-pink-50 px-3 py-2 text-pink-500"
              >
                ✕
              </button>
            </div>

            <p className="mt-6 max-h-[55vh] overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {selectedNote.content}
            </p>

            <button
              type="button"
              onClick={() => setSelectedNote(null)}
              className="mt-6 w-full rounded-2xl bg-pink-500 py-3 text-sm font-semibold text-white hover:bg-pink-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}