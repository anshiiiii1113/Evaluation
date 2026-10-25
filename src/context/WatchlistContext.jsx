import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext();

const GUEST_STORAGE_KEY = 'streamscout_watchlist_guest';

// Each signed-in user gets their own persisted list; signed-out visitors
// fall back to a shared "guest" list on this device.
const storageKeyFor = (userId) =>
  userId ? `streamscout_watchlist_${userId}` : GUEST_STORAGE_KEY;

const loadWatchlist = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to parse watchlist from localStorage', e);
    return [];
  }
};

export const WATCHLIST_ACTIONS = {
  ADD_TO_WATCHLIST: 'ADD_TO_WATCHLIST',
  REMOVE_FROM_WATCHLIST: 'REMOVE_FROM_WATCHLIST',
  CLEAR_WATCHLIST: 'CLEAR_WATCHLIST',
  LOAD_WATCHLIST: 'LOAD_WATCHLIST',
};

function watchlistReducer(state, action) {
  switch (action.type) {
    case WATCHLIST_ACTIONS.ADD_TO_WATCHLIST: {
      const movie = action.payload;
      if (!movie || !movie.id) return state;
      // Prevent duplicate entries
      if (state.some((item) => item.id === movie.id)) return state;
      return [movie, ...state];
    }
    case WATCHLIST_ACTIONS.REMOVE_FROM_WATCHLIST: {
      const id = action.payload;
      return state.filter((item) => item.id !== id);
    }
    case WATCHLIST_ACTIONS.CLEAR_WATCHLIST: {
      return [];
    }
    case WATCHLIST_ACTIONS.LOAD_WATCHLIST: {
      return action.payload || [];
    }
    default:
      return state;
  }
}

export const WatchlistProvider = ({ children }) => {
  // AuthProvider must be an ancestor of WatchlistProvider for this to work.
  const { user } = useAuth();

  // Restore automatically from localStorage on load (lazy initializer runs once,
  // using whatever storage key applies before auth has resolved).
  const [watchlist, dispatch] = useReducer(
    watchlistReducer,
    undefined,
    () => loadWatchlist(storageKeyFor(user?.id))
  );

  const activeStorageKey = useRef(storageKeyFor(user?.id));

  // Latest watchlist snapshot for callbacks that need to read current state
  // (e.g. toggleWatchlist) without depending on `watchlist`, which keeps
  // those callback identities stable across watchlist updates.
  const watchlistRef = useRef(watchlist);
  useEffect(() => {
    watchlistRef.current = watchlist;
  }, [watchlist]);

  // When the signed-in user changes (login, logout, or switching accounts),
  // swap to that user's own list instead of continuing to read/write the
  // previous one.
  useEffect(() => {
    const nextKey = storageKeyFor(user?.id);
    if (nextKey === activeStorageKey.current) return;
    activeStorageKey.current = nextKey;
    dispatch({ type: WATCHLIST_ACTIONS.LOAD_WATCHLIST, payload: loadWatchlist(nextKey) });
  }, [user?.id]);

  // Persist state using localStorage on every change, under the currently
  // active key.
  useEffect(() => {
    try {
      localStorage.setItem(activeStorageKey.current, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const addToWatchlist = useCallback((movie) => {
    if (!movie || !movie.id) return;
    dispatch({ type: WATCHLIST_ACTIONS.ADD_TO_WATCHLIST, payload: movie });
  }, []);

  const removeFromWatchlist = useCallback((id) => {
    dispatch({ type: WATCHLIST_ACTIONS.REMOVE_FROM_WATCHLIST, payload: id });
  }, []);

  const clearWatchlist = useCallback(() => {
    dispatch({ type: WATCHLIST_ACTIONS.CLEAR_WATCHLIST });
  }, []);

  const toggleWatchlist = useCallback((movie) => {
    if (!movie || !movie.id) return;
    const alreadyIn = watchlistRef.current.some((item) => item.id === movie.id);
    if (alreadyIn) {
      dispatch({ type: WATCHLIST_ACTIONS.REMOVE_FROM_WATCHLIST, payload: movie.id });
    } else {
      dispatch({ type: WATCHLIST_ACTIONS.ADD_TO_WATCHLIST, payload: movie });
    }
  }, []);

  const inWatchlist = useCallback(
    (id) => watchlist.some((item) => item.id === id),
    [watchlist]
  );

  const watchlistCount = watchlist.length;

  // Memoize the context value so consumers that only care about stable
  // handlers (not the list itself) don't re-render on every watchlist change.
  const value = useMemo(
    () => ({
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      clearWatchlist,
      toggleWatchlist,
      inWatchlist,
      watchlistCount,
    }),
    [watchlist, addToWatchlist, removeFromWatchlist, clearWatchlist, toggleWatchlist, inWatchlist, watchlistCount]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
