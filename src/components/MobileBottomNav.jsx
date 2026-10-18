import React from 'react';
import { Film, Users, Search, Plus, Tv } from 'lucide-react';

export default function MobileBottomNav({
  currentView,
  setCurrentView,
  activeRoomsCount = 0,
  onOpenCreateRoom,
  onOpenFreeMovieDbSearch,
}) {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/90 px-2 py-1.5 safe-area-pb"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Browse Movies */}
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'home'
              ? 'text-red-500 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Film className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Browse</span>
        </button>

        {/* Active Spaces */}
        <button
          onClick={() => setCurrentView('rooms')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'rooms'
              ? 'text-red-500 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5 mb-0.5" />
            {activeRoomsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full px-1 min-w-[14px] text-center shadow-sm">
                {activeRoomsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Spaces</span>
        </button>

        {/* Quick Host Room (Center Call-to-action) */}
        <button
          onClick={onOpenCreateRoom}
          className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer"
          title="Host New Watch Space"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 ring-2 ring-zinc-950 group-active:scale-95 transition-all">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] text-zinc-300 font-bold mt-0.5">Host</span>
        </button>

        {/* Search Catalog */}
        <button
          onClick={() => onOpenFreeMovieDbSearch()}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 mb-0.5 text-zinc-400" />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

        {/* My List & History */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'dashboard'
              ? 'text-red-500 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Tv className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">My List</span>
        </button>
      </div>
    </nav>
  );
}
