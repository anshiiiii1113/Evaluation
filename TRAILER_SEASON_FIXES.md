# Trailer and season-separation fixes

## Trailer behavior

- Movies and TV series use the same helper to select a usable YouTube video from TMDB's `videos` response.
- The iframe now sends an explicit referrer policy and includes the current site origin, which helps avoid YouTube embed configuration errors in browsers that require a referrer.
- Every trailer panel includes an **Open on YouTube** fallback. If TMDB has no valid YouTube key, the panel offers a YouTube search for the title instead of showing a dead or empty player.
- The homepage hero's **Watch Trailer** button now opens the details page at the trailer section rather than merely opening the top of the details page.

## Season behavior

- The UI fetches the selected season through `/tv/{series_id}/season/{season_number}`.
- The response's `season_number` must match the requested season; mismatched responses are treated as errors.
- Episode records must identify the selected season, are sorted by their real TMDB episode numbers, and are tagged with the selected season for progress tracking.
- The episode list is rendered only when its loaded `season_number` matches the currently selected season, preventing stale responses or stale React state from appearing beneath a new season label.
- Season metadata is de-duplicated by season number and sorted. Season 0 remains available when TMDB lists Specials.

## Verify locally

1. Run `npm install --legacy-peer-deps` and `npm run dev`.
2. Open Jujutsu Kaisen, choose Season 1, and note the episode count and first/last episode names.
3. Choose Season 2 and confirm the heading changes to `Showing Season 2`, the episode count changes, and only Season 2 episode records appear. Repeat with Blue Lock and Specials where available.
4. Open a movie and a TV show and check the trailer. If embedding is blocked, click **Open on YouTube**; if TMDB has no valid trailer key, use **Search YouTube trailers**.
5. From the homepage hero, click **Watch Trailer** and confirm the details page scrolls to the trailer section.

TMDB and YouTube are external services, so the exact video availability and playback policy still depend on their live responses and the user's browser/network.
