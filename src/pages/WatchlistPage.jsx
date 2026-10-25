import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Film, Trash2, Star, Play } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getDetailsPath, getImageUrl, getReleaseYear, getTitle } from '../services/tmdb';

const WatchlistPage = () => {
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <div className="min-h-screen bg-[#080808] text-white py-12 px-4 sm:px-8 md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 pb-4 border-b border-dark-line flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold mb-1">
              <Bookmark className="h-5 w-5 fill-gold" />
              <span className="text-xs font-bold uppercase tracking-widest">Personal Collection</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide">
              Your Watchlist
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-textMuted font-medium">
            {watchlist.length === 0
              ? 'Nothing saved yet'
              : `${watchlist.length} title${watchlist.length > 1 ? 's' : ''} saved to watch`}
          </p>
        </div>

        {/* Empty State */}
        {watchlist.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-dark-line bg-dark-800/40 p-12 text-center my-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-700 text-gold mb-4">
              <Film className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your watchlist is empty</h3>
            <p className="text-sm text-textMuted mb-6">
              Click the bookmark icon on any movie or TV series to keep track of what you want to watch.
            </p>
            <button
              onClick={() => navigate('/')}
              className="rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-black transition hover:bg-gold-amber shadow-lg"
            >
              Explore Titles
            </button>
          </div>
        ) : (
          /* Watchlist Ticket Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {watchlist.map((item) => {
              const title = getTitle(item);
              const year = getReleaseYear(item);
              const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';
              const poster = getImageUrl(item.poster_path, 'w500');

              return (
                <div
                  key={`${item.media_type || 'unknown'}:${item.id}`}
                  className="flex rounded-xl border border-dark-line bg-dark-700/60 overflow-hidden shadow-lg transition hover:border-gold/60 group"
                >
                  {/* Poster */}
                  <div
                    onClick={() => navigate(getDetailsPath(item))}
                    className="w-28 sm:w-32 flex-shrink-0 cursor-pointer overflow-hidden relative"
                  >
                    <img
                      src={poster}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col justify-between p-4 flex-1">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => navigate(getDetailsPath(item))}
                          className="font-display text-xl sm:text-2xl text-white cursor-pointer hover:text-gold transition line-clamp-1"
                        >
                          {title}
                        </h3>
                        <div className="flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-xs font-bold text-gold border border-gold/30 flex-shrink-0">
                          <Star className="h-3 w-3 fill-gold" />
                          <span>{rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-textMuted mt-1 font-medium">
                        {year} • {item.media_type === 'tv' ? 'Web Series' : 'Feature Film'}
                      </p>

                      <p className="text-xs text-gray-300 line-clamp-2 mt-2 leading-relaxed">
                        {item.overview || 'No synopsis provided.'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-line/70">
                      <button
                        onClick={() => navigate(getDetailsPath(item))}
                        className="flex items-center gap-1.5 text-xs font-bold text-gold hover:underline"
                      >
                        <Play className="h-3.5 w-3.5 fill-gold" />
                        <span>Watch / Details</span>
                      </button>

                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
