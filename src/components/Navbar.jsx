import React from 'react';
import { Film, Users, Tv, Plus, LogIn, LogOut, Sparkles, Database, Search } from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  user,
  onOpenAuth,
  onLogout,
  onOpenCreateRoom,
  onOpenJoinRoom,
  onOpenFreeMovieDbSearch,
  dbStatus,
}) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-4 md:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 group text-left cursor-pointer shrink-0"
            title="Netflix AI Watch Spaces Home"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-red-600 via-red-700 to-red-950 flex items-center justify-center font-black text-lg sm:text-xl text-white tracking-tighter shadow-lg shadow-red-600/40 ring-1 ring-red-500/50 group-hover:scale-105 transition-all duration-200">
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans font-black tracking-tight select-none">
                N
              </span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/30 via-transparent to-white/20 pointer-events-none" />
            </div>
            <div className="flex items-center">
              <span className="font-black text-base sm:text-lg tracking-wider bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent uppercase drop-shadow-sm select-none">
                NETFLIX
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-red-950/90 via-zinc-900 to-red-950/90 text-red-200 border border-red-500/40 shadow-sm shadow-red-600/20 backdrop-blur-sm group-hover:border-red-400 group-hover:text-white transition-all">
                AI SPACES
              </span>
            </div>
          </button>

          {/* Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'home'
                  ? 'text-white bg-zinc-800/90 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Film className="w-4 h-4 text-red-500" />
              <span>Browse Movies</span>
            </button>

            <button
              onClick={() => setCurrentView('rooms')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'rooms'
                  ? 'text-white bg-zinc-800/90 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4 text-red-500" />
              <span>Active Spaces</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'dashboard'
                  ? 'text-white bg-zinc-800/90 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Tv className="w-4 h-4 text-red-500" />
              <span>My Watchlist & History</span>
            </button>
          </nav>
        </div>

        {/* Search & Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Search Button */}
          <button
            onClick={() => onOpenFreeMovieDbSearch()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-red-500/60 transition text-xs font-medium cursor-pointer shadow-sm group"
            title="Search Movies"
          >
            <Search className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Quick Join Button */}
          <button
            onClick={onOpenJoinRoom}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-red-400" />
            <span>Join Code</span>
          </button>

          {/* Create Watch Room */}
          <button
            onClick={onOpenCreateRoom}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 transition cursor-pointer"
            title="Host New Watch Space"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Create Space</span>
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-zinc-800">
              <div
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-1.5 cursor-pointer group"
                title="View Dashboard"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-red-500/50 object-cover group-hover:ring-2 group-hover:ring-red-500 transition"
                />
                <span className="hidden lg:inline text-xs font-medium text-zinc-200 group-hover:text-white truncate max-w-[90px]">
                  {user.name}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1 sm:p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-md transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/80 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-red-500" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
