import React, { useState } from 'react';
import { X, Users, Film, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';

export default function CreateRoomModal({
  isOpen,
  onClose,
  movies = [],
  selectedMovie = null,
  currentUser,
  onRoomCreated,
  onOpenAuth,
}) {
  const [movieId, setMovieId] = useState(selectedMovie?.id || (movies[0]?.id || ''));
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentSelectedMovie = movies.find((m) => m.id === movieId || m._id === movieId) || movies[0];

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      onClose();
      onOpenAuth();
      return;
    }

    if (!movieId) {
      setError('Please select a movie to watch.');
      return;
    }

    setLoading(true);

    try {
      const room = await api.createRoom({
        movieId,
        roomName: roomName.trim() || `${currentSelectedMovie?.title || 'Movie'} Watch Party 🍿`,
        hostId: currentUser.id,
        hostName: currentUser.name,
      });

      onRoomCreated(room);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create a Watch Space</h2>
            <p className="text-xs text-zinc-400">
              Host a synchronized watch room and share the room code with friends.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/70 border border-red-800 rounded-lg text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Watch Space Name (Optional)
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder={`e.g. ${currentSelectedMovie?.title || 'Bunny'} Night with Friends 🍿`}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
            />
          </div>

          {/* Select Movie Grid */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Select Movie to Stream
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {movies.map((m) => {
                const isSelected = (m.id || m._id) === movieId;
                return (
                  <div
                    key={m.id || m._id}
                    onClick={() => setMovieId(m.id || m._id)}
                    className={`relative rounded-lg p-2 border cursor-pointer transition flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-red-600 bg-red-950/30 ring-1 ring-red-600'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={m.thumbnailUrl || 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg'}
                      alt={m.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg';
                      }}
                      className="w-12 h-12 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{m.title}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{m.genre}</p>
                      <span className="text-[9px] text-zinc-500">{m.duration}</span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features note */}
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Includes in this room:</span>
            </div>
            <p>• Host video playback controls synchronized across all viewers in real-time.</p>
            <p>• Interactive scene timeline trivia cards triggering at key scenes.</p>
            <p>• AI Co-Pilot powered by Gemini to answer movie questions.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>{loading ? 'Creating Watch Space...' : 'Launch Watch Space'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
