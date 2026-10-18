import React, { useState, useEffect } from 'react';
import { Users, Star, Play, Flame, Film, Tv, Sparkles, ExternalLink } from 'lucide-react';

export default function TrendingCard({
  item,
  onWatchTogether,
  onWatchTrailer,
  onInspectJustWatch,
}) {
  const initialPoster = item.poster || item.fallbackPoster || item.thumbnailUrl;
  const [imgSrc, setImgSrc] = useState(initialPoster);
  const [hasFallenBack, setHasFallenBack] = useState(false);

  useEffect(() => {
    setImgSrc(item.poster || item.fallbackPoster || item.thumbnailUrl);
    setHasFallenBack(false);
  }, [item.poster, item.fallbackPoster, item.thumbnailUrl]);

  const handleImgError = () => {
    if (!hasFallenBack && item.fallbackPoster && item.fallbackPoster !== imgSrc) {
      setImgSrc(item.fallbackPoster);
      setHasFallenBack(true);
    } else if (imgSrc !== 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg') {
      setImgSrc('https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg');
    }
  };

  const getCategoryBadge = () => {
    if (item.category === 'anime' || item.type?.toLowerCase().includes('anime')) {
      return {
        label: 'Anime',
        style: 'bg-purple-950/90 text-purple-300 border-purple-500/50',
      };
    }
    if (item.category === 'series' || item.type?.toLowerCase().includes('series') || item.type?.toLowerCase().includes('tv')) {
      return {
        label: 'TV Series',
        style: 'bg-blue-950/90 text-blue-300 border-blue-500/50',
      };
    }
    return {
      label: 'Movie',
      style: 'bg-red-950/90 text-red-300 border-red-500/50',
    };
  };

  const categoryBadge = getCategoryBadge();

  const movieData = {
    id: item.id || `imdb-${item.imdbId}`,
    imdbId: item.imdbId,
    title: item.title,
    year: item.year,
    thumbnailUrl: imgSrc,
    poster: imgSrc,
    videoUrl: item.videoUrl || item.trailerUrl || 'https://vjs.zencdn.net/v/oceans.mp4',
    trailerUrl: item.trailerUrl || item.videoUrl || 'https://vjs.zencdn.net/v/oceans.mp4',
    genre: item.genre,
    duration: item.duration || 'Trailer HD',
    description: item.description,
    rating: item.rating,
    actors: item.actors,
  };

  const handlePlayClip = (e) => {
    e.stopPropagation();
    if (onWatchTrailer) {
      onWatchTrailer(movieData);
    } else if (onWatchTogether) {
      onWatchTogether(movieData);
    }
  };

  const handleLaunchSpace = (e) => {
    e.stopPropagation();
    if (onWatchTogether) {
      onWatchTogether(movieData);
    }
  };

  return (
    <div className="group relative bg-zinc-900/90 rounded-xl overflow-hidden border border-zinc-800 hover:border-red-600/70 shadow-xl hover:shadow-red-600/15 transition-all duration-300 flex flex-col justify-between">
      {/* Poster Media Box (Tappable on mobile & desktop) */}
      <div
        onClick={handlePlayClip}
        className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950 cursor-pointer"
        title="Tap to watch trailer or clip"
      >
        <img
          src={imgSrc || 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg'}
          alt={item.title}
          referrerPolicy="no-referrer"
          onError={handleImgError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none brightness-95 contrast-105 group-hover:brightness-105 transition-all select-none"
          loading="lazy"
        />

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/25 to-transparent opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-70 pointer-events-none" />

        {/* Hover Trailer Overlay Button */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 z-15 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/50 transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
          <span className="text-xs font-black tracking-wide text-white uppercase bg-zinc-950/90 px-3 py-1 rounded-full border border-red-500/40 shadow-lg">
            Watch Clip / Trailer
          </span>
        </div>

        {/* Top Badges: Category & Rank */}
        <div className="absolute top-2 inset-x-2 sm:top-2.5 sm:inset-x-2.5 flex items-center justify-between gap-1 z-10 pointer-events-none">
          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border shadow-sm ${categoryBadge.style}`}>
            {categoryBadge.label}
          </span>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {item.rank && (
              <span className="px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black font-mono bg-amber-500 text-black shadow-md flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-black" />
                #{item.rank}
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-black/85 text-amber-300 border border-amber-500/40 flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              {item.rating || '8.5'}
            </span>
          </div>
        </div>

        {/* Bottom Poster Info Overlay */}
        <div className="absolute bottom-2 inset-x-2 sm:bottom-2.5 sm:inset-x-2.5 z-10 pointer-events-none">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-300 font-semibold mb-1">
            <span className="bg-zinc-900/90 px-1.5 py-0.2 rounded border border-zinc-700/60 font-mono text-[9px] sm:text-[10px]">
              {item.year || 2024}
            </span>
            <span className="text-zinc-400 text-[9px] sm:text-[10px] bg-black/60 px-1.5 py-0.2 rounded">
              {item.duration || 'Trailer'}
            </span>
          </div>
          <h3 className="font-black text-xs sm:text-sm text-white drop-shadow-md line-clamp-1 group-hover:text-red-400 transition-colors">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between bg-zinc-900/95">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-red-400 truncate mb-1">
            {item.genre || 'Cinema'}
          </p>

          <p className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-2 sm:mb-2.5">
            {item.description}
          </p>

          {item.actors && (
            <p className="text-[9px] sm:text-[10px] text-zinc-500 line-clamp-1 mb-2.5 sm:mb-3">
              <span className="text-zinc-400 font-medium">Cast:</span> {item.actors}
            </p>
          )}
        </div>

        {/* Dual Action Buttons: Watch Trailer & Watch Together */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={handlePlayClip}
            className="flex-1 py-1.5 px-1 sm:px-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-md shadow-red-600/30 transition transform active:scale-95 cursor-pointer"
            title="Watch demo clip or trailer instantly"
          >
            <Play className="w-3 h-3 fill-white shrink-0" />
            <span>Clip</span>
          </button>

          <button
            onClick={handleLaunchSpace}
            className="flex-1 py-1.5 px-1 sm:px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 hover:text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 border border-zinc-700 transition transform active:scale-95 cursor-pointer"
            title="Launch shared synchronized watch room"
          >
            <Users className="w-3 h-3 text-red-400 shrink-0" />
            <span>Party</span>
          </button>

          {onInspectJustWatch && (
            <button
              onClick={() => onInspectJustWatch(item)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition cursor-pointer shrink-0"
              title="Inspect JustWatch streaming options"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
