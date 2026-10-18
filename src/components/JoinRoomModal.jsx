import React, { useState } from 'react';
import { X, LogIn, Users, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function JoinRoomModal({
  isOpen,
  onClose,
  onJoinSuccess,
}) {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');

    const cleaned = roomIdInput.trim().toUpperCase();
    if (!cleaned) {
      setError('Please enter a room code.');
      return;
    }

    setLoading(true);

    try {
      const data = await api.getRoom(cleaned);
      if (data && data.room) {
        onJoinSuccess(data.room.roomId);
        onClose();
      } else {
        setError('Room not found. Please verify the code.');
      }
    } catch (err) {
      setError(err.message || 'Room not found. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center text-red-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Join a Watch Room</h2>
            <p className="text-xs text-zinc-400">Enter the room code shared by the host.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-950/70 border border-red-800 rounded-lg text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Room Code
            </label>
            <input
              type="text"
              autoFocus
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
              placeholder="e.g. BUNNY-9482"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-3 text-base font-mono uppercase text-center tracking-widest text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition"
            />
          </div>

          <div className="text-[11px] text-zinc-400 text-center">
            Tip: Try the demo room code <span className="font-mono text-red-400 font-bold">BUNNY-9482</span> or <span className="font-mono text-red-400 font-bold">CYBER-4105</span>.
          </div>

          <button
            type="submit"
            disabled={loading || !roomIdInput.trim()}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Connecting...' : 'Enter Watch Space'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
