'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

interface Subject {
  id: number;
  name: string;
  icon?: string | null;
  progress: number;
}

interface Session {
  id: number;
  subject_id: number | null;
  duration: number;
  completed: boolean;
  scheduled_for: string | null;
}

interface Task {
  id: number;
  subject_id: number | null;
  completed: boolean;
}

export default function ProgressPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [subjectsData, sessionsData, tasksData] = await Promise.all([
        apiRequest('/api/subjects/'),
        apiRequest('/api/sessions/'),
        apiRequest('/api/tasks/'),
      ]);

      setSubjects(subjectsData);
      setSessions(sessionsData);
      setTasks(tasksData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load your progress.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const overallProgress = subjects.length
    ? Math.round(
        subjects.reduce((sum, subject) => sum + subject.progress, 0) /
          subjects.length
      )
    : 0;

  // All saved session durations are stored in minutes.
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.duration,
    0
  );

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const completedSubjects = subjects.filter(
    (subject) => subject.progress >= 100
  ).length;

  const completedTasks = tasks.filter((task) => task.completed).length;

  function getSubjectHours(subjectId: number) {
    const minutes = sessions
      .filter((session) => session.subject_id === subjectId)
      .reduce((sum, session) => sum + session.duration, 0);

    return {
      hours: Math.floor(minutes / 60),
      minutes: minutes % 60,
    };
  }

  function getSubjectTaskStats(subjectId: number) {
    const subjectTasks = tasks.filter(
      (task) => task.subject_id === subjectId
    );

    return {
      total: subjectTasks.length,
      completed: subjectTasks.filter((task) => task.completed).length,
    };
  }

  return (
    <main className="min-h-screen bg-[#fff9fc] p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-purple-700">
            Look how far you&apos;ve come 🌷
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My Progress ✨
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-600">
            Every study session counts. Keep going, you&apos;re doing great! 💗
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
            <button
              type="button"
              onClick={() => void loadProgress()}
              className="ml-3 font-bold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-pink-200 bg-white p-10 text-center">
            <p className="font-semibold text-slate-800">
              Loading your progress... 🌸
            </p>
          </div>
        ) : (
          <>
            {/* Overall progress */}
            <div className="mb-6 rounded-3xl border border-pink-200 bg-white p-7 shadow-sm">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div
                  className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#db2777 ${overallProgress * 3.6}deg, #f3e8ff 0deg)`,
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-3xl font-bold text-pink-700">
                      {overallProgress}%
                    </span>

                    <span className="text-xs font-semibold text-slate-600">
                      overall
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xl font-bold text-slate-900">
                    Your study journey 🌸
                  </p>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Your overall progress is based on the saved progress of
                    your subjects. Keep updating your subjects as you learn.
                  </p>

                  <p className="mt-3 text-sm font-semibold text-purple-700">
                    {completedTasks} of {tasks.length} tasks completed
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-pink-200 bg-white p-5 shadow-sm">
                <p className="text-2xl">⏰</p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {totalHours}h {remainingMinutes}m
                </p>

                <p className="text-sm font-medium text-slate-600">
                  Planned session time
                </p>
              </div>

              <div className="rounded-3xl border border-purple-200 bg-white p-5 shadow-sm">
                <p className="text-2xl">📚</p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {subjects.length}
                </p>

                <p className="text-sm font-medium text-slate-600">
                  Total subjects
                </p>
              </div>

              <div className="rounded-3xl border border-rose-200 bg-white p-5 shadow-sm">
                <p className="text-2xl">🌟</p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {completedSubjects}
                </p>

                <p className="text-sm font-medium text-slate-600">
                  Subjects at 100%
                </p>
              </div>
            </div>

            {/* Subject progress */}
            <div className="rounded-3xl border border-pink-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Subject Progress 🌸
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  Progress and planned session time for each subject.
                </p>
              </div>

              {subjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-pink-300 p-8 text-center">
                  <p className="font-bold text-slate-800">
                    No subjects yet
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Add a subject to start tracking your progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-7">
                  {subjects.map((subject) => {
                    const subjectTime = getSubjectHours(subject.id);
                    const taskStats = getSubjectTaskStats(subject.id);
                    const progress = Math.max(
                      0,
                      Math.min(100, subject.progress)
                    );

                    return (
                      <div key={subject.id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {subject.icon || '📚'}
                            </span>

                            <span className="text-sm font-bold text-slate-800">
                              {subject.name}
                            </span>
                          </div>

                          <span className="text-sm font-bold text-pink-700">
                            {progress}%
                          </span>
                        </div>

                        <div
                          className="h-3 overflow-hidden rounded-full bg-pink-100"
                          role="progressbar"
                          aria-label={`${subject.name} progress`}
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-700"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="mt-2 flex flex-wrap justify-between gap-2">
                          <p className="text-xs font-medium text-slate-600">
                            Planned: {subjectTime.hours}h{' '}
                            {subjectTime.minutes}m
                          </p>

                          <p className="text-xs font-medium text-slate-600">
                            Tasks: {taskStats.completed}/{taskStats.total}{' '}
                            completed
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Motivation */}
            <div className="mt-6 rounded-3xl border border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 p-6 text-center">
              <p className="text-lg font-bold text-slate-800">
                You&apos;re building your future, one step at a time 💗
              </p>

              <p className="mt-2 text-sm font-medium text-slate-600">
                Keep showing up. Your future self will thank you. ✨
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
