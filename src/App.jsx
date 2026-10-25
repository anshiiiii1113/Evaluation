import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GoldBar from './components/GoldBar';
import Footer from './components/Footer';
import SignInModal from './components/SignInModal';


const Home = lazy(() => import('./pages/Home'));
const MovieDetails = lazy(() => import('./components/MovieDetails'));
const TVDetails = lazy(() => import('./components/TVDetails'));
const SearchPage = lazy(() => import('./components/SearchPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));


const PageSkeleton = () => (
  <div className="min-h-screen bg-[#080808] px-4 sm:px-8 md:px-12 py-10 animate-pulse">
    <div className="h-8 w-48 rounded-md bg-white/5 mb-8" />
    <div className="h-64 w-full rounded-2xl bg-white/5 mb-10" />
    <div className="space-y-6">
      <div className="h-5 w-40 rounded bg-white/5" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 w-28 shrink-0 rounded-lg bg-white/5" />
        ))}
      </div>
      <div className="h-5 w-40 rounded bg-white/5" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 w-28 shrink-0 rounded-lg bg-white/5" />
        ))}
      </div>
    </div>
  </div>
);

function App() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const openAuth = (mode = 'login') => {
    setAuthMode(mode === 'signup' ? 'signup' : 'login');
    setIsSignInOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#080808] text-white">
      {/* Top Navbar */}
      <Navbar onOpenSignIn={openAuth} />

      {/* Gold Menu Ribbon & Live Ticker */}
      <GoldBar onOpenSignIn={openAuth} />

      {/* Main Routed Content */}
      <div className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TVDetails />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            {/* Catch-all to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </div>

      {/* Footer */}
      <Footer />

      {/* Sign In Popup Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        initialMode={authMode}
        onClose={() => setIsSignInOpen(false)}
      />
    </div>
  );
}

export default App;
