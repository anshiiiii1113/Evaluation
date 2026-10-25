import React, { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress, progressErrorMessage } from '../context/ProgressContext';
import { formatRuntime } from '../services/tmdb';

/**
 * User-maintained movie tracking. StreamScout has no video player, so this
 * is NOT playback: the percentage is whatever the user sets.
 */
const MovieProgressPanel = ({ movie }) => {
  const { user } = useAuth();
  const { getMovieProgress, setMovieProgress, completeMovie, clearMovieProgress } = useProgress();

  const saved = getMovieProgress(movie.id);
  const savedPercent = saved ? Number(saved.progress_percent) : 0;
  const isCompleted = !!saved?.watched;

  const [percent, setPercent] = useState(savedPercent);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Keep the slider in sync with what is stored (initial load, other tabs'
  // refreshes, account switch).
  useEffect(() => {
    setPercent(savedPercent);
  }, [savedPercent, movie.id, user?.id]);

  useEffect(() => {
    setError(null);
    setNotice(null);
  }, [movie.id, user?.id]);

  if (!user) {
    return (
      <div className="mt-6 rounded-xl border border-dark-line bg-dark-800/60 p-4 text-left text-xs text-textMuted max-w-xl">
        Log in to track your progress on this movie and see it under Continue Watching.
      </div>
    );
  }

  const run = async (fn, successMessage) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
      setNotice(successMessage);
    } catch (err) {
      console.error('Movie progress error:', err?.message || err);
      setError(progressErrorMessage(err, 'Could not save your progress. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const runtimeMinutes = movie.runtime || null;
  const approxMinutes = runtimeMinutes ? Math.round((percent / 100) * runtimeMinutes) : null;
  const dirty = Math.round(percent) !== Math.round(savedPercent);

  return (
    <div className="mt-6 rounded-xl border border-dark-line bg-dark-800/60 p-4 sm:p-5 text-left max-w-xl">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted">My Progress</h3>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">
            <Check className="h-3 w-3" /> Completed
          </span>
        )}
      </div>
      <p className="text-[11px] text-textMuted mb-4">
        Manual tracking you control — StreamScout doesn&apos;t stream video, so this isn&apos;t a playback position.
      </p>

      <label htmlFor="movie-progress-range" className="sr-only">
        Movie progress percent
      </label>
      <input
        id="movie-progress-range"
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(percent)}
        onChange={(e) => setPercent(Number(e.target.value))}
        disabled={busy || isCompleted}
        className="w-full accent-[#e5a23c] disabled:opacity-50"
      />
      <div className="mt-1 flex items-center justify-between text-xs text-gray-300">
        <span className="font-semibold">{Math.round(percent)}%</span>
        {approxMinutes != null && (
          <span className="text-textMuted">
            ≈ {formatRuntime(approxMinutes) === 'N/A' ? '0m' : formatRuntime(approxMinutes)} of {formatRuntime(runtimeMinutes)}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!isCompleted && (
          <button
            type="button"
            disabled={busy || percent <= 0 || percent >= 100 || (!dirty && !!saved)}
            onClick={() =>
              run(() => setMovieProgress(movie, percent), saved ? 'Progress updated.' : 'Tracking started.')
            }
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-black transition hover:bg-gold-amber disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saved ? 'Save progress' : 'Start tracking'}
          </button>
        )}

        {!isCompleted && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => completeMovie(movie), 'Marked as completed.')}
            className="inline-flex items-center gap-2 rounded-lg border border-gold/60 px-4 py-2 text-xs font-bold text-gold transition hover:bg-gold hover:text-black disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Mark completed
          </button>
        )}

        {saved && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(() => clearMovieProgress(movie.id), isCompleted ? 'Moved back to unwatched.' : 'Progress cleared.')
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dark-line px-4 py-2 text-xs font-bold text-gray-300 transition hover:border-gold hover:text-gold disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {isCompleted ? 'Mark as unwatched' : 'Clear progress'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {notice && !error && <p className="mt-3 text-[11px] text-gold">{notice}</p>}
    </div>
  );
};

export default MovieProgressPanel;
