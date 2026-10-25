# StreamScout

StreamScout is a React/Vite movie and TV discovery website. TMDB supplies real title, season, episode, poster, synopsis, and rating metadata. The app includes search, detail pages, a browser-local watchlist, local demo profiles, and Continue Watching progress.

## Run the project

Requirements: Node.js 20.19+ or 22.12+ (required by Vite 8) and npm.

```bash
npm install --legacy-peer-deps
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`). The legacy-peer-deps flag is retained because the original project has a Vite / React-plugin peer-version mismatch. See `TEAMMATE_GUIDE.md` for details and an explanation of the main components.

To create a production build:

```bash
npm run build
```

## TMDB configuration

The project currently uses an existing fallback TMDB key in `src/services/tmdb.js`, so a `.env` file is not required just to launch the demo. You may optionally create a `.env` file and set your own key:

```env
VITE_TMDB_API_KEY=your-tmdb-api-key
```

Anything prefixed with `VITE_` is bundled into browser-side code and must not be treated as a private secret. Never put passwords or privileged service keys in this file.

## Local demo accounts and data

Login / Sign Up is a **local-only demonstration**, not secure production authentication. Demo profile records and the active login session are stored in this browser. Passwords are stored as salted PBKDF2 hashes, not plaintext, but browser-side data can still be inspected, altered, or deleted. Accounts and saved data do not sync to other devices.

Watchlists and progress are stored in separate localStorage keys per demo user ID. Clearing browser site data deletes these local records. Use fake/demo credentials only.

## Season and episode behavior

TV series details use TMDB's actual season list. Episodes are fetched for the selected season using the series ID and season number, so Specials (season 0) and regular seasons remain separate. Continue Watching identifies the next aired unwatched episode from TMDB's season and episode records; StreamScout does not stream video, so movie progress is manually tracked rather than a real playback timestamp.
