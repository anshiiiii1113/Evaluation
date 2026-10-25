import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';
import {
  fetchAllProgress,
  saveMovieProgress,
  removeMovieProgress,
  markEpisodeWatched,
  markEpisodeUnwatched,
} from '../services/progress';

const ProgressContext = createContext();

export const episodeKey = (season, episode) => `${season}:${episode}`;

const friendlyError = (err, fallback) => {
  const msg = err?.message || '';
  if (/storage is unavailable|storage.*full|could not save progress/i.test(msg)) {
    return 'Browser storage is unavailable or full. Check your browser settings and try again.';
  }
  if (/corrupted/i.test(msg)) return 'Your saved progress could not be read. You may need to clear the StreamScout progress data for this browser.';
  return fallback;
};

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [rows, setRows] = useState([]);
  // Filter synchronously during render as well as clearing in the effect.
  // This prevents a previous account's rows flashing for one render during
  // an account switch, before the cleanup effect runs.
  const visibleRows = useMemo(
    () => (userId ? rows.filter((row) => row.user_id === userId) : []),
    [rows, userId]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tracks which user the current `rows` belong to, so a slow response for a
  // previous account can never be applied after an account switch.
  const activeUserRef = useRef(userId);

  const load = useCallback(async (forUserId) => {
    if (!forUserId) {
      setRows([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllProgress(forUserId);
      if (activeUserRef.current !== forUserId) return;
      setRows(data);
    } catch (err) {
      if (activeUserRef.current !== forUserId) return;
      console.error('Failed to load progress:', err?.message || err);
      setError(friendlyError(err, 'Could not load your progress. Please try again.'));
    } finally {
      if (activeUserRef.current === forUserId) setLoading(false);
    }
  }, []);

  // On login / logout / account switch: drop the previous user's rows
  // immediately, then load the new user's.
  useEffect(() => {
    activeUserRef.current = userId;
    setRows([]);
    setError(null);
    load(userId);
  }, [userId, load]);

  const refresh = useCallback(() => load(activeUserRef.current), [load]);

  const upsertLocal = useCallback((row) => {
    setRows((prev) => {
      const without = prev.filter(
        (r) =>
          !(
            r.media_type === row.media_type &&
            Number(r.tmdb_id) === Number(row.tmdb_id) &&
            (r.season_number ?? null) === (row.season_number ?? null) &&
            (r.episode_number ?? null) === (row.episode_number ?? null)
          )
      );
      return [row, ...without];
    });
  }, []);

  const requireUser = () => {
    if (!activeUserRef.current) throw new Error('Please log in to track progress.');
    return activeUserRef.current;
  };

  /* ------------------------------ movies ------------------------------ */

  const setMovieProgress = useCallback(
    async (movie, percent) => {
      const uid = requireUser();
      const row = await saveMovieProgress(uid, movie, { percent, completed: false });
      if (activeUserRef.current === uid) upsertLocal(row);
      return row;
    },
    [upsertLocal]
  );

  const completeMovie = useCallback(
    async (movie) => {
      const uid = requireUser();
      const row = await saveMovieProgress(uid, movie, { percent: 100, completed: true });
      if (activeUserRef.current === uid) upsertLocal(row);
      return row;
    },
    [upsertLocal]
  );

  const clearMovieProgress = useCallback(async (tmdbId) => {
    const uid = requireUser();
    await removeMovieProgress(uid, tmdbId);
    if (activeUserRef.current !== uid) return;
    setRows((prev) =>
      prev.filter((r) => !(r.media_type === 'movie' && Number(r.tmdb_id) === Number(tmdbId)))
    );
  }, []);

  /* ------------------------------- TV -------------------------------- */

  const setEpisodeWatched = useCallback(
    async (show, seasonNumber, episodeNumber, watched) => {
      const uid = requireUser();
      if (watched) {
        const row = await markEpisodeWatched(uid, show, seasonNumber, episodeNumber);
        if (activeUserRef.current === uid) upsertLocal(row);
      } else {
        await markEpisodeUnwatched(uid, show.id, seasonNumber, episodeNumber);
        if (activeUserRef.current !== uid) return;
        setRows((prev) =>
          prev.filter(
            (r) =>
              !(
                r.media_type === 'tv' &&
                Number(r.tmdb_id) === Number(show.id) &&
                r.season_number === Number(seasonNumber) &&
                r.episode_number === Number(episodeNumber)
              )
          )
        );
      }
    },
    [upsertLocal]
  );

  /* ----------------------------- selectors ---------------------------- */

  const getMovieProgress = useCallback(
    (tmdbId) =>
      visibleRows.find((r) => r.media_type === 'movie' && Number(r.tmdb_id) === Number(tmdbId)) || null,
    [visibleRows]
  );

  const getWatchedEpisodes = useCallback(
    (tmdbId) => {
      const set = new Set();
      visibleRows.forEach((r) => {
        if (r.media_type === 'tv' && r.watched && Number(r.tmdb_id) === Number(tmdbId)) {
          set.add(episodeKey(r.season_number, r.episode_number));
        }
      });
      return set;
    },
    [visibleRows]
  );

  const value = useMemo(
    () => ({
      rows: visibleRows,
      loading,
      error,
      refresh,
      setMovieProgress,
      completeMovie,
      clearMovieProgress,
      setEpisodeWatched,
      getMovieProgress,
      getWatchedEpisodes,
    }),
    [
      visibleRows,
      loading,
      error,
      refresh,
      setMovieProgress,
      completeMovie,
      clearMovieProgress,
      setEpisodeWatched,
      getMovieProgress,
      getWatchedEpisodes,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
};

export { friendlyError as progressErrorMessage };
