/**
 * Browser-local progress storage. Each demo account has its own key so movie
 * progress and watched episodes remain separated when users switch accounts.
 * This is local demo persistence, not secure or cross-device cloud storage.
 */
const storageKeyFor = (userId) => `streamscout_progress_${encodeURIComponent(String(userId || ''))}`;

const clampPercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n * 100) / 100));
};

const createRowId = () => (
  globalThis.crypto?.randomUUID?.() || `progress-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const assertUser = (userId) => {
  if (!userId) throw new Error('Please log in to track progress.');
};

const readRows = (userId) => {
  assertUser(userId);
  let raw;
  try {
    raw = window.localStorage.getItem(storageKeyFor(userId));
  } catch {
    throw new Error('Browser storage is unavailable. Enable local storage and try again.');
  }

  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((row) => row && row.user_id === userId)
      : [];
  } catch {
    throw new Error('Saved progress could not be read because the local data is corrupted.');
  }
};

const writeRows = (userId, rows) => {
  assertUser(userId);
  try {
    window.localStorage.setItem(storageKeyFor(userId), JSON.stringify(rows));
  } catch {
    throw new Error('Could not save progress. Browser storage may be disabled or full.');
  }
};

const upsertRow = (userId, row, matches) => {
  const rows = readRows(userId);
  const current = rows.find(matches);
  const nextRow = {
    ...current,
    ...row,
    id: current?.id || row.id || createRowId(),
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  const nextRows = [nextRow, ...rows.filter((candidate) => !matches(candidate))];
  writeRows(userId, nextRows);
  return nextRow;
};

export const fetchAllProgress = async (userId) => {
  const rows = readRows(userId);
  return rows.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
};

export const saveMovieProgress = async (
  userId,
  movie,
  { percent, completed = false, positionSeconds = null, durationSeconds = null }
) => {
  assertUser(userId);
  const tmdbId = Number(movie?.id);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw new Error('Invalid movie.');

  return upsertRow(
    userId,
    {
      tmdb_id: tmdbId,
      media_type: 'movie',
      season_number: null,
      episode_number: null,
      progress_percent: completed ? 100 : clampPercent(percent),
      watched: Boolean(completed),
      position_seconds: positionSeconds,
      duration_seconds: durationSeconds || (movie.runtime ? movie.runtime * 60 : null),
      title: movie.title || movie.name || null,
      poster_path: movie.poster_path || null,
    },
    (row) => row.media_type === 'movie' && Number(row.tmdb_id) === tmdbId
  );
};

export const removeMovieProgress = async (userId, tmdbId) => {
  assertUser(userId);
  const targetId = Number(tmdbId);
  const rows = readRows(userId).filter(
    (row) => !(row.media_type === 'movie' && Number(row.tmdb_id) === targetId)
  );
  writeRows(userId, rows);
};

export const markEpisodeWatched = async (userId, show, seasonNumber, episodeNumber) => {
  assertUser(userId);
  const tmdbId = Number(show?.id);
  const season = Number(seasonNumber);
  const episode = Number(episodeNumber);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw new Error('Invalid series.');
  if (!Number.isInteger(season) || season < 0 || !Number.isInteger(episode) || episode < 0) {
    throw new Error('Invalid episode.');
  }

  return upsertRow(
    userId,
    {
      tmdb_id: tmdbId,
      media_type: 'tv',
      season_number: season,
      episode_number: episode,
      progress_percent: 100,
      watched: true,
      position_seconds: null,
      duration_seconds: null,
      title: show.name || show.title || null,
      poster_path: show.poster_path || null,
    },
    (row) => row.media_type === 'tv'
      && Number(row.tmdb_id) === tmdbId
      && Number(row.season_number) === season
      && Number(row.episode_number) === episode
  );
};

export const markEpisodeUnwatched = async (userId, tmdbId, seasonNumber, episodeNumber) => {
  assertUser(userId);
  const targetId = Number(tmdbId);
  const season = Number(seasonNumber);
  const episode = Number(episodeNumber);
  const rows = readRows(userId).filter(
    (row) => !(row.media_type === 'tv'
      && Number(row.tmdb_id) === targetId
      && Number(row.season_number) === season
      && Number(row.episode_number) === episode)
  );
  writeRows(userId, rows);
};
