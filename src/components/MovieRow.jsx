import React, { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { getMediaType } from '../services/tmdb';

const MovieRow = ({ title, eyebrow = 'StreamScout Rail', movies = [], loading = false }) => {
  const rowRef = useRef(null);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: false
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // --- Mouse drag-to-scroll (desktop) ---
  const onMouseDown = useCallback((e) => {
    if (!rowRef.current) return;
    dragState.current.isDown = true;
    dragState.current.moved = false;
    dragState.current.startX = e.pageX - rowRef.current.offsetLeft;
    dragState.current.scrollLeft = rowRef.current.scrollLeft;
    setIsDragging(true);
  }, []);

  const endDrag = useCallback(() => {
    if (!dragState.current.isDown) return;
    dragState.current.isDown = false;
    setIsDragging(false);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragState.current.isDown || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 5) dragState.current.moved = true;
    rowRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  }, []);

  // Prevent the click-through-to-navigate when the interaction was actually a drag
  const onClickCapture = useCallback((e) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <section className="mb-10 sm:mb-12 relative group/row">
      {/* Rail Header */}
      <div className="flex items-end justify-between px-4 sm:px-8 md:px-12 mb-3">
        <div>
          {eyebrow && (
            <p className="text-gold text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-1">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide">
            {title}
          </h2>
        </div>

        {/* Scroll Navigation Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-dark-line bg-dark-800 text-gray-400 hover:border-gold hover:text-gold hover:bg-dark-700 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-dark-line bg-dark-800 text-gray-400 hover:border-gold hover:text-gold hover:bg-dark-700 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filmstrip Top Line */}
      <div className="filmstrip mx-4 sm:mx-8 md:mx-12 mb-4 rounded-sm" />

      {/* Horizontal Carousel Track */}
      <div className="relative">
        {/* Left Arrow Hover Overlay */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-0 bottom-6 z-20 hidden md:flex items-center justify-center w-12 bg-gradient-to-r from-dark-900/90 to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:text-gold"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-8 w-8 drop-shadow-md" />
        </button>

        {/* Movie Cards Container */}
        <div
          ref={rowRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onClickCapture={onClickCapture}
          className={`flex items-start gap-3 sm:gap-4 md:gap-5 overflow-x-auto px-4 sm:px-8 md:px-12 pb-4 pt-1 no-scrollbar snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] ${
            isDragging ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab scroll-smooth'
          }`}
        >
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[42vw] xs:w-[38vw] sm:w-[220px] md:w-[200px] lg:w-[180px] xl:w-[190px] flex-shrink-0 animate-pulse snap-start"
                >
                  <div className="aspect-[2/3] w-full rounded-xl bg-dark-700 border border-dark-line" />
                  <div className="mt-2.5 h-4 w-3/4 rounded bg-dark-700" />
                  <div className="mt-1.5 h-3 w-1/3 rounded bg-dark-700" />
                </div>
              ))
            : movies.map((movie, index) => (
                <MovieCard key={`${getMediaType(movie, 'movie')}:${movie.id || index}`} movie={movie} index={index} />
              ))}
        </div>

        {/* Right Arrow Hover Overlay */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-0 bottom-6 z-20 hidden md:flex items-center justify-center w-12 bg-gradient-to-l from-dark-900/90 to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:text-gold"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-8 w-8 drop-shadow-md" />
        </button>
      </div>
    </section>
  );
};

export default MovieRow;
