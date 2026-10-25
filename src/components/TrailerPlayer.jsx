import React from 'react';
import { ExternalLink, Film, Play } from 'lucide-react';
import { getYouTubeVideoId } from '../services/tmdb';

/**
 * A resilient trailer panel. Embedded YouTube videos can be blocked when a
 * video owner disables embedding or a browser strips referrer information,
 * so always provide a direct YouTube fallback instead of a dead player.
 */
const TrailerPlayer = ({ title, trailer }) => {
  const videoId = getYouTubeVideoId(trailer?.key);
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} official trailer`)}`;
  const watchUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : searchUrl;

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-dark-line bg-black shadow-2xl">
      {videoId ? (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&modestbranding=1`}
            title={`${title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 bg-dark-800/70 px-6 py-10 text-center">
          <Film className="h-10 w-10 text-gray-500" />
          <p className="text-sm text-gray-300">TMDB doesn't list an embeddable YouTube trailer for this title.</p>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-black transition hover:bg-gold-amber"
          >
            <Play className="h-4 w-4 fill-black" /> Search YouTube trailers
          </a>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dark-line bg-dark-900 px-4 py-3">
        <span className="text-xs text-textMuted">
          If the embedded player is blocked or unavailable, open the trailer on YouTube.
        </span>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-dark-line px-3 py-2 text-xs font-bold text-gray-200 transition hover:border-gold hover:text-gold"
        >
          Open on YouTube <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};

export default TrailerPlayer;
