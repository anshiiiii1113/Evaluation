import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar, Film, Bookmark } from 'lucide-react';
import { getBackdropUrl, getDetailsPath, getImageUrl, getMediaType, getReleaseYear, getTitle, GENRE_MAP, normalizeCatalog } from '../services/tmdb';
import { useWatchlist } from '../context/WatchlistContext';

const AUTO_SLIDE_MS = 6000;
const SWIPE_THRESHOLD = 50;

const HeroCarousel = ({ items = [], loading = false }) => {
  const navigate = useNavigate();
  const { inWatchlist, toggleWatchlist } = useWatchlist();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const touchState = useRef({ startX: 0, deltaX: 0, touching: false });

  // Normalize before slicing so the Hero can never feature a duplicate TV
  // season/specials card or a trailer-style entry — only clean movie/tv
  // franchise cards, top 5 by incoming (trending) order.
  const slides = normalizeCatalog(items).slice(0, 5);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // --- Touch swipe support (mobile) ---
  const onTouchStart = (e) => {
    touchState.current.touching = true;
    touchState.current.startX = e.touches[0].clientX;
    touchState.current.deltaX = 0;
    setIsPaused(true);
  };

  const onTouchMove = (e) => {
    if (!touchState.current.touching) return;
    touchState.current.deltaX = e.touches[0].clientX - touchState.current.startX;
  };

  const onTouchEnd = () => {
    if (!touchState.current.touching) return;
    const { deltaX } = touchState.current;
    if (deltaX > SWIPE_THRESHOLD) {
      handlePrev();
    } else if (deltaX < -SWIPE_THRESHOLD) {
      handleNext();
    }
    touchState.current.touching = false;
    touchState.current.deltaX = 0;
    setIsPaused(false);
  };

  if (loading) {
    return (
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-[82vh] min-h-[420px] max-h-[820px] w-full animate-pulse bg-dark-800 border-b border-dark-line">
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 sm:px-10">
          <div className="h-6 w-36 rounded bg-dark-700 mb-4" />
          <div className="h-12 w-3/4 max-w-xl rounded bg-dark-700 mb-4" />
          <div className="h-4 w-1/2 max-w-lg rounded bg-dark-700 mb-6" />
          <div className="flex gap-4">
            <div className="h-12 w-32 rounded-lg bg-dark-700" />
            <div className="h-12 w-32 rounded-lg bg-dark-700" />
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentMovie = slides[currentIndex];
  const title = getTitle(currentMovie);
  const year = getReleaseYear(currentMovie);
  const rating = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : 'NR';
  const backdropUrl = getBackdropUrl(currentMovie.backdrop_path);
  const posterUrl = getImageUrl(currentMovie.poster_path, 'w500');
  const isSaved = inWatchlist(currentMovie.id);

  // Extract genre names
  const genreNames = (currentMovie.genre_ids || [])
    .slice(0, 3)
    .map((id) => GENRE_MAP[id])
    .filter(Boolean);

  return (
    <div
      className="relative h-[60vh] sm:h-[70vh] lg:h-[82vh] min-h-[420px] max-h-[820px] w-full overflow-hidden border-b border-dark-line bg-black select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Images with Crossfade + Slide */}
      {slides.map((movie, idx) => {
        const isActive = idx === currentIndex;
        const isPrev = idx === (currentIndex - 1 + slides.length) % slides.length;
        return (
          <div
            key={`${movie.media_type || getMediaType(movie, 'movie')}:${movie.id || idx}`}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              isActive
                ? 'opacity-100 translate-x-0 scale-100 z-[1]'
                : isPrev
                ? 'opacity-0 -translate-x-6 scale-105 pointer-events-none'
                : 'opacity-0 translate-x-6 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={getBackdropUrl(movie.backdrop_path)}
              alt={getTitle(movie)}
              draggable={false}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80';
              }}
              className="h-full w-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* Atmospheric Cinema Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/65 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/85 to-transparent max-w-4xl" />

      {/* Decorative Watermark from StreamScout design */}
      <div className="hidden lg:block absolute right-[6%] bottom-16 text-right font-display text-8xl font-black leading-none text-white/[0.04] rotate-[-6deg] pointer-events-none select-none">
        STREAM<br />
        <span className="text-gold/20">SCOUT</span>
      </div>

      {/* Main Slide Content */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 sm:px-8 md:px-12 pb-14 sm:pb-16 z-10">
        <div className="max-w-2xl">
          {/* Eyebrow / Category Tag */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="flex h-2 w-2 rounded-full bg-gold animate-ping" />
            <span className="text-gold text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.3em]">
              Trending #{currentIndex + 1} Spotlight
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-wide text-white drop-shadow-lg mb-2 sm:mb-3 line-clamp-2">
            {title}
          </h1>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4">
            {/* Rating */}
            <div className="flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1 border border-gold/40 text-gold shadow-sm backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-gold" />
              <span>{rating} TMDB</span>
            </div>

            {/* Release Year */}
            <div className="flex items-center gap-1 text-gray-300">
              <Calendar className="h-3.5 w-3.5 text-gold" />
              <span>{year}</span>
            </div>

            {/* Genres */}
            {genreNames.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-gray-300">
                <Film className="h-3.5 w-3.5 text-gold" />
                <span>{genreNames.join(' • ')}</span>
              </div>
            )}
          </div>

          {/* Overview Synopsis */}
          <p className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-base text-gray-300/90 leading-relaxed mb-5 sm:mb-6 font-normal max-w-xl">
            {currentMovie.overview || 'Explore this trending title on StreamScout with live cast details, trailers, and more.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
            <button
              onClick={() => navigate(`${getDetailsPath(currentMovie, 'movie')}#trailer-section`)}
              className="flex items-center gap-2 rounded-lg bg-gold px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-black transition-all duration-200 hover:bg-gold-amber hover:shadow-[0_8px_24px_-4px_rgba(229,162,60,0.55)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>Watch Trailer</span>
            </button>

            <button
              onClick={() => navigate(getDetailsPath(currentMovie, 'movie'))}
              className="flex items-center gap-2 rounded-lg border border-dark-line bg-dark-800/80 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:border-gold hover:text-gold hover:bg-dark-700/80 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm"
            >
              <Info className="h-4 w-4" />
              <span>More Info</span>
            </button>

            <button
              onClick={() => toggleWatchlist(currentMovie)}
              className={`flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm ${
                isSaved
                  ? 'border-gold bg-gold text-black shadow-md'
                  : 'border-white/20 bg-black/50 text-white hover:border-gold hover:text-gold'
              }`}
              title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${isSaved ? 'fill-black' : 'fill-none'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-black/50 border border-white/20 text-white transition hover:bg-gold hover:text-black hover:border-gold backdrop-blur-md"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-black/50 border border-white/20 text-white transition hover:bg-gold hover:text-black hover:border-gold backdrop-blur-md"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 sm:bottom-5 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-12 z-20 flex items-center gap-2">
        {slides.map((_, dotIdx) => (
          <button
            key={dotIdx}
            onClick={() => setCurrentIndex(dotIdx)}
            aria-label={`Go to slide ${dotIdx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              dotIdx === currentIndex
                ? 'w-8 h-2.5 bg-gold shadow-[0_0_8px_rgba(229,162,60,0.8)]'
                : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
