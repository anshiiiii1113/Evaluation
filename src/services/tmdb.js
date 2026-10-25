const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Fallback API Key (Tested and verified active TMDB Key)
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '4e44d9029b1270a757cddc766a1bcb63';

export const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy'
};

import {
  MOCK_TRENDING,
  MOCK_NEW_RELEASES,
  MOCK_ACTION,
  MOCK_COMEDY,
  MOCK_HORROR,
  MOCK_SCIFI,
  MOCK_SERIES,
  getMockMovieDetails,
  getMockTVDetails,
  getMockSeasonDetails,
  searchMockData
} from './mockData';

let offlineFallbackActive = false;
export const isUsingOfflineFallback = () => offlineFallbackActive;
export const setOfflineFallback = (active) => { offlineFallbackActive = active; };

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'original') => {
  if (!path) return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getProfileUrl = (path, size = 'w185') => {
  if (!path) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=185&auto=format&fit=crop&q=80';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Small in-memory cache so a transient TMDB failure can still be recovered
// from previously-successful data (e.g. re-mount, or a retry after a
// dropped network request) without needing a backend or extra deps.
const responseCache = new Map();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — keeps rails feeling "live" during a demo
const REQUEST_TIMEOUT_MS = 4000; // 4s timeout prevents long freezes on blocked networks
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 300;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Fetches a TMDB endpoint with timeout and quick retry.
 * If TMDB is blocked or unavailable, caller functions fall back to
 * offline mock data so the application never renders blank silhouette screens.
 */
const fetchFromTMDB = async (endpoint, params = {}) => {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;
  const cacheKey = url;

  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        throw new Error(`TMDB HTTP error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      responseCache.set(cacheKey, { data, timestamp: Date.now() });
      offlineFallbackActive = false;
      return data;
    } catch (err) {
      lastError = err;
      // Fast-fail if domain is blocked by DNS / firewall (TypeError: Failed to fetch)
      if (err.name === 'TypeError' || String(err.message).toLowerCase().includes('failed to fetch')) {
        break;
      }
      const isLastAttempt = attempt === MAX_RETRIES;
      if (!isLastAttempt) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
    }
  }

  // All retries exhausted — fall back to a cached response if we have one
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.warn(`TMDB request failed, serving cached data for: ${endpoint}`, lastError);
    return cached.data;
  }

  console.warn(`TMDB request failed for endpoint: ${endpoint}, switching to offline fallback.`, lastError?.message || lastError);
  offlineFallbackActive = true;
  throw lastError;
};

export const fetchTrending = async () => {
  try {
    const data = await fetchFromTMDB('/trending/all/week');
    if (data?.results?.length) return data.results;
  } catch (err) {
    console.warn('TMDB fetchTrending failed, using offline mock data.', err?.message);
    offlineFallbackActive = true;
  }
  return MOCK_TRENDING;
};

export const fetchNewReleases = async () => {
  try {
    const data = await fetchFromTMDB('/movie/now_playing', { page: 1 });
    if (data?.results?.length) return data.results;
  } catch (err) {
    offlineFallbackActive = true;
  }
  return MOCK_NEW_RELEASES;
};

export const fetchActionMovies = async () => {
  try {
    const data = await fetchFromTMDB('/discover/movie', {
      with_genres: 28,
      sort_by: 'popularity.desc',
      page: 1
    });
    if (data?.results?.length) return data.results;
  } catch (err) {
    offlineFallbackActive = true;
  }
  return MOCK_ACTION;
};

export const fetchComedyMovies = async () => {
  try {
    const data = await fetchFromTMDB('/discover/movie', {
      with_genres: 35,
      sort_by: 'popularity.desc',
      page: 1
    });
    if (data?.results?.length) return data.results;
  } catch (err) {
    offlineFallbackActive = true;
  }
  return MOCK_COMEDY;
};

export const fetchHorrorMovies = async () => {
  try {
    const data = await fetchFromTMDB('/discover/movie', {
      with_genres: 27,
      sort_by: 'popularity.desc',
      page: 1
    });
    if (data?.results?.length) return data.results;
  } catch (err) {
    offlineFallbackActive = true;
  }
  return MOCK_HORROR;
};

export const fetchSciFiMovies = async () => {
  try {
    const data = await fetchFromTMDB('/discover/movie', {
      with_genres: 878,
      sort_by: 'popularity.desc',
      page: 1
    });
    if (data?.results?.length) return data.results;
  } catch (err) {
    offlineFallbackActive = true;
  }
  return MOCK_SCIFI;
};

export const fetchPopularWebSeries = async () => {
  try {
    const data = await fetchFromTMDB('/trending/tv/week', { page: 1 });
    if (data?.results?.length) return data.results;
  } catch (err) {
    offlineFallbackActive = true;
  }
  return MOCK_SERIES;
};

export const fetchMovieDetails = async (id) => {
  try {
    const data = await fetchFromTMDB(`/movie/${id}`, {
      append_to_response: 'videos,credits,similar,recommendations'
    });

    if (data?.id && String(data.id) === String(id) && data.title) {
      return {
        ...data,
        media_type: 'movie',
        similar: data.similar
          ? { ...data.similar, results: (data.similar.results || []).map((item) => ({ ...item, media_type: 'movie' })) }
          : data.similar,
        recommendations: data.recommendations
          ? { ...data.recommendations, results: (data.recommendations.results || []).map((item) => ({ ...item, media_type: 'movie' })) }
          : data.recommendations
      };
    }
  } catch (err) {
    console.warn(`TMDB fetchMovieDetails(${id}) failed, serving mock details.`, err?.message);
    offlineFallbackActive = true;
  }
  return getMockMovieDetails(id);
};

export const searchMulti = async (query) => {
  if (!query || !query.trim()) return [];
  try {
    const data = await fetchFromTMDB('/search/multi', {
      query: query.trim(),
      include_adult: false,
      page: 1
    });
    const items = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
    if (items.length > 0) return items;
  } catch (err) {
    offlineFallbackActive = true;
  }
  return searchMockData(query);
};

export const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

export const getReleaseYear = (item) => {
  if (!item) return '';
  const date = item.release_date || item.first_air_date;
  if (!date) return 'N/A';
  return date.split('-')[0];
};

export const getTitle = (item) => {
  if (!item) return '';
  return item.title || item.name || item.original_title || item.original_name || 'Untitled';
};

// Resolve media type from TMDB's explicit field first. For endpoints such as
// /movie/:id/similar and /tv/:id/recommendations, TMDB may omit media_type,
// so use the endpoint's known type or its title/date shape as a safe fallback.
// Genre is deliberately NOT used: genres do not distinguish movies from TV.
export const getMediaType = (item, fallbackMediaType = null) => {
  if (!item) return fallbackMediaType;
  if (item.media_type === 'movie' || item.media_type === 'tv') return item.media_type;
  if (item.first_air_date || (item.name && !item.title)) return 'tv';
  if (item.release_date || (item.title && !item.name)) return 'movie';
  if (fallbackMediaType === 'movie' || fallbackMediaType === 'tv') return fallbackMediaType;
  return null;
};

export const getDetailsPath = (item, fallbackMediaType = null) => {
  if (!item || item.id == null) return '/';
  const mediaType = getMediaType(item, fallbackMediaType);
  if (mediaType === 'tv') return `/tv/${item.id}`;
  if (mediaType === 'movie') return `/movie/${item.id}`;
  return '/';
};

/* ------------------------------------------------------------------ */
/* Additions: TV details, season/episode data, trailer helper, similar */
/* ------------------------------------------------------------------ */

// Fetch full TV show details (append videos, credits, similar, recommendations)
export const fetchTVDetails = async (id) => {
  try {
    const data = await fetchFromTMDB(`/tv/${id}`, {
      append_to_response: 'videos,credits,similar,recommendations'
    });

    if (data?.id && String(data.id) === String(id) && data.name) {
      return {
        ...data,
        media_type: 'tv',
        similar: data.similar
          ? { ...data.similar, results: (data.similar.results || []).map((item) => ({ ...item, media_type: 'tv' })) }
          : data.similar,
        recommendations: data.recommendations
          ? { ...data.recommendations, results: (data.recommendations.results || []).map((item) => ({ ...item, media_type: 'tv' })) }
          : data.recommendations
      };
    }
  } catch (err) {
    console.warn(`TMDB fetchTVDetails(${id}) failed, serving mock show.`, err?.message);
    offlineFallbackActive = true;
  }
  return getMockTVDetails(id);
};

// Normalize the response for one specific TMDB season. Exporting this pure
// helper keeps the season-isolation rule easy to exercise with fixture data.
export const normalizeSeasonResponse = (data, seasonNumber) => {
  const seasonNum = Number(seasonNumber);
  if (!Number.isInteger(seasonNum) || seasonNum < 0) {
    throw new Error('A valid season number is required.');
  }
  if (!data || !Array.isArray(data.episodes)) {
    throw new Error('TMDB did not return episode data for this season.');
  }
  // The season endpoint must echo the requested season. Treat a mismatch as
  // an API/data error rather than risking displaying another season's list.
  if (data.season_number == null || Number(data.season_number) !== seasonNum) {
    throw new Error(`TMDB returned season ${data.season_number ?? 'unknown'} instead of season ${seasonNum}.`);
  }

  // Only records explicitly tagged as belonging to the requested season are
  // accepted. Missing season metadata is not allowed to leak into the list.
  const episodes = data.episodes
    .filter((ep) => ep && Number(ep.season_number) === seasonNum)
    .map((ep) => ({ ...ep, season_number: seasonNum }))
    .sort((a, b) => Number(a.episode_number) - Number(b.episode_number));

  return { ...data, season_number: seasonNum, episodes };
};

// Fetch a specific season's episode list for a TV show
export const fetchSeasonDetails = async (tvId, seasonNumber) => {
  const seriesId = String(tvId ?? '').trim();
  const seasonNum = Number(seasonNumber);
  if (!/^\d+$/.test(seriesId) || !Number.isInteger(seasonNum) || seasonNum < 0) {
    throw new Error('A valid TV series ID and season number are required.');
  }

  try {
    const data = await fetchFromTMDB(`/tv/${seriesId}/season/${seasonNum}`);
    return normalizeSeasonResponse(data, seasonNum);
  } catch (err) {
    console.warn(`TMDB fetchSeasonDetails(${tvId}, ${seasonNumber}) failed, serving mock season.`, err?.message);
    offlineFallbackActive = true;
    return getMockSeasonDetails(tvId, seasonNum);
  }
};

const hasAired = (episode) => {
  if (!episode?.air_date) return false;
  const t = new Date(`${episode.air_date}T00:00:00`).getTime();
  return !Number.isNaN(t) && t <= Date.now();
};

/**
 * Walks the show's real TMDB seasons (excluding season 0 / Specials) in
 * ascending season order, fetching each season's actual episode list, and
 * returns the first aired episode that is not in `watchedKeys`
 * (a Set of "season:episode"). Episode numbers are taken from TMDB records,
 * never guessed, so gaps in numbering are handled naturally.
 *
 * Returns { next, watchedCount, totalCount, complete } where totals count
 * aired regular-season episodes only.
 */
export const findNextUnwatchedEpisode = async (show, watchedKeys) => {
  const seasons = (show?.seasons || [])
    .filter((s) => s.season_number > 0 && s.episode_count > 0)
    .sort((a, b) => a.season_number - b.season_number);

  let next = null;
  let watchedCount = 0;
  let totalCount = 0;

  for (const season of seasons) {
    let data;
    try {
      data = await fetchSeasonDetails(show.id, season.season_number);
    } catch (err) {
      console.error(`Could not load season ${season.season_number} of series ${show.id}`, err?.message || err);
      throw err;
    }
    const episodes = [...data.episodes].sort((a, b) => a.episode_number - b.episode_number);
    for (const ep of episodes) {
      if (!hasAired(ep)) continue;
      totalCount += 1;
      if (watchedKeys.has(`${season.season_number}:${ep.episode_number}`)) {
        watchedCount += 1;
      } else if (!next) {
        next = { ...ep, season_number: season.season_number, season_name: season.name };
      }
    }
  }

  return { next, watchedCount, totalCount, complete: !next && totalCount > 0 };
};

// Fetch similar movies for a given movie id
export const fetchSimilarMovies = async (id) => {
  try {
    const data = await fetchFromTMDB(`/movie/${id}/similar`);
    if (data?.results?.length) return (data.results || []).map((item) => ({ ...item, media_type: 'movie' }));
  } catch (err) {
    offlineFallbackActive = true;
  }
  return MOCK_ACTION.slice(0, 6);
};

// Fetch similar TV shows for a given tv id
export const fetchSimilarTV = async (id) => {
  try {
    const data = await fetchFromTMDB(`/tv/${id}/similar`);
    if (data?.results?.length) return (data.results || []).map((item) => ({ ...item, media_type: 'tv' }));
  } catch (err) {
    offlineFallbackActive = true;
  }
  return MOCK_SERIES.slice(0, 4);
};

// TMDB video keys are normally 11-character YouTube IDs, but accepting a
// watch/embed URL too makes this helper resilient to mock data and API changes.
export const getYouTubeVideoId = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const input = value.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input.startsWith('http') ? input : `https://${input}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const id = url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/)?.[1];
      return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
    }
  } catch {
    return null;
  }
  return null;
};

// Extract a real YouTube video ID and prefer official trailers. Some TMDB
// records have a YouTube entry without a usable key; skip those so they do
// not block a valid trailer/teaser later in the list.
export const getOfficialTrailer = (videosResponse) => {
  const videos = (videosResponse?.results || [])
    .filter((video) => video?.site?.toLowerCase() === 'youtube')
    .map((video) => ({ ...video, key: getYouTubeVideoId(video.key) }))
    .filter((video) => video.key);

  return (
    videos.find((v) => v.type === 'Trailer' && v.official) ||
    videos.find((v) => v.type === 'Trailer') ||
    videos.find((v) => v.type === 'Teaser') ||
    videos[0] ||
    null
  );
};

// Format an air date string, e.g. "2024-03-01" -> "Mar 1, 2024"
export const formatAirDate = (dateStr) => {
  if (!dateStr) return 'TBA';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ------------------------------------------------------------------ */
/* Catalog normalization                                              */
/*                                                                     */
/* Keep real TMDB records distinct. Movies and TV shows use separate  */
/* ID namespaces, and titles that contain words like "Season 2" or     */
/* "Specials" must not be renamed or merged based on title guessing.   */
/* ------------------------------------------------------------------ */

/**
 * Normalize result records for display without inventing or rewriting
 * titles. De-duplicate only identical records of the same media type.
 *
 * fallbackMediaType should only be passed for endpoints that are known
 * to return a single media type, such as /discover/movie or /trending/tv.
 */
export const normalizeCatalog = (items = [], fallbackMediaType = null) => {
  if (!Array.isArray(items)) return [];

  const seen = new Set();
  const normalized = [];

  for (const item of items) {
    if (!item || item.id == null) continue;

    const mediaType = item.media_type || fallbackMediaType;
    if (mediaType !== 'movie' && mediaType !== 'tv') continue;

    const key = `${mediaType}:${item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    normalized.push({ ...item, media_type: mediaType });
  }

  return normalized;
};
