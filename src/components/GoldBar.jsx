import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Popcorn, Tv, Heart } from 'lucide-react';

const GoldBar = ({ onOpenSignIn }) => {
  return (
    <div className="w-full">
      {/* StreamScout Gold Ribbon */}
      <div className="h-12 w-full bg-gradient-to-r from-[#b87920] via-[#e7a33d] to-[#b87920] shadow-[0_3px_15px_rgba(229,162,60,0.25)] flex items-center justify-between px-4 sm:px-8">
        {/* Quick Nav Links on the Gold Ribbon */}
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-1">
          <Link
            to="/"
            className="text-xs sm:text-sm font-bold text-[#17100a] hover:text-black transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover</span>
          </Link>

          <a
            href="/#trending"
            className="text-xs sm:text-sm font-bold text-[#17100a] hover:text-black transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Trending</span>
          </a>

          <a
            href="/#new-releases"
            className="text-xs sm:text-sm font-bold text-[#17100a] hover:text-black transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Popcorn className="h-3.5 w-3.5" />
            <span>New Releases</span>
          </a>

          <a
            href="/#web-series"
            className="text-xs sm:text-sm font-bold text-[#17100a] hover:text-black transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Tv className="h-3.5 w-3.5" />
            <span>Web Series</span>
          </a>

          <Link
            to="/watchlist"
            className="text-xs sm:text-sm font-bold text-[#17100a] hover:text-black transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Watchlist</span>
          </Link>
        </div>

        {/* Ribbon Login CTA */}
        <button
          onClick={() => onOpenSignIn('login')}
          className="hidden sm:block text-xs font-extrabold uppercase tracking-wider text-[#17100a] border-2 border-[#17100a] rounded px-3 py-1 hover:bg-[#17100a] hover:text-[#e7a33d] transition whitespace-nowrap ml-4"
        >
          Login
        </button>
      </div>

      {/* Live TMDB Entertainment Ticker Marquee */}
      <div className="overflow-hidden border-b border-dark-line bg-dark-850 py-1.5">
        <div className="animate-ticker text-[11px] font-medium text-textMuted tracking-wider flex items-center">
          <span className="px-6 border-r border-dark-line">
            🔥 <b>STREAM SCOUT LIVE</b> · Real-time TMDB Sync Active
          </span>
          <span className="px-6 border-r border-dark-line">
            🎬 <b>Trending All Week</b> · Updated hourly from worldwide box office
          </span>
          <span className="px-6 border-r border-dark-line">
            🍿 <b>4K UHD Trailers</b> · YouTube Official Embeds
          </span>
          <span className="px-6 border-r border-dark-line">
            ⭐ <b>Verified Ratings</b> · Millions of community reviews
          </span>
          <span className="px-6 border-r border-dark-line">
            🔥 <b>STREAM SCOUT LIVE</b> · Real-time TMDB Sync Active
          </span>
          <span className="px-6 border-r border-dark-line">
            🎬 <b>Trending All Week</b> · Updated hourly from worldwide box office
          </span>
          <span className="px-6 border-r border-dark-line">
            🍿 <b>4K UHD Trailers</b> · YouTube Official Embeds
          </span>
          <span className="px-6 border-r border-dark-line">
            ⭐ <b>Verified Ratings</b> · Millions of community reviews
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoldBar;
