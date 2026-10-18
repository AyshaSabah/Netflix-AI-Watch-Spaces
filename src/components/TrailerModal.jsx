import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Users,
  Film,
  Sparkles,
  Star,
  Clock,
  Calendar,
  Share2,
} from 'lucide-react';

export default function TrailerModal({
  movie,
  isOpen,
  onClose,
  onWatchTogether,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const DEFAULT_STREAM = 'https://vjs.zencdn.net/v/oceans.mp4';
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [videoSrc, setVideoSrc] = useState(
    movie?.trailerUrl || movie?.videoUrl || DEFAULT_STREAM
  );

  useEffect(() => {
    if (movie) {
      const src = movie.trailerUrl || movie.videoUrl || DEFAULT_STREAM;
      setVideoSrc(src);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [movie]);

  // Autoplay attempt when opened
  useEffect(() => {
    if (isOpen && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with audio was blocked; mute and retry
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          });
      }
    }
  }, [isOpen, videoSrc]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, isMuted, isFullscreen]);

  if (!isOpen || !movie) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const skipTime = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 100, videoRef.current.currentTime + seconds)
    );
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleVideoError = () => {
    if (videoSrc !== DEFAULT_STREAM) {
      setVideoSrc(DEFAULT_STREAM);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const totalSecs = Math.floor(secs);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm shrink-0">
              HD TRAILER CLIP
            </span>
            <h3 className="font-black text-sm sm:text-base text-white truncate">
              {movie.title}
            </h3>
            {movie.year && (
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                ({movie.year})
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            title="Close Trailer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video w-full bg-black group select-none overflow-hidden">
          <video
            ref={videoRef}
            src={videoSrc || DEFAULT_STREAM}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onError={handleVideoError}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
            playsInline
          />

          {/* Center Play Overlay when Paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center cursor-pointer transition-opacity"
            >
              <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 transform hover:scale-110 transition cursor-pointer">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Video Controls */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-6 flex flex-col gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
            {/* Scrubber */}
            <div className="flex items-center gap-2 py-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600 touch-none"
              />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between text-white text-xs gap-1 sm:gap-2">
              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                <button
                  onClick={togglePlay}
                  className="p-1 hover:text-red-400 transition cursor-pointer shrink-0"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                </button>

                <button
                  onClick={() => skipTime(-10)}
                  className="p-1 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => skipTime(10)}
                  className="p-1 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
                  title="Fast Forward 10s"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 ml-0.5 sm:ml-1 shrink-0">
                  <button
                    onClick={toggleMute}
                    className="p-1 text-zinc-300 hover:text-white transition cursor-pointer"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="hidden sm:block w-14 sm:w-20 h-1 bg-zinc-700 rounded cursor-pointer accent-red-600"
                  />
                </div>

                <span className="font-mono text-[10px] sm:text-[11px] text-zinc-400 ml-1 whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={toggleFullscreen}
                  className="p-1 text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Info & Actions Footer */}
        <div className="p-3.5 sm:p-5 bg-zinc-900/95 border-t border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-zinc-800 text-amber-300 border border-zinc-700 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {movie.rating || '8.8'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {movie.genre || 'Action / Drama'}
              </span>
              <span className="text-[11px] sm:text-xs text-zinc-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-400" />
                {movie.duration || 'Trailer HD'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
              {movie.description}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                onClose();
                onWatchTogether(movie);
              }}
              className="flex-1 md:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition transform active:scale-98 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Watch Together with Friends</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer"
              title="Copy Link to Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
