import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress, episodeKey } from '../context/ProgressContext';
import { fetchTVDetails, findNextUnwatchedEpisode, getImageUrl } from '../services/tmdb';

/**
 * Continue Watching row (authenticated users only).
 *  - movies: unfinished rows the user has started tracking (percent > 0, not completed)
 *  - TV: shows with at least one watched episode and a next unwatched aired
 *        episode, resolved from the show's real TMDB season/episode records
 * Progress is user-maintained; StreamScout has no video playback.
 */

const ProgressBar = ({ percent }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
    <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
  </div>
);

const Card = ({ item, onOpen }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    className="group relative flex-shrink-0 w-[62vw] sm:w-[260px] cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 focus:outline-none snap-start"
  >
    <div className="flex gap-3 rounded-xl border border-dark-line bg-dark-800/70 p-3 transition group-hover:border-gold">
      <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-dark-700">
        <img
          src={getImageUrl(item.posterPath, 'w185')}
          alt={item.title}
          loading="lazy"
          draggable={false}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
          }}
          className="h-full w-full object-cover pointer-events-none"
        />
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-between">
        <div>
          <p className="line-clamp-1 text-sm font-bold text-white group-hover:text-gold transition-colors">{item.title}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-textMuted">{item.subtitle}</p>
        </div>
        <div>
          <ProgressBar percent={item.percent} />
          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
            <span>{item.percentLabel}</span>
            <span className="inline-flex items-center gap-1 text-gold font-semibold">
              <Play className="h-3 w-3 fill-gold" />
              {item.cta}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ContinueWatching = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const { rows, loading: progressLoading, error: progressError, refresh } = useProgress();

  const [tvItems, setTvItems] = useState([]);
  const [tvItemsUserId, setTvItemsUserId] = useState(null);
  const [tvLoading, setTvLoading] = useState(false);
  const [tvError, setTvError] = useState(false);
  const [retry, setRetry] = useState(0);

  const userId = user?.id ?? null;

  // Unfinished movies come straight from the user's own rows.
  const movieItems = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            r.media_type === 'movie' &&
            !r.watched &&
            Number(r.progress_percent) > 0 &&
            Number(r.progress_percent) < 100
        )
        .map((r) => ({
          key: `movie-${r.tmdb_id}`,
          mediaType: 'movie',
          tmdbId: r.tmdb_id,
          title: r.title || 'Untitled movie',
          posterPath: r.poster_path,
          subtitle: 'Movie · progress tracked by you',
          percent: Number(r.progress_percent),
          percentLabel: `${Math.round(Number(r.progress_percent))}% tracked`,
          cta: 'Open',
          path: `/movie/${r.tmdb_id}`,
          updatedAt: r.updated_at,
        })),
    [rows]
  );

  // Stable signature of the user's watched-episode rows. When it changes
  // (an episode is marked/unmarked) the next-unwatched lookup re-runs.
  const tvSignature = useMemo(
    () =>
      rows
        .filter((r) => r.media_type === 'tv' && r.watched)
        .map((r) => `${r.tmdb_id}:${r.season_number}:${r.episode_number}`)
        .sort()
        .join('|'),
    [rows]
  );

  useEffect(() => {
    if (!userId) {
      setTvItems([]);
      setTvItemsUserId(null);
      setTvLoading(false);
      return undefined;
    }
    const watchedRows = rows.filter((r) => r.media_type === 'tv' && r.watched);
    if (watchedRows.length === 0) {
      setTvItems([]);
      setTvItemsUserId(userId);
      setTvError(false);
      setTvLoading(false);
      return undefined;
    }

    // One entry per series (no duplicate cards), most recently updated first.
    const byShow = new Map();
    watchedRows.forEach((r) => {
      const id = Number(r.tmdb_id);
      const entry = byShow.get(id) || { id, keys: new Set(), latest: r };
      entry.keys.add(episodeKey(r.season_number, r.episode_number));
      if (new Date(r.updated_at) > new Date(entry.latest.updated_at)) entry.latest = r;
      byShow.set(id, entry);
    });

    let cancelled = false;
    setTvLoading(true);
    setTvError(false);

    (async () => {
      const results = await Promise.all(
        [...byShow.values()].map(async (entry) => {
          try {
            const show = await fetchTVDetails(entry.id);
            const { next, watchedCount, totalCount, complete } = await findNextUnwatchedEpisode(show, entry.keys);
            if (complete || !next) return { ok: true, item: null };
            const percent = totalCount > 0 ? (watchedCount / totalCount) * 100 : 0;
            return {
              ok: true,
              item: {
                key: `tv-${entry.id}`,
                mediaType: 'tv',
                tmdbId: entry.id,
                title: show.name,
                posterPath: show.poster_path || entry.latest.poster_path,
                subtitle: `Next: S${next.season_number} · E${next.episode_number}${next.name ? ` — ${next.name}` : ''}`,
                percent,
                percentLabel: `${watchedCount} of ${totalCount} episodes`,
                cta: 'Next episode',
                path: `/tv/${entry.id}?season=${next.season_number}&episode=${next.episode_number}`,
                updatedAt: entry.latest.updated_at,
              },
            };
          } catch (err) {
            console.error(`Continue Watching: could not resolve series ${entry.id}`, err?.message || err);
            return { ok: false, item: null };
          }
        })
      );
      if (cancelled) return;
      setTvItems(results.map((r) => r.item).filter(Boolean));
      setTvItemsUserId(userId);
      setTvError(results.some((r) => !r.ok));
      setTvLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // rows is intentionally represented by tvSignature + userId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tvSignature, retry]);

  // Logged-out visitors (and the brief auth check) see nothing.
  if (authLoading || !user) return null;

  // Do not display a stale TV result from the previous account while the
  // new account's next-episode lookup is still running.
  const visibleTvItems = tvItemsUserId === userId ? tvItems : [];
  const items = [...movieItems, ...visibleTvItems].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  const loading = progressLoading || tvLoading;

  return (
    <section id="continue-watching" className="mb-10 sm:mb-12">
      <div className="px-4 sm:px-8 md:px-12 mb-3">
        <p className="text-gold text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-1">Pick Up Where You Left Off</p>
        <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">Continue Watching</h2>
      </div>

      {progressError ? (
        <div className="mx-4 sm:mx-8 md:mx-12 flex items-center justify-between gap-4 rounded-xl border border-red-900/40 bg-red-950/20 px-5 py-4 text-sm text-red-200">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {progressError}
          </span>
          <button
            onClick={refresh}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-800/60 px-3 py-1.5 font-semibold text-red-100 transition hover:bg-red-900/40"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      ) : loading && items.length === 0 ? (
        <div className="mx-4 sm:mx-8 md:mx-12 flex items-center gap-2 text-sm text-textMuted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your progress…
        </div>
      ) : items.length === 0 ? (
        <div className="mx-4 sm:mx-8 md:mx-12 rounded-xl border border-dashed border-dark-line bg-dark-800/40 px-5 py-6 text-sm text-textMuted">
          Nothing in progress. Open a movie to track how far you are, or mark a TV episode as watched, and it will show up here.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto px-4 sm:px-8 md:px-12 pb-3 no-scrollbar snap-x">
          {items.map((item) => (
            <Card key={item.key} item={item} onOpen={() => navigate(item.path)} />
          ))}
        </div>
      )}

      {tvError && !progressError && (
        <div className="mx-4 sm:mx-8 md:mx-12 mt-3 flex items-center justify-between gap-4 text-xs text-amber-300/90">
          <span>Some shows couldn&apos;t be checked against TMDB right now.</span>
          <button onClick={() => setRetry((n) => n + 1)} className="font-semibold underline hover:text-gold">
            Retry
          </button>
        </div>
      )}
    </section>
  );
};

export default ContinueWatching;
