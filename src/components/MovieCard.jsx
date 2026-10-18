import React, { useState } from 'react';
import { Play, Users, Clock, Sparkles, Film } from 'lucide-react';

export default function MovieCard({ movie, onWatchTogether, onWatchTrailer, onSelectMovie }) {
  const [imgError, setImgError] = useState(false);

  const handlePlayTrailer = (e) => {
    e?.stopPropagation();
    if (onWatchTrailer) {
      onWatchTrailer(movie);
    } else if (onSelectMovie) {
      onSelectMovie(movie);
    } else {
      onWatchTogether(movie);
    }
  };

  return (
    <div className="group relative bg-zinc-900/90 rounded-xl overflow-hidden border border-zinc-800/80 hover:border-red-600/60 shadow-lg hover:shadow-red-600/10 transition-all duration-200 flex flex-col justify-between">
      {/* Thumbnail Banner */}
      <div
        onClick={handlePlayTrailer}
        className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950 cursor-pointer"
      >
        {!imgError && movie.thumbnailUrl && movie.thumbnailUrl.trim() !== '' ? (
          <img
            src={movie.thumbnailUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full p-4 bg-gradient-to-br from-zinc-900 via-zinc-950 to-red-950/60 flex flex-col items-center justify-center text-center">
            <Film className="w-8 h-8 text-red-500 mb-1" />
            <span className="font-bold text-xs text-white line-clamp-1">{movie.title}</span>
            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{movie.genre}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform group-hover:scale-105 transition">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration / Genre Tags */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white shadow-sm">
            {movie.rating || 'PG-13'}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-900/90 text-zinc-300 backdrop-blur-sm border border-zinc-700/60">
            {movie.releaseYear || 2024}
          </span>
        </div>

        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-950/80 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
          <Clock className="w-3 h-3 text-red-400" />
          {movie.duration}
        </div>

        {/* AI Trivia Badge */}
        {movie.timelineTrivia && movie.timelineTrivia.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded pointer-events-none">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {movie.timelineTrivia.length} Trivia Cues
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-base text-zinc-100 group-hover:text-white line-clamp-1">
              {movie.title}
            </h3>
          </div>

          <p className="text-xs font-medium text-red-400 mb-2">
            {movie.genre}
          </p>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
            {movie.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
          <button
            onClick={handlePlayTrailer}
            className="py-2 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition cursor-pointer"
            title="Watch Clip / Trailer"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span>Clip</span>
          </button>

          <button
            onClick={() => onWatchTogether(movie)}
            className="flex-1 py-2 px-3 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Watch Together</span>
          </button>
        </div>
      </div>
    </div>
  );
}
