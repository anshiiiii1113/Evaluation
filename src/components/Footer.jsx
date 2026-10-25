import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="about" className="border-t border-dark-line bg-[#050505] py-14 px-4 sm:px-8 text-center">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="inline-block font-display text-3xl tracking-wider text-white mb-2">
          STREAM<span className="text-gold">SCOUT</span>
        </Link>
        <p className="text-sm text-textMuted max-w-md mx-auto mb-6">
          Discover. Explore. Watch. Your comprehensive portal to the finest cinema and web series worldwide.
        </p>

        {/* Quick Footer Navigation */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400 font-medium mb-8">
          <Link to="/" className="hover:text-gold transition">Home</Link>
          <a href="/#trending" className="hover:text-gold transition">Trending Movies</a>
          <a href="/#new-releases" className="hover:text-gold transition">New Releases</a>
          <a href="/#web-series" className="hover:text-gold transition">Web Series</a>
          <Link to="/search" className="hover:text-gold transition">Live Search</Link>
          <Link to="/watchlist" className="hover:text-gold transition">Watchlist</Link>
        </div>

        {/* TMDB Attribution Disclaimer */}
        <div className="mx-auto max-w-xl rounded-lg border border-dark-line/60 bg-dark-900/60 p-3 mb-6">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            This product uses the TMDB API but is not endorsed or certified by TMDB. All movie posters, artwork, and meta information are property of their respective copyright owners.
          </p>
        </div>

        <small className="text-xs text-gray-600 block">
          © {new Date().getFullYear()} StreamScout. Built with React &amp; Tailwind CSS. All rights reserved.
        </small>
      </div>
    </footer>
  );
};

export default Footer;
