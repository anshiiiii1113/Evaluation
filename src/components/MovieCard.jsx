import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Bookmark } from 'lucide-react';
import { getDetailsPath, getImageUrl, getMediaType, getReleaseYear, getTitle } from '../services/tmdb';
import { useWatchlist } from '../context/WatchlistContext';

const MovieCard = ({ movie, index = 0 }) => {
  const navigate = useNavigate();
  const { inWatchlist, toggleWatchlist } = useWatchlist();

  if (!movie) return null;

  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const mediaType = getMediaType(movie, 'movie');
  const isSaved = inWatchlist(movie.id);

  const handleClick = () => {
    const path = getDetailsPath(movie, mediaType);
    if (path !== '/') navigate(path);
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="group relative flex-shrink-0 w-[42vw] xs:w-[38vw] sm:w-[220px] md:w-[200px] lg:w-[180px] xl:w-[190px] cursor-pointer select-none transition-all duration-300 hover:-translate-y-2 focus:outline-none snap-start"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-dark-line bg-dark-700 shadow-lg transition-all duration-300 group-hover:border-gold group-hover:shadow-[0_12px_28px_-6px_rgba(229,162,60,0.35)] group-active:scale-[0.97]">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          draggable={false}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
          }}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
        />

        {/* Dynamic Sheen Effect on Hover */}
        <div className="poster-sheen" />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-black/20 opacity-40 group-hover:opacity-60 transition-opacity" />

        {/* Watchlist Bookmark Button */}
        <button
          onClick={handleWatchlistClick}
          aria-label={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200 active:scale-125 ${
            isSaved
              ? 'bg-gold border-gold text-black shadow-md'
              : 'bg-black/60 border-white/25 text-white hover:border-gold hover:text-gold hover:scale-110'
          }`}
        >
          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-black' : 'fill-none'}`} />
        </button>

        {/* TMDB Rating Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 backdrop-blur-sm border border-white/10">
          <Star className="h-3 w-3 fill-gold text-gold" />
          <span className="text-xs font-bold text-white tracking-wide">{rating}</span>
        </div>

        {/* Media type tag (TV or Movie) */}
        {mediaType === 'tv' && (
          <div className="absolute top-2.5 left-2.5 z-10 rounded bg-gold/90 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-black">
            TV
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="mt-2.5 px-0.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-[#e7e9ee] transition-colors duration-200 group-hover:text-gold">
          {title}
        </h3>
        <p className="text-xs text-textMuted mt-0.5 font-medium">
          {year}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
