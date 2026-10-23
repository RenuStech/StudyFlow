'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

type Priority = 'High' | 'Medium' | 'Low';

interface Subject {
  id: number;
  name: string;
  icon?: string;
}

interface Task {
  id: number;
  title: string;
  subject_id: number | null;
  priority: Priority;
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');

      const [taskData, subjectData] = await Promise.all([
        apiRequest('/api/tasks/'),
        apiRequest('/api/subjects'),
      ]);

      setTasks(Array.isArray(taskData) ? taskData : taskData.items ?? []);
      setSubjects(
        Array.isArray(subjectData)
          ? subjectData
          : subjectData.items ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load your tasks.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [tasks, search]);

  const completedCount = tasks.filter((task) => task.completed).length;

  async function addTask() {
    if (!newTask.trim() || saving) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const createdTask = await apiRequest('/api/tasks/', {
        method: 'POST',
        body: JSON.stringify({
          title: newTask.trim(),
          priority,
          subject_id: subjectId ? Number(subjectId) : null,
        }),
      });

      setTasks((current) => [...current, createdTask]);
      setNewTask('');
      setPriority('Medium');
      setSubjectId('');
      setMessage('Task added successfully! 🌸');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not add the task.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    const nextCompleted = !task.completed;

    try {
      setError('');
      setMessage('');

      const updatedTask = await apiRequest(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: nextCompleted }),
      });

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? updatedTask : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update the task.'
      );
    }
  }

  async function deleteTask(taskId: number) {
    try {
      setError('');
      setMessage('');

      await apiRequest(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      setTasks((current) =>
        current.filter((task) => task.id !== taskId)
      );
      setMessage('Task deleted successfully.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not delete the task.'
      );
    }
  }

  function getSubjectName(id: number | null) {
    if (id === null) return 'Personal';

    return subjects.find((subject) => subject.id === id)?.name
      ?? 'Subject unavailable';
  }

  return (
    <main className="min-h-screen bg-[#fff9fc] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-pink-500">
            Your little study space 🌸
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            My Tasks 📝
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {completedCount} of {tasks.length} tasks completed ✨
          </p>

          {tasks.length > 0 && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-pink-100">
              <div
                className="h-full rounded-full bg-pink-500 transition-all"
                style={{
                  width: `${(completedCount / tasks.length) * 100}%`,
                }}
              />
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadData()}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {message && (
          <p
            role="status"
            className="mb-4 rounded-2xl bg-green-50 p-3 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        <div className="mb-6 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="What do you need to do? 💗"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void addTask();
              }}
              className="w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm text-slate-700 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as Priority)
                }
                className="rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-pink-300"
                aria-label="Task priority"
              >
                <option value="Low">Low priority</option>
                <option value="Medium">Medium priority</option>
                <option value="High">High priority</option>
              </select>

              <select
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className="flex-1 rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-pink-300"
                aria-label="Task subject"
              >
                <option value="">Personal / No subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon ? `${subject.icon} ` : ''}
                    {subject.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void addTask()}
                disabled={saving || !newTask.trim()}
                className="rounded-2xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Adding...' : '+ Add Task'}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-400">
              Loading your tasks... 🌷
            </div>
          ) : (
            <>
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 rounded-3xl border bg-white p-5 shadow-sm transition ${
                    task.completed
                      ? 'border-green-100 bg-green-50/30'
                      : 'border-pink-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => void toggleTask(task)}
                    className="h-5 w-5 accent-pink-500"
                    aria-label={`Mark ${task.title} ${
                      task.completed ? 'incomplete' : 'complete'
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className={`break-words font-medium ${
                        task.completed
                          ? 'text-slate-400 line-through'
                          : 'text-slate-700'
                      }`}
                    >
                      {task.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      🌸 {getSubjectName(task.subject_id)}
                    </p>
                  </div>

                  <span
                    className={`hidden rounded-full px-3 py-1 text-xs sm:block ${
                      task.priority === 'High'
                        ? 'bg-pink-50 text-pink-500'
                        : task.priority === 'Medium'
                        ? 'bg-purple-50 text-purple-500'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    type="button"
                    onClick={() => void deleteTask(task.id)}
                    className="rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-red-50 hover:text-red-400"
                    aria-label={`Delete ${task.title}`}
                  >
                    🗑️
                  </button>
                </div>
              ))}

              {filteredTasks.length === 0 && (
                <div className="rounded-3xl border border-dashed border-pink-200 bg-white p-10 text-center">
                  <div className="text-4xl">🌷</div>

                  <p className="mt-3 font-semibold text-slate-700">
                    {search ? 'No matching tasks' : 'No tasks yet'}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {search
                      ? 'Try another search.'
                      : 'Add your first task to get started.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}