import React, { useState, useEffect } from 'react';
import {
  Tv,
  Clock,
  Users,
  Play,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  LogIn,
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage({
  user,
  onOpenAuth,
  onOpenCreateRoom,
  onJoinRoom,
  onWatchTogether,
  movies = [],
}) {
  const [history, setHistory] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        if (user) {
          const userHist = await api.getUserHistory(user.id);
          if (isMounted) setHistory(userHist);
        }
        const activeRooms = await api.getRooms();
        if (isMounted) setRooms(activeRooms);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const formatSeconds = (secs) => {
    if (!secs) return '0m';
    const m = Math.floor(secs / 60);
    return `${m}m`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 mb-4">
          <Tv className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Sign in to View Your Dashboard</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6">
          Track your watched movies, sync history across devices, and manage your custom watch parties.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Demo Login</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-8 space-y-8 sm:space-y-10">
        {/* User Profile Header */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-xl">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-full border-2 border-red-600 object-cover shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{user.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/40">
                  Party Host
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 sm:mt-1">{user.email}</p>
            </div>
          </div>

          {/* Quick Create Room Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenCreateRoom}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Host New Watch Room</span>
            </button>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <span className="text-xs text-zinc-400 block mb-1">Watched Movies</span>
            <span className="text-2xl font-black text-white">{history.length}</span>
          </div>

          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <span className="text-xs text-zinc-400 block mb-1">Active Rooms</span>
            <span className="text-2xl font-black text-red-500">{rooms.length}</span>
          </div>

          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <span className="text-xs text-zinc-400 block mb-1">Available Titles</span>
            <span className="text-2xl font-black text-zinc-200">{movies.length}</span>
          </div>

          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <span className="text-xs text-zinc-400 block mb-1">Real-Time Sync</span>
            <span className="text-2xl font-black text-emerald-400">100%</span>
          </div>
        </div>

        {/* Watch History Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                <span>Recently Watched & Progress</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Saved watch progress from your synced party sessions
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-xl text-center">
              <span className="text-3xl mb-2 block">🎬</span>
              <p className="text-sm font-semibold text-zinc-300">No watch history yet</p>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Join or host a watch space to start streaming with friends.
              </p>
              <button
                onClick={onOpenCreateRoom}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Start Watching Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item, idx) => {
                const percent = Math.min(
                  100,
                  Math.round(((item.progressSeconds || 0) / (item.durationSeconds || 600)) * 100)
                );

                const movieRef = movies.find((m) => (m.id || m._id) === item.movieId);

                return (
                  <div
                    key={item.id || idx}
                    className="group bg-zinc-900/80 border border-zinc-800 hover:border-red-600/60 rounded-xl p-3.5 flex flex-col justify-between transition shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={item.movieThumbnail || 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg'}
                        alt={item.movieTitle}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg';
                        }}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-white truncate">
                          {item.movieTitle}
                        </h4>
                        <p className="text-xs text-red-400 mb-1">{item.movieGenre || 'Movie'}</p>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {formatDate(item.lastWatchedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                        <span>Progress: {percent}%</span>
                        <span>{formatSeconds(item.progressSeconds)} watched</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {movieRef && (
                        <button
                          onClick={() => onWatchTogether(movieRef)}
                          className="w-full py-1.5 bg-zinc-800 hover:bg-red-600 text-zinc-200 hover:text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Resume in Watch Party</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Rooms Created and Active Rooms */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                <span>Active Watch Rooms</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Join an active watch party with other members
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.roomId}
                onClick={() => onJoinRoom(room.roomId)}
                className="group bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600/60 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer transition shadow-md"
              >
                <img
                  src={room.movieThumbnail || 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg'}
                  alt={room.movieTitle}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded">
                      {room.roomId}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Host: {room.hostName}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white truncate group-hover:text-red-400 transition">
                    {room.name}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">{room.movieTitle}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-red-600 flex items-center justify-center text-zinc-300 group-hover:text-white shrink-0 transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
