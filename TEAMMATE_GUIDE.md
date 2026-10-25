# StreamScout — teammate handoff guide

This guide is intended to help everyone in the group explain the project rather than memorise code written by someone else.

## 30-second project explanation

StreamScout is a React single-page app for discovering real films and TV series. It calls TMDB for actual media metadata. React components render the pages, contexts share login/watchlist/progress state, React Router handles paths, and localStorage keeps the demo user's settings on the same browser.

## Main files

- `src/App.jsx` — top-level layout, routes, and Login / Sign Up modal.
- `src/context/AuthContext.jsx` — shares login/session state with the rest of React.
- `src/services/demoAuth.js` — local demo account creation, password hashing, login, session restore, and logout.
- `src/context/WatchlistContext.jsx` — add/remove watchlist state and persistence.
- `src/context/ProgressContext.jsx` — shared API used by screens to save movie progress and mark TV episodes watched.
- `src/services/progress.js` — localStorage reads/writes for movie and episode progress, scoped by demo user ID.
- `src/services/tmdb.js` — calls TMDB for real content and contains season-specific episode fetching / next episode selection.
- `src/components/TVDetails.jsx` — TV page, season selector, episode list, and watched toggles.
- `src/components/MovieProgressPanel.jsx` — the manual progress controls for a movie.
- `src/components/ContinueWatching.jsx` — derives unfinished movies and the next unwatched episode to display on the home page.
- `src/components/SignInModal.jsx` — Login / Sign Up user interface.

## What happens when someone signs up?

1. The modal validates the name, email, and minimum password length.
2. `AuthContext.jsx` checks if the email already exists in this browser.
3. It generates a random salt and derives a PBKDF2/SHA-256 password hash through the browser Web Crypto API. The plaintext password is not saved.
4. The account record is saved under `streamscout_demo_accounts_v1`; the active demo session stores the new account's ID under `streamscout_demo_session_v1`.
5. The same stable user ID is used to select that account's watchlist and progress storage keys.

**Security limitation:** this is a college-project demo mechanism, not server-side authentication. Anyone with access to browser storage can change local records, and there is no real account verification or cross-device session. Use fake credentials only. A production app should use a trusted authentication backend.

## How the watchlist and Continue Watching work

- Watchlist data is stored under `streamscout_watchlist_<user-id>`.
- Progress is stored under `streamscout_progress_<user-id>`.
- Each movie uses one progress record with a manually chosen percentage. There is no video player, so the app must not claim this is a real playback position.
- Each watched TV episode has its own record including TMDB series ID, season number, and episode number.
- The Continue Watching row excludes completed movies. For TV, it checks the show's real TMDB seasons and episode records, excludes Specials from next-episode progression, ignores episodes that have not aired, and finds the first aired episode not marked watched.

## How season separation works

1. TMDB returns the show's season records in the TV detail response.
2. The selector keeps each season's actual number and name, including season 0 / Specials when provided.
3. `fetchSeasonDetails(seriesId, seasonNumber)` calls `/tv/{seriesId}/season/{seasonNumber}`.
4. The screen clears old season data while loading, checks the response's `season_number` against the selection, filters out episode records without matching season metadata, sorts by the real episode number, and renders only when the loaded season matches the selector. Failed loads have an error state and Retry action.

## Trailer behavior

- `src/services/tmdb.js` chooses a usable YouTube video from the TMDB video list and validates the video key.
- Movie and TV detail pages share `src/components/TrailerPlayer.jsx`. It embeds the selected video with an explicit referrer policy and site origin, and always shows an `Open on YouTube` fallback because some uploads do not allow embedding.
- If TMDB has no valid YouTube key, StreamScout links to a YouTube search for the title instead of displaying a broken empty player.
- The homepage hero's `Watch Trailer` action opens the details page at the trailer section.

## Manual test checklist

- Create a demo profile with a fake email and a password of at least 8 characters.
- Refresh the page: the current demo session should return.
- Log out, create a second profile, and confirm it does not show the first profile's watchlist/progress.
- Add and remove a title from the watchlist; refresh and check persistence.
- Mark a movie at 30%, save, refresh, and confirm it appears under Continue Watching. Mark complete and confirm it disappears.
- Open a TV series, select two different seasons, and confirm the episodes change rather than merge. Verify Specials are a separate option when TMDB provides them.
- Mark a regular-season episode watched and confirm Continue Watching advances to the next aired, unwatched episode.
- Run `npm run build` before submission.

## Short presentation talking points

- **React:** reusable components and state-driven interface.
- **React Router:** navigation between home, movie, TV, search, and watchlist pages.
- **TMDB API:** real content instead of placeholder titles.
- **Context API:** makes login, watchlist, and progress state available across components.
- **localStorage:** preserves demo data across refreshes in the same browser without a backend setup.
- **Trade-off:** easier offline/local presentation setup, but no real secure authentication or cross-device sync.
