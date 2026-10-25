import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star,
  Calendar,
  ArrowLeft,
  Play,
  Bookmark,
  Sparkles,
  Users,
  Film,
  Tv,
  Clock,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  fetchTVDetails,
  fetchSeasonDetails,
  getBackdropUrl,
  getImageUrl,
  getProfileUrl,
  getReleaseYear,
  getTitle,
  formatAirDate,
  getOfficialTrailer
} from '../services/tmdb';
import MovieRow from './MovieRow';
import TrailerPlayer from './TrailerPlayer';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { useProgress, episodeKey, progressErrorMessage } from '../context/ProgressContext';

const seasonLabel = (s) => {
  if (!s) return 'Season';
  if (s.season_number === 0) return s.name || 'Specials';
  // Use TMDB's own season name when it is meaningful, otherwise "Season N".
  return s.name && s.name.trim() ? s.name : `Season ${s.season_number}`;
};

const TVDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const { inWatchlist, toggleWatchlist } = useWatchlist();
  const { user } = useAuth();
  const { setEpisodeWatched, getWatchedEpisodes, error: progressLoadError } = useProgress();
  const [pendingEpisodeKey, setPendingEpisodeKey] = useState(null);
  const [progressError, setProgressError] = useState(null);

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonData, setSeasonData] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [seasonError, setSeasonError] = useState(null);
  const [seasonRetry, setSeasonRetry] = useState(0);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  const [activeEpisode, setActiveEpisode] = useState(null);

  // Load top-level show details
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let isMounted = true;
    setLoading(true);
    setError(null);
    setShow(null);
    setSeasonData(null);
    setSeasonError(null);
    setSelectedSeason(null);
    setActiveEpisode(null);

    fetchTVDetails(id)
      .then((data) => {
        if (!isMounted) return;
        setShow(data);
        // Default to the first real season TMDB lists (never assume it is 1);
        // fall back to whatever TMDB lists first (e.g. only Specials).
        const listed = [...new Map((data.seasons || [])
          .filter((season) => Number.isInteger(Number(season.season_number)) && Number(season.season_number) >= 0)
          .map((season) => [Number(season.season_number), { ...season, season_number: Number(season.season_number) }]))
          .values()]
          .sort((a, b) => a.season_number - b.season_number);
        const requested = new URLSearchParams(queryString).get('season');
        const requestedSeason =
          requested !== null && /^\d+$/.test(requested)
            ? listed.find((x) => x.season_number === Number(requested))
            : null;
        const first = requestedSeason ?? listed.find((x) => x.season_number > 0) ?? listed[0] ?? null;
        setSelectedSeason(first ? first.season_number : null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching TV details:', err);
        if (isMounted) {
          setError('Failed to load series details. Please try again later.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, queryString]);

  // Support Watch Trailer links from the home hero by scrolling after the
  // series details and trailer section have rendered.
  useEffect(() => {
    if (loading || !show || window.location.hash !== '#trailer-section') return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('trailer-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, show]);

  // Load season/episode data whenever selectedSeason changes
  // Always uses the series ID TMDB returned for this show plus the selected
  // season number; the previous season's episodes are cleared first so two
  // seasons can never be displayed together.
  const showId = show?.id;
  useEffect(() => {
    if (showId == null || selectedSeason == null) return;
    let isMounted = true;
    setSeasonLoading(true);
    setSeasonError(null);
    setSeasonData(null);
    setActiveEpisode(null);

    fetchSeasonDetails(showId, selectedSeason)
      .then((data) => {
        if (isMounted) {
          setSeasonData(data);
          setSeasonLoading(false);
          const routeParams = new URLSearchParams(queryString);
          const wantedEp = routeParams.get('episode');
          const wantedSeason = routeParams.get('season');
          if (wantedEp !== null && wantedSeason !== null && Number(wantedSeason) === Number(selectedSeason)) {
            const idx = data.episodes.findIndex((e) => e.episode_number === Number(wantedEp));
            if (idx >= 0) setActiveEpisode({ episode: data.episodes[idx], index: idx });
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching season details:', err?.message || err);
        if (isMounted) {
          setSeasonData(null);
          setSeasonError('Could not load episodes for this season.');
          setSeasonLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [showId, selectedSeason, seasonRetry, queryString]);

  const handleSelectSeason = (num) => {
    // Clear the previous season immediately. The list is also guarded by its
    // season_number below, so old episodes can never flash under a new label.
    setSeasonData(null);
    setActiveEpisode(null);
    setSeasonLoading(true);
    setSeasonError(null);
    setSelectedSeason(num);
    setSeasonDropdownOpen(false);
  };

  const openEpisode = (episode, index) => {
    setActiveEpisode({ episode, index });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeEpisode = () => setActiveEpisode(null);

  const toggleEpisodeWatched = async (episode, currentlyWatched) => {
    if (!show || selectedSeason == null) return;
    const key = episodeKey(selectedSeason, episode.episode_number);
    setPendingEpisodeKey(key);
    setProgressError(null);
    try {
      await setEpisodeWatched(show, selectedSeason, episode.episode_number, !currentlyWatched);
    } catch (err) {
      console.error('Failed to update episode progress:', err?.message || err);
      setProgressError(progressErrorMessage(err, 'Could not save your progress. Please try again.'));
    } finally {
      setPendingEpisodeKey(null);
    }
  };

  const goToEpisodeOffset = useCallback(
    (offset) => {
      if (!activeEpisode || !seasonData?.episodes) return;
      const newIndex = activeEpisode.index + offset;
      const ep = seasonData.episodes[newIndex];
      if (ep) setActiveEpisode({ episode: ep, index: newIndex });
    },
    [activeEpisode, seasonData]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 py-20 px-6 sm:px-12">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-72 w-full rounded-2xl bg-dark-700 mb-8" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="h-96 w-64 rounded-xl bg-dark-700 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-10 w-3/4 rounded bg-dark-700" />
              <div className="h-5 w-1/2 rounded bg-dark-700" />
              <div className="h-24 w-full rounded bg-dark-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="rounded-2xl border border-dark-line bg-dark-800 p-8 max-w-md">
          <Tv className="h-12 w-12 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Series Not Found</h2>
          <p className="text-sm text-textMuted mb-6">{error || 'Could not retrieve details for this title.'}</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-black hover:bg-gold-amber transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const title = getTitle(show);
  const year = getReleaseYear(show);
  const rating = show.vote_average ? show.vote_average.toFixed(1) : 'NR';
  const backdropUrl = getBackdropUrl(show.backdrop_path);
  const posterUrl = getImageUrl(show.poster_path, 'w500');
  const isSaved = inWatchlist(show.id);

  const cast = (show.credits?.cast || []).slice(0, 10);
  const similarShows = (show.similar?.results || show.recommendations?.results || []).slice(0, 14);
  const officialTrailer = getOfficialTrailer(show.videos);

  // Real TMDB season records, in season order. Season 0 (Specials) is kept.
  const seasons = [...new Map((show.seasons || [])
    .filter((season) => Number.isInteger(Number(season.season_number)) && Number(season.season_number) >= 0)
    .map((season) => [Number(season.season_number), { ...season, season_number: Number(season.season_number) }]))
    .values()]
    .sort((a, b) => a.season_number - b.season_number);
  const currentSeasonMeta = seasons.find((s) => s.season_number === selectedSeason) || null;
  const numSeasons = show.number_of_seasons ?? seasons.filter((s) => s.season_number > 0).length;
  const totalEpisodes = show.number_of_episodes ?? '—';

  const episodes = seasonData && selectedSeason !== null && Number(seasonData.season_number) === Number(selectedSeason)
    ? (seasonData.episodes || [])
    : [];
  const watchedKeys = getWatchedEpisodes(show.id);
  const watchedInSeason = episodes.filter((ep) => watchedKeys.has(episodeKey(selectedSeason, ep.episode_number))).length;
  const activeWatched =
    activeEpisode && watchedKeys.has(episodeKey(selectedSeason, activeEpisode.episode.episode_number));

  return (
    <div className="min-h-screen bg-[#080808] text-[#e7e9ee]">
      {/* Back Button */}
      <div className="relative z-30 mx-auto max-w-7xl px-4 sm:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-dark-line bg-black/60 px-4 py-2 text-xs font-semibold text-gray-300 backdrop-blur-md transition hover:border-gold hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* Hero Backdrop Section */}
      <div className="relative -mt-14 h-[45vh] min-h-[320px] max-h-[520px] w-full overflow-hidden">
        <img
          src={backdropUrl}
          alt={title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80';
          }}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-black/30" />
      </div>

      {/* Hero Details Body */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-8 -mt-32 md:-mt-44 pb-16">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Poster */}
          <div className="w-48 sm:w-56 md:w-64 flex-shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] overflow-hidden rounded-2xl border-2 border-dark-line bg-dark-800 shadow-2xl shadow-black/80">
              <img
                src={posterUrl}
                alt={title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
                }}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Details Content */}
          <div className="flex-1 text-center md:text-left">
            {show.tagline && (
              <p className="text-gold italic text-sm md:text-base font-medium mb-1 flex items-center justify-center md:justify-start gap-1.5">
                <Sparkles className="h-4 w-4" />
                "{show.tagline}"
              </p>
            )}

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide text-white mb-3">
              {title}
            </h1>

            {/* Meta tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-300 mb-5">
              <div className="flex items-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1 border border-gold/40 text-gold shadow-sm">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-bold">{rating} / 10</span>
                {show.vote_count && (
                  <span className="text-[11px] text-gray-400 font-normal">({show.vote_count.toLocaleString()})</span>
                )}
              </div>

              <div className="flex items-center gap-1 text-gray-300">
                <Calendar className="h-3.5 w-3.5 text-gold" />
                <span>{show.first_air_date || year}</span>
              </div>

              <div className="flex items-center gap-1 rounded-md bg-dark-800 border border-dark-line px-2.5 py-1 text-gray-300">
                <Tv className="h-3.5 w-3.5 text-gold" />
                <span>{numSeasons} Season{numSeasons === 1 ? '' : 's'}</span>
              </div>

              <div className="flex items-center gap-1 text-gray-300">
                <Film className="h-3.5 w-3.5 text-gold" />
                <span>{totalEpisodes} Episodes</span>
              </div>

              {show.status && (
                <div className="flex items-center gap-1 rounded-full border border-dark-line px-2.5 py-1 text-gray-300">
                  <span className={`h-1.5 w-1.5 rounded-full ${show.status === 'Ended' ? 'bg-gray-500' : 'bg-emerald-400'}`} />
                  <span>{show.status}</span>
                </div>
              )}
            </div>

            {/* Genres Pills */}
            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                {show.genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-dark-line bg-dark-800 px-3 py-1 text-xs font-medium text-gray-300 transition hover:border-gold hover:text-gold"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-2">Overview</h3>
              <p className="text-sm sm:text-base leading-relaxed text-gray-200/95 max-w-3xl">
                {show.overview || 'No synopsis available for this title.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <a
                href="#trailer-section"
                className="flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-bold text-black transition hover:bg-gold-amber hover:shadow-[0_8px_20px_-4px_rgba(229,162,60,0.5)]"
              >
                <Play className="h-4 w-4 fill-black" />
                <span>Watch Trailer</span>
              </a>

              <button
                onClick={() => toggleWatchlist(show)}
                className={`flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-bold transition ${
                  isSaved
                    ? 'border-gold bg-gold/10 text-gold shadow-sm'
                    : 'border-dark-line bg-dark-800 text-white hover:border-gold hover:text-gold'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-gold' : 'fill-none'}`} />
                <span>{isSaved ? 'In Watchlist ✓' : '+ Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Episode Player (shown when an episode is selected) */}
        {activeEpisode && (
          <section className="mt-16 pt-8 border-t border-dark-line">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">
                {selectedSeason === 0 ? 'Special' : `S${selectedSeason}`} · E{activeEpisode.episode.episode_number} — {activeEpisode.episode.name}
              </h2>
              <button
                onClick={closeEpisode}
                className="flex items-center gap-1.5 rounded-full border border-dark-line bg-dark-800 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-gold hover:text-gold transition"
              >
                <X className="h-3.5 w-3.5" />
                Close
              </button>
            </div>

            {/* Custom video player placeholder */}
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-dark-line bg-black shadow-2xl">
              <div className="relative aspect-video w-full bg-dark-800">
                <img
                  src={getImageUrl(activeEpisode.episode.still_path, 'w780')}
                  alt={activeEpisode.episode.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/90 shadow-lg">
                    <Play className="h-7 w-7 fill-black text-black ml-1" />
                  </div>
                  <p className="text-sm font-semibold text-gray-200">Video playback unavailable</p>
                  <p className="text-xs text-textMuted max-w-xs text-center px-4">
                    This is a placeholder player. Connect a streaming source to enable playback.
                  </p>
                </div>
              </div>
            </div>

            {/* Episode description */}
            <div className="mx-auto max-w-4xl mt-5">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-400 mb-2">
                {activeEpisode.episode.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gold" />
                    {activeEpisode.episode.runtime}m
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gold" />
                  {formatAirDate(activeEpisode.episode.air_date)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-200/95">
                {activeEpisode.episode.overview || 'No description available for this episode.'}
              </p>

              {user ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleEpisodeWatched(activeEpisode.episode, !!activeWatched)}
                    disabled={pendingEpisodeKey === episodeKey(selectedSeason, activeEpisode.episode.episode_number)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold transition disabled:opacity-60 ${
                      activeWatched
                        ? 'border-gold bg-gold/10 text-gold hover:bg-gold/20'
                        : 'border-gold bg-gold text-black hover:bg-gold-amber'
                    }`}
                  >
                    {pendingEpisodeKey === episodeKey(selectedSeason, activeEpisode.episode.episode_number) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    {activeWatched ? 'Watched · Undo' : 'Mark as watched'}
                  </button>
                  <span className="text-[11px] text-textMuted">
                    Manual tracking — StreamScout doesn&apos;t stream video.
                  </span>
                </div>
              ) : (
                <p className="mt-4 text-[11px] text-textMuted">Log in to track watched episodes.</p>
              )}

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => goToEpisodeOffset(-1)}
                  disabled={activeEpisode.index <= 0}
                  className="flex items-center gap-1.5 rounded-lg border border-dark-line bg-dark-800 px-4 py-2 text-xs font-bold text-gray-300 transition hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-dark-line disabled:hover:text-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Episode
                </button>
                <button
                  onClick={() => goToEpisodeOffset(1)}
                  disabled={activeEpisode.index >= episodes.length - 1}
                  className="flex items-center gap-1.5 rounded-lg border border-dark-line bg-dark-800 px-4 py-2 text-xs font-bold text-gray-300 transition hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-dark-line disabled:hover:text-gray-300"
                >
                  Next Episode
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Season Selector + Episode List */}
        <section className="mt-16 pt-8 border-t border-dark-line">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-gold" />
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">Episodes</h2>
                {currentSeasonMeta && !seasonLoading && !seasonError && seasonData && Number(seasonData.season_number) === Number(selectedSeason) && (
                  <p className="mt-1 text-[11px] text-textMuted">
                    Showing {seasonLabel(currentSeasonMeta)} · {episodes.length} episode{episodes.length === 1 ? '' : 's'}
                  </p>
                )}
              </div>
            </div>

            {/* Season Dropdown */}
            <div className="relative w-full sm:w-56">
              <button
                onClick={() => setSeasonDropdownOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-dark-line bg-dark-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-gold"
              >
                <span className="truncate">{currentSeasonMeta ? seasonLabel(currentSeasonMeta) : 'Select season'}</span>
                <ChevronDown className={`h-4 w-4 text-gold transition-transform ${seasonDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {seasonDropdownOpen && (
                <div className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-lg border border-dark-line bg-dark-800 shadow-xl">
                  {seasons.map((s) => (
                    <button
                      key={s.id ?? `season-${s.season_number}`}
                      onClick={() => handleSelectSeason(s.season_number)}
                      className={`block w-full px-4 py-2.5 text-left text-sm font-medium transition hover:bg-dark-700 hover:text-gold ${
                        s.season_number === selectedSeason ? 'text-gold bg-dark-700/70' : 'text-gray-300'
                      }`}
                    >
                      {seasonLabel(s)}
                      <span className="ml-1.5 text-[11px] text-textMuted">({s.episode_count ?? 0} eps)</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {user && episodes.length > 0 && !seasonLoading && (
            <p className="mb-4 text-xs text-textMuted">
              {watchedInSeason} of {episodes.length} episodes marked watched in this season
            </p>
          )}
          {(progressError || (user && progressLoadError)) && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{progressError || progressLoadError}</span>
            </div>
          )}

          {seasons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-dark-line bg-dark-800/60 p-8 text-center">
              <Film className="h-10 w-10 text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-textMuted">TMDB lists no seasons for this series yet.</p>
            </div>
          ) : seasonLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-dark-800 animate-pulse" />
              ))}
            </div>
          ) : seasonError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-red-300 mb-4">{seasonError}</p>
              <button
                type="button"
                onClick={() => setSeasonRetry((n) => n + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dark-line bg-dark-800 px-4 py-2 text-xs font-bold text-gray-200 hover:border-gold hover:text-gold transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          ) : episodes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {episodes.map((ep, idx) => {
                const epWatched = watchedKeys.has(episodeKey(selectedSeason, ep.episode_number));
                const epKey = episodeKey(selectedSeason, ep.episode_number);
                return (
                <div
                  key={ep.id ?? `${selectedSeason}-${ep.episode_number}`}
                  onClick={() => openEpisode(ep, idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openEpisode(ep, idx)}
                  className="group flex flex-col sm:flex-row gap-4 rounded-xl border border-dark-line bg-dark-800/60 p-3 sm:p-4 cursor-pointer transition hover:border-gold hover:bg-dark-800"
                >
                  {/* Still image */}
                  <div className="relative w-full sm:w-48 flex-shrink-0 aspect-video overflow-hidden rounded-lg bg-dark-700">
                    <img
                      src={getImageUrl(ep.still_path, 'w300')}
                      alt={ep.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition">
                      <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 fill-white transition" />
                    </div>
                    <div className="absolute top-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-gold border border-gold/40">
                      E{ep.episode_number}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-gold transition-colors line-clamp-1">
                        {ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}
                      </h3>
                      {user && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEpisodeWatched(ep, epWatched);
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                          disabled={pendingEpisodeKey === epKey}
                          aria-pressed={epWatched}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition disabled:opacity-60 ${
                            epWatched
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-dark-line text-gray-300 hover:border-gold hover:text-gold'
                          }`}
                        >
                          {pendingEpisodeKey === epKey ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          {epWatched ? 'Watched' : 'Mark watched'}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs font-medium text-textMuted mb-2">
                      {ep.runtime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gold" />
                          {ep.runtime}m
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gold" />
                        {formatAirDate(ep.air_date)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300/90 line-clamp-2">
                      {ep.overview || 'No description available for this episode.'}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-dark-line bg-dark-800/60 p-8 text-center">
              <Film className="h-10 w-10 text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-textMuted">TMDB has no episodes listed for this season yet.</p>
            </div>
          )}
        </section>

        {/* Top Cast Section */}
        {cast.length > 0 && (
          <section className="mt-16 pt-8 border-t border-dark-line">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-gold" />
              <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">Top Cast Members</h2>
            </div>

            <div className="flex items-start gap-4 overflow-x-auto pb-4 no-scrollbar">
              {cast.map((member) => (
                <div key={member.id} className="w-24 sm:w-28 flex-shrink-0 text-center group">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 mx-auto rounded-full overflow-hidden border border-dark-line bg-dark-700 transition duration-300 group-hover:border-gold group-hover:scale-105 shadow-md">
                    <img
                      src={getProfileUrl(member.profile_path)}
                      alt={member.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=185&auto=format&fit=crop&q=80';
                      }}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2.5 text-xs font-semibold text-white line-clamp-1 group-hover:text-gold transition-colors">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-textMuted line-clamp-1">
                    {member.character || 'Actor'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Official Trailer */}
        <section id="trailer-section" className="mt-16 pt-8 border-t border-dark-line">
          <div className="flex items-center gap-2 mb-6">
            <Play className="h-5 w-5 text-gold fill-gold" />
            <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">Official Trailer</h2>
          </div>

          <TrailerPlayer title={title} trailer={officialTrailer} />
        </section>

        {/* More Like This Carousel */}
        {similarShows.length > 0 && (
          <div className="mt-16 pt-8 border-t border-dark-line">
            <MovieRow eyebrow="Recommendations" title="More Like This" movies={similarShows} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TVDetails;
