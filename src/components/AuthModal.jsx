import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await api.register(name, email, password);
      } else {
        data = await api.login(email, password);
      }

      if (data.token) {
        localStorage.setItem('netflix_token', data.token);
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await api.loginGuest();
      if (data.token) {
        localStorage.setItem('netflix_token', data.token);
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to login as guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-600 rounded-md flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/30">
            N
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isRegister ? 'Create Your Account' : 'Sign In to Watch Spaces'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Watch movies synchronously with friends and AI.
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/70 border border-red-800/80 rounded-lg flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Your Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isRegister ? 'Sign Up' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Guest Button */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo: Login as Guest (1-Click)</span>
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            {isRegister ? (
              <>
                Already have an account? <span className="text-red-500 font-semibold underline ml-1">Sign In</span>
              </>
            ) : (
              <>
                New to Watch Spaces? <span className="text-red-500 font-semibold underline ml-1">Sign Up free</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
