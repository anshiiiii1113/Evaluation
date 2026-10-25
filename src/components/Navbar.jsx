import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bookmark, Compass, X, Star, Loader2, Film, LogOut, ChevronDown } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { searchMulti, getDetailsPath, getImageUrl, getReleaseYear, getTitle } from '../services/tmdb';

const Navbar = ({ onOpenSignIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { watchlistCount } = useWatchlist();
  const { user, signOut } = useAuth();
  const [navSearch, setNavSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Live search dropdown state
  const [dropdownResults, setDropdownResults] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const lastQueryRef = useRef('');

  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileContainerRef = useRef(null);

  const displayName =
    user?.user_metadata?.full_name?.trim() || user?.email?.split('@')[0] || 'Account';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const submitSearch = () => {
    const trimmed = navSearch.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setIsDropdownOpen(false);
      setIsSearchOpen(false);
      setNavSearch('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    submitSearch();
  };

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error('Log out error:', err?.message || err);
    }
  };

  // 300ms debounced live search, skips duplicate/empty queries
  useEffect(() => {
    let cancelled = false;
    const trimmed = navSearch.trim();

    if (!trimmed) {
      setDropdownResults([]);
      setDropdownLoading(false);
      setDropdownError(false);
      setIsDropdownOpen(false);
      lastQueryRef.current = '';
      return;
    }

    setIsDropdownOpen(true);

    const handler = setTimeout(() => {
      if (trimmed === lastQueryRef.current) return; // avoid duplicate requests
      lastQueryRef.current = trimmed;
      setDropdownLoading(true);
      setDropdownError(false);

      searchMulti(trimmed)
        .then((data) => {
          if (cancelled) return;
          setDropdownResults((data || []).slice(0, 8));
          setDropdownLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('Navbar search error:', err);
          setDropdownError(true);
          setDropdownResults([]);
          setDropdownLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [navSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleClearSearch = () => {
    setNavSearch('');
    setDropdownResults([]);
    setDropdownError(false);
    setIsDropdownOpen(false);
  };

  const handleResultClick = (item) => {
    const path = getDetailsPath(item);
    if (path !== '/') navigate(path);
    setNavSearch('');
    setDropdownResults([]);
    setIsDropdownOpen(false);
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-[#252b3a]/70">
      {/* Main Top Navigation */}
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            {/* Reel / Scout Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-800 border border-dark-line group-hover:border-gold transition-colors">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#e5a23c" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="1.5" fill="#e5a23c" />
                <circle cx="12" cy="6.5" r="1.3" fill="#e5a23c" />
                <circle cx="17" cy="10.2" r="1.3" fill="#e5a23c" />
                <circle cx="15.2" cy="16.5" r="1.3" fill="#e5a23c" />
                <circle cx="8.8" cy="16.5" r="1.3" fill="#e5a23c" />
                <circle cx="7" cy="10.2" r="1.3" fill="#e5a23c" />
              </svg>
            </div>
            <span className="font-display text-2xl sm:text-3xl tracking-wider text-white">
              STREAM<span className="text-gold">SCOUT</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              to="/"
              className={`transition hover:text-gold ${
                location.pathname === '/' ? 'text-gold' : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <a
              href="/#trending"
              className="text-gray-300 transition hover:text-gold"
            >
              Trending
            </a>
            <a
              href="/#new-releases"
              className="text-gray-300 transition hover:text-gold"
            >
              Movies
            </a>
            <a
              href="/#web-series"
              className="text-gray-300 transition hover:text-gold"
            >
              Web Series
            </a>
            <Link
              to="/watchlist"
              className={`flex items-center gap-1.5 transition hover:text-gold ${
                location.pathname === '/watchlist' ? 'text-gold' : 'text-gray-300'
              }`}
            >
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <span className="rounded-full bg-gold px-1.5 py-0.2 text-[10px] font-extrabold text-black">
                  {watchlistCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Right: Search + Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Search Form with Live Dropdown */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden sm:block w-48 md:w-64"
            ref={searchContainerRef}
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              onFocus={() => {
                if (navSearch.trim()) setIsDropdownOpen(true);
              }}
              placeholder="Search movies & shows..."
              autoComplete="off"
              className="w-full rounded-full border border-dark-line bg-dark-800 py-2 pl-9 pr-8 text-xs text-white placeholder-gray-500 transition focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {navSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Live Search Dropdown */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[28rem] overflow-y-auto rounded-xl border border-dark-line bg-[#0c0c0f] shadow-2xl shadow-black/60 z-50">
                {dropdownLoading && (
                  <div className="flex items-center justify-center gap-2 py-6 text-xs text-textMuted">
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    Searching...
                  </div>
                )}

                {!dropdownLoading && dropdownError && (
                  <div className="flex flex-col items-center justify-center gap-1 px-4 py-6 text-center">
                    <p className="text-xs font-semibold text-red-400">Something went wrong</p>
                    <p className="text-[11px] text-textMuted">Couldn't reach TMDB. Try again.</p>
                  </div>
                )}

                {!dropdownLoading && !dropdownError && dropdownResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-1 px-4 py-6 text-center">
                    <Film className="h-5 w-5 text-gray-500 mb-1" />
                    <p className="text-xs text-textMuted">No matches for "{navSearch}"</p>
                  </div>
                )}

                {!dropdownLoading && !dropdownError && dropdownResults.length > 0 && (
                  <ul className="py-1.5">
                    {dropdownResults.map((item) => (
                      <li key={`${item.media_type || 'unknown'}:${item.id}`}>
                        <button
                          type="button"
                          onClick={() => handleResultClick(item)}
                          className="group flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-gold/10"
                        >
                          <img
                            src={getImageUrl(item.poster_path, 'w92')}
                            alt={getTitle(item)}
                            loading="lazy"
                            className="h-14 w-10 flex-shrink-0 rounded-md border border-dark-line object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white transition-colors group-hover:text-gold">
                              {getTitle(item)}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-textMuted">
                              <span>{getReleaseYear(item)}</span>
                              <span className="flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 fill-gold text-gold" />
                                {item.vote_average ? item.vote_average.toFixed(1) : 'NR'}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                              item.media_type === 'tv'
                                ? 'bg-gold/90 text-black'
                                : 'border border-dark-line bg-dark-700 text-gray-300'
                            }`}
                          >
                            {item.media_type === 'tv' ? 'TV' : 'Movie'}
                          </span>
                        </button>
                      </li>
                    ))}

                    <li className="mt-1 border-t border-dark-line pt-1">
                      <button
                        type="button"
                        onClick={submitSearch}
                        className="w-full px-3 py-2 text-center text-[11px] font-semibold text-gold transition hover:bg-gold/10"
                      >
                        View all results for "{navSearch}"
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </form>

          {/* Mobile Search Icon Toggle */}
          <button
            onClick={() => navigate('/search')}
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-dark-line bg-dark-800 text-gray-300 hover:text-gold hover:border-gold"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Dedicated Search button from StreamScout design */}
          <button
            onClick={() => navigate('/search')}
            className="hidden lg:flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-black transition hover:bg-gold-amber hover:shadow-md"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>

          {/* Watchlist Quick Button for Mobile */}
          <Link
            to="/watchlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-dark-line bg-dark-800 text-gray-300 hover:border-gold hover:text-gold transition md:hidden"
            aria-label="Watchlist"
          >
            <Bookmark className="h-4 w-4" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-black text-black">
                {watchlistCount}
              </span>
            )}
          </Link>

          {/* Sign In Button / Profile Menu */}
          {user ? (
            <div className="relative" ref={profileContainerRef}>
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-dark-line bg-dark-800 py-1.5 pl-1.5 pr-3 text-xs font-bold text-gray-200 transition hover:border-gold hover:text-gold"
                aria-label="Account menu"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-[11px] font-black text-black">
                  {avatarInitial}
                </span>
                <span className="hidden sm:inline max-w-[8rem] truncate">{displayName}</span>
                <ChevronDown className="hidden sm:inline h-3.5 w-3.5" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-dark-line bg-[#0c0c0f] shadow-2xl shadow-black/60 z-50">
                  <div className="border-b border-dark-line px-4 py-3">
                    <p className="truncate text-xs font-semibold text-white">{displayName}</p>
                    <p className="truncate text-[11px] text-textMuted">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-gray-300 transition hover:bg-gold/10 hover:text-gold"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenSignIn('login')}
                className="rounded-lg border border-gold/60 px-4 py-2 text-xs font-bold text-gold transition hover:bg-gold hover:text-black hover:border-gold"
              >
                Login
              </button>
              <button
                onClick={() => onOpenSignIn('signup')}
                className="hidden sm:block rounded-lg bg-gold px-4 py-2 text-xs font-bold text-black transition hover:bg-gold-amber"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
