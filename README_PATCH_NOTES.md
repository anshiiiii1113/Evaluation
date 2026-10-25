# StreamScout implementation notes

## Existing media-routing and discovery behavior retained

- Navbar live-search results route according to TMDB `media_type` rather than always opening a movie page.
- Hero carousel buttons open the correct movie or TV page.
- Watchlist items preserve media type for navigation.
- Mixed-media list keys include media type and TMDB ID.
- Search requests ignore stale responses so older results do not overwrite newer queries.
- Similar/recommended results are tagged with the correct media type.

## Local demo account and progress change

- Replaced Supabase authentication with browser-local demo accounts in `src/services/demoAuth.js`, exposed to React through `src/context/AuthContext.jsx`.
- Replaced Supabase watch-progress queries with browser-local per-user records in `src/services/progress.js`.
- Kept the existing localStorage-based WatchlistContext.
- Removed the Supabase client, Supabase dependency, and database migration requirement.
- Added `TEAMMATE_GUIDE.md` to explain the main architecture and feature behavior.

## Important limitations

Local demo login is for classroom demonstration only; it is not server-side secure authentication and does not sync between devices. Watch progress is manually maintained because StreamScout has no video player. TMDB data still comes from the real TMDB API.


## Trailer playback and selected-season isolation update

- Added `src/components/TrailerPlayer.jsx`, shared by movie and TV pages. It validates the YouTube video ID, passes the current origin/referrer policy to the iframe, and always offers an `Open on YouTube` link. If no valid TMDB YouTube key exists, it offers a title-specific YouTube search instead of a dead player.
- `src/services/tmdb.js` now uses one video-selection helper for movies and TV and exports a pure `normalizeSeasonResponse` helper. Season responses must match the requested season number; episode records with missing/mismatched season metadata are excluded and accepted episodes are sorted by TMDB episode number.
- `src/components/TVDetails.jsx` deduplicates season metadata and renders episodes only when the loaded response season matches the selected season. Changing the season clears the previous episode list immediately.
- The homepage hero's `Watch Trailer` button opens the detail page and scrolls to the trailer section once content is loaded.
- Validation: 23 JS/JSX files passed syntax parsing; relative imports resolved; 9 pure helper assertions passed (mixed-season filtering, mismatch rejection, Specials, YouTube ID parsing, and trailer choice). A production build was not run because dependencies were unavailable offline.
