import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import MovieRow from '../components/MovieRow';
import ContinueWatching from '../components/ContinueWatching';
import {
  fetchTrending,
  fetchNewReleases,
  fetchActionMovies,
  fetchComedyMovies,
  fetchHorrorMovies,
  fetchSciFiMovies,
  fetchPopularWebSeries,
  normalizeCatalog,
  isUsingOfflineFallback
} from '../services/tmdb';
import { Sparkles, Tv, Flame, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Memoized so the banner (which never changes) doesn't re-render whenever
// Home's data state updates.
const BingeBanner = memo(function BingeBanner() {
  return (
    <div className="mx-4 sm:mx-8 md:mx-12 my-8 rounded-2xl border border-dark-line bg-gradient-to-r from-red-950/40 via-dark-800 to-blue-950/40 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
      <div className="relative z-10 max-w-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 border border-gold/40 px-3 py-1 text-xs font-bold text-gold uppercase tracking-wider mb-4">
          <Tv className="h-3.5 w-3.5" />
          <span>StreamScout Original Feature</span>
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-wide">
          Your Next Binge Starts Here.
        </h2>
        <p className="text-sm sm:text-base text-gray-300 mb-6 leading-relaxed">
          Find exciting web series, unforgettable characters, and stories that keep you hooked with instant streaming trailers and live ratings.
        </p>
        <button
          onClick={() => {
            const el = document.getElementById('web-series');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="rounded-lg bg-gold px-6 py-3 text-sm font-bold text-black transition hover:bg-gold-amber hover:shadow-lg"
        >
          Explore All Series
        </button>
      </div>
      {/* Ambient Background Graphic */}
      <div className="absolute right-4 -bottom-6 font-display text-9xl font-black text-white/[0.02] select-none pointer-events-none">
        SERIES
      </div>
    </div>
  );
});

// Small inline banner shown when a refresh/retry fails but we still have
// previously-loaded content on screen — never blanks the page.
const ErrorBanner = memo(function ErrorBanner({ message, onRetry }) {
  return (
    <div className="mx-4 sm:mx-8 md:mx-12 mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-900/40 bg-red-950/20 px-5 py-4 text-sm text-red-200">
      <span>{message}</span>
      <button
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-800/60 px-3 py-1.5 font-semibold text-red-100 transition hover:bg-red-900/40"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  );
});

const Home = () => {
  const navigate = useNavigate();

  // State for all required sections
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [sciFiMovies, setSciFiMovies] = useState([]);
  const [webSeries, setWebSeries] = useState([]);

  // Loading states
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingRails, setLoadingRails] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const loadAllContent = useCallback(async (isMountedRef) => {
    try {
      setError(null);

      // Fetch trending first for immediate Hero rendering.
      // Normalize so the Hero/Trending rail never shows duplicate TV
      // franchise seasons or trailer-style entries — one card per title.
      const trendingData = normalizeCatalog(await fetchTrending());
      if (isMountedRef.current) {
        setTrending(trendingData);
        setLoadingHero(false);
      }

      // Fetch remaining category rails in parallel. Each rail catches its
      // own failure and returns null so one bad rail can't take down the
      // others; on failure the previous state is preserved (see `prev`
      // fallback below) rather than cleared.
      const [newRel, action, comedy, horror, sciFi, series] = await Promise.all([
        fetchNewReleases().catch((e) => {
          console.error('Error fetching new releases', e);
          return null;
        }),
        fetchActionMovies().catch((e) => {
          console.error('Error fetching action movies', e);
          return null;
        }),
        fetchComedyMovies().catch((e) => {
          console.error('Error fetching comedy movies', e);
          return null;
        }),
        fetchHorrorMovies().catch((e) => {
          console.error('Error fetching horror movies', e);
          return null;
        }),
        fetchSciFiMovies().catch((e) => {
          console.error('Error fetching sci-fi movies', e);
          return null;
        }),
        fetchPopularWebSeries().catch((e) => {
          console.error('Error fetching web series', e);
          return null;
        })
      ]);

      if (isMountedRef.current) {
        // Movie rails: TMDB /discover and /movie results don't include
        // media_type, so pass a fallback. Movies pass through de-duped
        // but otherwise untouched. A `null` result (rail-specific failure)
        // keeps whatever was already rendered instead of clearing the rail.
        setNewReleases((prev) => (newRel ? normalizeCatalog(newRel, 'movie') : prev));
        setActionMovies((prev) => (action ? normalizeCatalog(action, 'movie') : prev));
        setComedyMovies((prev) => (comedy ? normalizeCatalog(comedy, 'movie') : prev));
        setHorrorMovies((prev) => (horror ? normalizeCatalog(horror, 'movie') : prev));
        setSciFiMovies((prev) => (sciFi ? normalizeCatalog(sciFi, 'movie') : prev));
        // Web series rail: collapse season/specials duplicates into a
        // single franchise card per show (e.g. one "Jujutsu Kaisen" card).
        setWebSeries((prev) => (series ? normalizeCatalog(series, 'tv') : prev));
        setLoadingRails(false);

        const anyRailFailed = [newRel, action, comedy, horror, sciFi, series].some((r) => r === null);
        if (anyRailFailed) {
          setError('Some sections couldn\u2019t be refreshed. Showing the latest available data.');
        }
      }
    } catch (err) {
      console.error('Error loading homepage content from TMDB:', err);
      if (isMountedRef.current) {
        setError('Failed to fetch streaming content from TMDB.');
        setLoadingHero(false);
        setLoadingRails(false);
      }
    }
  }, []);

  useEffect(() => {
    const isMountedRef = { current: true };
    loadAllContent(isMountedRef);
    return () => {
      isMountedRef.current = false;
    };
  }, [loadAllContent, retryToken]);

  const handleRetry = useCallback(() => {
    setRetryToken((t) => t + 1);
  }, []);

  // Memoize row props so downstream memoized components don't see new
  // array identities on renders that don't actually change a rail's data.
  const trendingMemo = useMemo(() => trending, [trending]);
  const newReleasesMemo = useMemo(() => newReleases, [newReleases]);
  const actionMoviesMemo = useMemo(() => actionMovies, [actionMovies]);
  const comedyMoviesMemo = useMemo(() => comedyMovies, [comedyMovies]);
  const horrorMoviesMemo = useMemo(() => horrorMovies, [horrorMovies]);
  const sciFiMoviesMemo = useMemo(() => sciFiMovies, [sciFiMovies]);
  const webSeriesMemo = useMemo(() => webSeries, [webSeries]);

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* 1. Hero Carousel (Top 5 Trending Titles) */}
      <HeroCarousel items={trendingMemo} loading={loadingHero} />

      {error && <ErrorBanner message={error} onRetry={handleRetry} />}

      {isUsingOfflineFallback() && (
        <div className="mx-4 sm:mx-8 md:mx-12 my-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 px-5 py-3 text-xs text-amber-200">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              <strong>Offline / Campus Mode:</strong> Live TMDB connection was blocked by this network/ISP. StreamScout is displaying high-res offline catalog with working trailers and full seasons.
            </span>
          </span>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-600/40 bg-amber-900/30 px-3 py-1 font-semibold text-amber-100 hover:bg-amber-800/40 transition"
          >
            <RefreshCw className="h-3 w-3" />
            Retry Live Connection
          </button>
        </div>
      )}

      {/* Main Rails Container */}
      <main className="py-10">
        {/* 2. Trending Now Section */}
        <div id="trending">
          <MovieRow
            eyebrow="Live Worldwide"
            title="Trending Now"
            movies={trendingMemo}
            loading={loadingRails}
          />
        </div>

        {/* Continue Watching (logged-in users only), directly below Trending */}
        <ContinueWatching />

        {/* 3. New Releases Section */}
        <div id="new-releases">
          <MovieRow
            eyebrow="Fresh In Theaters &amp; Streaming"
            title="New Releases"
            movies={newReleasesMemo}
            loading={loadingRails}
          />
        </div>

        {/* 4. Action Section */}
        <div id="action">
          <MovieRow
            eyebrow="High Octane &amp; Adrenaline"
            title="Action"
            movies={actionMoviesMemo}
            loading={loadingRails}
          />
        </div>

        {/* 5. Comedy Section */}
        <div id="comedy">
          <MovieRow
            eyebrow="Laugh Out Loud"
            title="Comedy"
            movies={comedyMoviesMemo}
            loading={loadingRails}
          />
        </div>

        {/* 6. Horror Section */}
        <div id="horror">
          <MovieRow
            eyebrow="Spine-Chilling Thrills"
            title="Horror"
            movies={horrorMoviesMemo}
            loading={loadingRails}
          />
        </div>

        {/* 7. Sci-Fi Section */}
        <div id="scifi">
          <MovieRow
            eyebrow="Beyond The Stars"
            title="Sci-Fi"
            movies={sciFiMoviesMemo}
            loading={loadingRails}
          />
        </div>

        {/* 8. Web Series Section & StreamScout Binge Banner */}
        <div id="web-series">
          <MovieRow
            eyebrow="Binge-Worthy Television"
            title="Popular Web Series"
            movies={webSeriesMemo}
            loading={loadingRails}
          />

          {/* Original StreamScout Binge Box Feature */}
          <BingeBanner />
        </div>
      </main>
    </div>
  );
};

export default Home;
