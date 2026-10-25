# StreamScout progress features (local demo version)

## Setup

No Supabase account, database table, migration, or backend credentials are required.

1. Run `npm install --legacy-peer-deps` in the folder that contains `package.json`.
2. Run `npm run dev`.
3. Use a fake/demo email and a password with at least 8 characters to create a local demo account.

## Behavior

- Login / Sign Up uses local demo profiles; passwords are stored as salted PBKDF2 hashes, not plaintext.
- The active account is remembered in this browser.
- Watchlist and progress are saved under different localStorage keys for each demo account.
- Movies have manually tracked progress; StreamScout does not stream video and does not have a real playback position.
- TV progress is episode-specific, using TMDB series ID, season number, and episode number.
- Continue Watching advances to the next aired, unwatched regular-season episode and hides completed movies/shows as applicable.

## Limitations

This local demo-account design is not production authentication. Browser storage can be inspected, modified, or deleted, and data does not sync between devices. Use only demo credentials. A real deployment should use a trusted authentication backend and server-side access controls.
