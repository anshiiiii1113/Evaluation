import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  ArrowLeft,
  Play,
  Bookmark,
  Sparkles,
  Users,
  Film
} from 'lucide-react';
import {
  fetchMovieDetails,
  getBackdropUrl,
  getImageUrl,
  getProfileUrl,
  formatRuntime,
  getReleaseYear,
  getTitle,
  getOfficialTrailer
} from '../services/tmdb';
import MovieRow from './MovieRow';
import MovieProgressPanel from './MovieProgressPanel';
import TrailerPlayer from './TrailerPlayer';
import { useWatchlist } from '../context/WatchlistContext';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inWatchlist, toggleWatchlist } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchMovieDetails(id)
      .then((data) => {
        if (isMounted) {
          setMovie(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching movie details:', err);
        if (isMounted) {
          setError('Failed to load movie details. Please try again later.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // The homepage hero can navigate directly to this section. Wait until the
  // details render so the anchor exists before scrolling.
  useEffect(() => {
    if (loading || !movie || window.location.hash !== '#trailer-section') return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('trailer-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, movie]);

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

  if (error || !movie) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="rounded-2xl border border-dark-line bg-dark-800 p-8 max-w-md">
          <Film className="h-12 w-12 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
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

  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const runtime = formatRuntime(movie.runtime || movie.episode_run_time?.[0]);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';
  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const isSaved = inWatchlist(movie.id);

  // Cast members (first 10)
  const cast = (movie.credits?.cast || []).slice(0, 10);

  // Similar movies
  const similarMovies = (movie.similar?.results || movie.recommendations?.results || []).slice(0, 14);

  // Use the shared, validated YouTube selection logic for both movies and TV.
  const officialTrailer = getOfficialTrailer(movie.videos);

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
            {/* Tagline */}
            {movie.tagline && (
              <p className="text-gold italic text-sm md:text-base font-medium mb-1 flex items-center justify-center md:justify-start gap-1.5">
                <Sparkles className="h-4 w-4" />
                "{movie.tagline}"
              </p>
            )}

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide text-white mb-3">
              {title}
            </h1>

            {/* Meta tags */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-300 mb-5">
              {/* Rating */}
              <div className="flex items-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1 border border-gold/40 text-gold shadow-sm">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-bold">{rating} / 10</span>
                {movie.vote_count && (
                  <span className="text-[11px] text-gray-400 font-normal">({movie.vote_count.toLocaleString()})</span>
                )}
              </div>

              {/* Release Date */}
              <div className="flex items-center gap-1 text-gray-300">
                <Calendar className="h-3.5 w-3.5 text-gold" />
                <span>{movie.release_date || movie.first_air_date || year}</span>
              </div>

              {/* Runtime */}
              {runtime !== 'N/A' && (
                <div className="flex items-center gap-1 text-gray-300">
                  <Clock className="h-3.5 w-3.5 text-gold" />
                  <span>{runtime}</span>
                </div>
              )}
            </div>

            {/* Genres Pills */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                {movie.genres.map((g) => (
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
                {movie.overview || 'No synopsis available for this title.'}
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
                onClick={() => toggleWatchlist(movie)}
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

            {/* User-maintained progress tracking (no real playback) */}
            <div className="flex justify-center md:justify-start">
              <MovieProgressPanel movie={movie} />
            </div>
          </div>
        </div>

        {/* Top 10 Cast Section */}
        {cast.length > 0 && (
          <section className="mt-16 pt-8 border-t border-dark-line">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-gold" />
              <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">
                Top Cast Members
              </h2>
            </div>

            <div className="flex items-start gap-4 overflow-x-auto pb-4 no-scrollbar">
              {cast.map((member) => (
                <div
                  key={member.id}
                  className="w-24 sm:w-28 flex-shrink-0 text-center group"
                >
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

        {/* Official YouTube Trailer Embed */}
        <section id="trailer-section" className="mt-16 pt-8 border-t border-dark-line">
          <div className="flex items-center gap-2 mb-6">
            <Play className="h-5 w-5 text-gold fill-gold" />
            <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">
              Official Trailer
            </h2>
          </div>

          <TrailerPlayer title={title} trailer={officialTrailer} />
        </section>

        {/* More Like This Carousel */}
        {similarMovies.length > 0 && (
          <div className="mt-16 pt-8 border-t border-dark-line">
            <MovieRow
              eyebrow="Recommendations"
              title="More Like This"
              movies={similarMovies}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
