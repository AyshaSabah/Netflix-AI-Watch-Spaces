import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import WatchRoomPage from './pages/WatchRoomPage';
import DashboardPage from './pages/DashboardPage';
import AuthModal from './components/AuthModal';
import CreateRoomModal from './components/CreateRoomModal';
import JoinRoomModal from './components/JoinRoomModal';
import FreeMovieDbSearchModal from './components/FreeMovieDbSearchModal';
import TrailerModal from './components/TrailerModal';
import MobileBottomNav from './components/MobileBottomNav';
import { api } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'rooms' | 'dashboard' | 'watch'
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isFreeMovieDbSearchOpen, setIsFreeMovieDbSearchOpen] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [selectedMovieForRoom, setSelectedMovieForRoom] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [freeMovieDbInitialQuery, setFreeMovieDbInitialQuery] = useState('');

  // Show a momentary notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Play clip or trailer directly in modal
  const handleWatchTrailer = (movie) => {
    setTrailerMovie(movie);
  };

  // Handle Watch Together action from Movie card or Trending card (frictionless with guest session if not signed in)
  const handleWatchTogether = async (movie) => {
    setMovies((prev) => {
      const exists = prev.some((m) => (m.id || m._id) === (movie.id || movie._id));
      if (exists) return prev;
      return [movie, ...prev];
    });
    setSelectedMovieForRoom(movie);

    if (!currentUser) {
      try {
        const guestRes = await api.loginGuest();
        if (guestRes && guestRes.user) {
          localStorage.setItem('netflix_token', guestRes.token);
          setCurrentUser(guestRes.user);
          showToast(`🍿 Signed in as ${guestRes.user.name}`);
        }
      } catch (e) {
        const fallbackGuest = {
          id: `guest-${Date.now().toString(36)}`,
          name: 'Guest Cinephile',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        };
        setCurrentUser(fallbackGuest);
      }
    }
    setIsCreateRoomOpen(true);
  };

  // Load initial data and restore session
  useEffect(() => {
    async function init() {
      // 1. Fetch movies
      try {
        const movieList = await api.getMovies();
        setMovies(movieList);
      } catch (err) {
        console.error('Failed to load movies:', err);
      }

      // 2. Fetch active rooms
      try {
        const roomList = await api.getRooms();
        setActiveRooms(roomList);
      } catch (err) {
        console.error('Failed to load rooms:', err);
      }

      // 3. Check health & database status
      try {
        const health = await api.getHealth();
        if (health) setDbStatus(health.database);
      } catch (e) {
        // Ignored
      }

      // 4. Restore user session if token exists
      const token = localStorage.getItem('netflix_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res && res.user) {
            setCurrentUser(res.user);
          }
        } catch (e) {
          localStorage.removeItem('netflix_token');
        }
      }

      // 5. Check URL hash for direct room linking e.g. #/room/BUNNY-9482
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/room/')) {
        const roomCode = hash.replace('#/room/', '').trim();
        if (roomCode) {
          setCurrentRoomId(roomCode);
          setCurrentView('watch');
        }
      }
    }

    init();
  }, []);

  // Update hash when switching to watch room
  useEffect(() => {
    if (currentView === 'watch' && currentRoomId) {
      window.location.hash = `#/room/${currentRoomId}`;
    } else if (currentView !== 'watch' && window.location.hash) {
      window.location.hash = '';
    }
  }, [currentView, currentRoomId]);

  // Handle Watch Space launch from Free Movie DB search
  const handleStartWatchSpaceFromSearch = (movie) => {
    handleWatchTogether(movie);
  };

  // Handle Join Room
  const handleJoinRoom = (roomId) => {
    setCurrentRoomId(roomId);
    setCurrentView('watch');
    showToast(`🍿 Joined Watch Space: ${roomId}`);
  };

  // Handle Room Created
  const handleRoomCreated = (room) => {
    setCurrentRoomId(room.roomId);
    setCurrentView('watch');
    setActiveRooms((prev) => [room, ...prev]);
    showToast(`🎉 Watch Space created! Room code: ${room.roomId}`);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('netflix_token');
    setCurrentUser(null);
    showToast('👋 Signed out of Watch Spaces.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-14 sm:top-16 right-3 sm:right-6 left-3 sm:left-auto z-50 bg-red-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xl shadow-red-600/40 animate-fade-in flex items-center justify-between sm:justify-start gap-2">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="sm:hidden text-white/80 hover:text-white text-xs ml-2 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Navbar (hidden in full watch room view for maximum immersion) */}
      {currentView !== 'watch' && (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          user={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onOpenCreateRoom={() => {
            setSelectedMovieForRoom(movies[0] || null);
            if (!currentUser) {
              setIsAuthOpen(true);
            } else {
              setIsCreateRoomOpen(true);
            }
          }}
          onOpenJoinRoom={() => setIsJoinRoomOpen(true)}
          onOpenFreeMovieDbSearch={(query) => {
            setFreeMovieDbInitialQuery(typeof query === 'string' ? query : '');
            setIsFreeMovieDbSearchOpen(true);
          }}
          dbStatus={dbStatus}
        />
      )}

      {/* Pages Container with padding at bottom on mobile to accommodate bottom nav */}
      <main className={`flex-1 ${currentView !== 'watch' ? 'pb-20 md:pb-0' : ''}`}>
        {currentView === 'home' && (
          <HomePage
            movies={movies}
            activeRooms={activeRooms}
            onWatchTogether={handleWatchTogether}
            onWatchTrailer={handleWatchTrailer}
            onJoinRoom={handleJoinRoom}
            onOpenCreateRoom={() => {
              setSelectedMovieForRoom(movies[0] || null);
              if (!currentUser) setIsAuthOpen(true);
              else setIsCreateRoomOpen(true);
            }}
            onOpenFreeMovieDbSearch={(query) => {
              setFreeMovieDbInitialQuery(typeof query === 'string' ? query : '');
              setIsFreeMovieDbSearchOpen(true);
            }}
          />
        )}

        {currentView === 'rooms' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">Active Watch Spaces</h1>
                <p className="text-xs text-zinc-400 mt-0.5 sm:mt-1">
                  Choose a live watch space or create a private room to stream with friends.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedMovieForRoom(movies[0]);
                  if (!currentUser) setIsAuthOpen(true);
                  else setIsCreateRoomOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition cursor-pointer text-center"
              >
                Host New Space
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeRooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => handleJoinRoom(room.roomId)}
                  className="group bg-zinc-900/90 border border-zinc-800 hover:border-red-600/80 rounded-xl overflow-hidden cursor-pointer transition shadow-lg flex flex-col justify-between"
                >
                  <div className="aspect-video relative overflow-hidden bg-black">
                    <img
                      src={room.movieThumbnail || 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg'}
                      alt={room.movieTitle}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-red-950/90 text-red-400 border border-red-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {room.roomId}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-red-400 transition mb-1">
                        {room.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mb-2">
                        Streaming: <span className="text-zinc-200 font-semibold">{room.movieTitle}</span>
                      </p>
                      <p className="text-xs text-zinc-500">
                        Host: {room.hostName}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-400">
                        {room.activeUsersCount || 1} online
                      </span>
                      <button className="px-3 py-1.5 bg-red-600 group-hover:bg-red-700 text-white text-xs font-bold rounded transition">
                        Join Party
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            user={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenCreateRoom={() => {
              setSelectedMovieForRoom(movies[0]);
              setIsCreateRoomOpen(true);
            }}
            onJoinRoom={handleJoinRoom}
            onWatchTogether={handleWatchTogether}
            movies={movies}
          />
        )}

        {currentView === 'watch' && currentRoomId && (
          <WatchRoomPage
            roomId={currentRoomId}
            currentUser={currentUser}
            onLeaveRoom={() => {
              setCurrentView('home');
              setCurrentRoomId(null);
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome, ${user.name}!`);
        }}
      />

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        movies={movies}
        selectedMovie={selectedMovieForRoom}
        currentUser={currentUser}
        onRoomCreated={handleRoomCreated}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <JoinRoomModal
        isOpen={isJoinRoomOpen}
        onClose={() => setIsJoinRoomOpen(false)}
        onJoinSuccess={handleJoinRoom}
      />

      {/* Free Movie DB & IMDb Search Modal */}
      <FreeMovieDbSearchModal
        isOpen={isFreeMovieDbSearchOpen}
        onClose={() => {
          setIsFreeMovieDbSearchOpen(false);
          setFreeMovieDbInitialQuery('');
        }}
        initialQuery={freeMovieDbInitialQuery}
        onStartWatchSpace={handleStartWatchSpaceFromSearch}
      />

      {/* Instant Trailer & Demo Clip Player Modal */}
      <TrailerModal
        movie={trailerMovie}
        isOpen={!!trailerMovie}
        onClose={() => setTrailerMovie(null)}
        onWatchTogether={handleWatchTogether}
      />

      {/* Mobile Bottom Navigation Bar */}
      {currentView !== 'watch' && (
        <MobileBottomNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          activeRoomsCount={activeRooms.length}
          onOpenCreateRoom={() => {
            setSelectedMovieForRoom(movies[0] || null);
            if (!currentUser) setIsAuthOpen(true);
            else setIsCreateRoomOpen(true);
          }}
          onOpenFreeMovieDbSearch={(query) => {
            setFreeMovieDbInitialQuery(typeof query === 'string' ? query : '');
            setIsFreeMovieDbSearchOpen(true);
          }}
        />
      )}
    </div>
  );
}
