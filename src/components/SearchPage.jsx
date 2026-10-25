import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Film, Loader2, AlertTriangle } from 'lucide-react';
import { searchMulti, normalizeCatalog } from '../services/tmdb';
import MovieCard from './MovieCard';

// Skeleton placeholder that mirrors MovieCard's shape while results load
const MovieCardSkeleton = () => (
  <div className="w-[160px] sm:w-[180px] md:w-[195px] animate-pulse">
    <div className="aspect-[2/3] w-full rounded-xl border border-dark-line bg-dark-700" />
    <div className="mt-2.5 px-0.5 space-y-1.5">
      <div className="h-3.5 w-4/5 rounded bg-dark-700" />
      <div className="h-3 w-1/3 rounded bg-dark-700" />
    </div>
  </div>
);

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(false);

  // Sync state if URL param changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      setError(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(false);
    let cancelled = false;
    const handler = setTimeout(() => {
      searchMulti(query)
        .then((data) => {
          if (cancelled) return;
          // Preserve each real TMDB result's media_type and ID. Do not merge
          // titles based on wording: a series, season, special, or movie may
          // be a distinct TMDB record and must not be silently substituted.
          setResults(normalizeCatalog(data));
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('Search error:', err);
          setError(true);
          setResults([]);
          setLoading(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [query]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({}, { replace: true });
    setResults([]);
    setHasSearched(false);
    setError(false);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-8 pb-20 px-4 sm:px-8 md:px-12">
      {/* Search Header */}
      <div className="mx-auto max-w-4xl text-center mb-10">
        <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-3">
          Search <span className="text-gold">StreamScout</span>
        </h1>
        <p className="text-sm text-textMuted max-w-md mx-auto mb-8">
          Instant live search across millions of movies, TV shows, and trending entertainment.
        </p>

        {/* Live Search Input */}
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search by title, franchise, or character (e.g., Avengers, Dune, Stranger Things)..."
            autoFocus
            className="w-full rounded-full border border-dark-line bg-dark-800 py-3.5 pl-12 pr-12 text-sm text-white placeholder-gray-500 shadow-inner transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="mx-auto max-w-7xl">
        {loading && (
          <div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-gold mb-2" />
              <p className="text-xs text-textMuted">Searching TMDB library...</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
              {Array.from({ length: 12 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-red-500/40 bg-dark-800/50 p-10 text-center my-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Something Went Wrong</h3>
            <p className="text-sm text-textMuted">
              We couldn't reach TMDB right now. Please check your connection and try again.
            </p>
          </div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-dark-line bg-dark-800/50 p-10 text-center my-12">
            <Film className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Results Found</h3>
            <p className="text-sm text-textMuted">
              No movies or TV shows matched "{query}". Try checking your spelling or searching for a different keyword.
            </p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-dark-line">
              <h2 className="text-lg font-bold text-gray-300">
                Results for "<span className="text-gold">{query}</span>"
              </h2>
              <span className="text-xs text-textMuted font-medium">
                {results.length} titles found
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
              {results.map((item, index) => (
                <MovieCard key={`${item.media_type || 'unknown'}:${item.id || index}`} movie={item} index={index} />
              ))}
            </div>
          </div>
        )}

        {!hasSearched && !error && (
          <div className="mx-auto max-w-xl text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-800 border border-dark-line text-gold mb-4 shadow-lg">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Find Your Next Watch</h3>
            <p className="text-sm text-textMuted">
              Type any movie or show title in the box above to see real-time TMDB results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
