import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Crown,
  Eye,
  RefreshCw,
  Sparkles,
  Users,
  Settings,
  Tv,
  Film,
  PictureInPicture,
  Loader2,
  Zap,
} from 'lucide-react';
import TimelineTriviaCard from './TimelineTriviaCard';

/**
 * Responsive Video Player Component for React
 * Supports real-time synchronized playback state for multiple users (Host/Viewer sync, anti-drift, live reactions, scrubber cues)
 */
export default function VideoPlayer({
  videoUrl,
  movieTitle = 'Streaming Movie',
  isHost = false,
  hostName = 'Room Host',
  timelineTrivia = [],
  onPlay,
  onPause,
  onSeek,
  onAskAIAboutTrivia,
  remoteSync = null, // { type: 'play'|'pause'|'seek', time, timestamp, senderName }
  floatingReactions = [],
  activeUsers = [],
  currentUser = null,
  onRequestSync = null,
  onSendReaction = null,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const isRemoteActionRef = useRef(false);
  const controlsTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const lastTapRef = useRef({ time: 0, x: 0 });

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);

  // Layout & UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoverScrubberTime, setHoverScrubberTime] = useState(null);
  const [hoverScrubberPos, setHoverScrubberPos] = useState(0);
  const [quickReactionOpen, setQuickReactionOpen] = useState(false);

  // Sync state & notifications
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'drift'
  const [estimatedDrift, setEstimatedDrift] = useState(0);
  const [syncToast, setSyncToast] = useState(null);
  const [doubleTapFeedback, setDoubleTapFeedback] = useState(null); // { side: 'left'|'right', text: '-10s'|'+10s' }

  // Trivia Pop-up state
  const [activeTrivia, setActiveTrivia] = useState(null);
  const [dismissedTriviaTimestamps, setDismissedTriviaTimestamps] = useState(new Set());

  // Safe verified demo stream trailer fallback
  const DEFAULT_DEMO_TRAILER = 'https://vjs.zencdn.net/v/oceans.mp4';
  const [currentVideoSrc, setCurrentVideoSrc] = useState(
    (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.trim() || videoUrl.includes('commondatastorage.googleapis.com'))
      ? DEFAULT_DEMO_TRAILER
      : videoUrl
  );

  useEffect(() => {
    if (videoUrl && typeof videoUrl === 'string' && videoUrl.trim() && !videoUrl.includes('commondatastorage.googleapis.com')) {
      setCurrentVideoSrc(videoUrl);
    } else {
      setCurrentVideoSrc(DEFAULT_DEMO_TRAILER);
    }
  }, [videoUrl]);

  const handleVideoError = () => {
    if (currentVideoSrc !== DEFAULT_DEMO_TRAILER) {
      setCurrentVideoSrc(DEFAULT_DEMO_TRAILER);
      triggerToast('🎬 Switched to verified public demo trailer');
    }
  };

  // Format seconds -> mm:ss or hh:mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const totalSecs = Math.floor(secs);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show temporary toast on player
  const triggerToast = useCallback((message, durationMs = 2800) => {
    setSyncToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setSyncToast(null);
    }, durationMs);
  }, []);

  // --- Real-Time Synchronization Engine ---
  useEffect(() => {
    if (!remoteSync || !videoRef.current) return;

    const video = videoRef.current;
    const { type, time, senderName } = remoteSync;
    if (time === undefined || isNaN(time)) return;

    isRemoteActionRef.current = true;
    setSyncStatus('syncing');

    const drift = Math.abs(video.currentTime - time);
    setEstimatedDrift(Number(drift.toFixed(2)));

    // 1. Hard seek if drift is noticeable (> 1.2s) or on explicit seek command
    if (type === 'seek' || drift > 1.2) {
      video.currentTime = time;
      setCurrentTime(time);
      if (type === 'seek') {
        triggerToast(`⏩ ${senderName || 'Host'} jumped to ${formatTime(time)}`);
      }
    } else if (drift > 0.25 && drift <= 1.2 && type === 'play') {
      // 2. Anti-drift gentle micro-adjustment (soft catch-up without audio pop)
      const adjustedRate = video.currentTime < time ? 1.08 : 0.92;
      video.playbackRate = adjustedRate;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.playbackRate = playbackRate;
        }
      }, 1500);
    }

    // 3. Play / Pause state synchronization
    if (type === 'play') {
      video.play().catch(() => {
        // Handle browser autoplay policy requires user interaction
        triggerToast('⚠️ Click anywhere to enable synchronized audio');
      });
      setIsPlaying(true);
      if (type === 'play' && remoteSync.timestamp) {
        triggerToast(`▶️ ${senderName || 'Host'} started playback`);
      }
    } else if (type === 'pause') {
      video.pause();
      setIsPlaying(false);
      triggerToast(`⏸️ ${senderName || 'Host'} paused playback`);
    }

    setTimeout(() => {
      isRemoteActionRef.current = false;
      setSyncStatus('synced');
    }, 400);
  }, [remoteSync, triggerToast, playbackRate]);

  // Video Time Update & Buffered Progress
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Calculate buffered range
    if (videoRef.current.buffered && videoRef.current.buffered.length > 0) {
      try {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBufferedTime(bufferedEnd);
      } catch (err) {
        // Buffered range query safe-guard
      }
    }

    // Check Timeline Trivia trigger (within 2.5 seconds of marker)
    if (timelineTrivia && timelineTrivia.length > 0) {
      const match = timelineTrivia.find(
        (t) => Math.abs(t.timestamp - current) <= 2.5 && !dismissedTriviaTimestamps.has(t.timestamp)
      );

      if (match) {
        if (!activeTrivia || activeTrivia.timestamp !== match.timestamp) {
          setActiveTrivia(match);
        }
      } else if (activeTrivia && Math.abs(activeTrivia.timestamp - current) > 7) {
        // Auto-dismiss after 7 seconds past marker
        setActiveTrivia(null);
      }
    }
  };

  // Video Metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.volume = volume;
      videoRef.current.playbackRate = playbackRate;
    }
  };

  // Buffering listeners
  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (!isHost) {
      triggerToast('👑 Only the room host can pause or play for the room');
      return;
    }

    const video = videoRef.current;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      if (onPlay && !isRemoteActionRef.current) {
        onPlay(video.currentTime);
      }
    } else {
      video.pause();
      setIsPlaying(false);
      if (onPause && !isRemoteActionRef.current) {
        onPause(video.currentTime);
      }
    }
  };

  // Scrubber Seek
  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;

    if (!isHost) {
      triggerToast('👑 Only the room host can seek timeline for all viewers');
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = newPercentage * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);

    if (onSeek && !isRemoteActionRef.current) {
      onSeek(newTime);
    }
  };

  // Scrubber Hover Preview
  const handleScrubberMouseMove = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = hoverX / rect.width;
    setHoverScrubberPos(percent * 100);
    setHoverScrubberTime(percent * duration);
  };

  const handleScrubberMouseLeave = () => {
    setHoverScrubberTime(null);
  };

  // Skip relative seconds (e.g. -10s, +10s)
  const skipRelativeTime = (seconds) => {
    if (!videoRef.current) return;
    if (!isHost) {
      triggerToast('👑 Only the room host can seek for the room');
      return;
    }

    const newTime = Math.max(0, Math.min(duration || 0, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    if (onSeek) onSeek(newTime);
  };

  // Jump to specific trivia marker
  const jumpToTrivia = (t) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = t.timestamp;
    setCurrentTime(t.timestamp);
    setActiveTrivia(t);

    if (isHost && onSeek) {
      onSeek(t.timestamp);
    }
  };

  // Manual resync with host / room state
  const handleResyncWithRoom = () => {
    setSyncStatus('syncing');
    if (onRequestSync) {
      onRequestSync();
      triggerToast('🔄 Requesting instant sync with room host...');
    } else if (remoteSync && remoteSync.time !== undefined && videoRef.current) {
      videoRef.current.currentTime = remoteSync.time;
      if (remoteSync.type === 'play') {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      triggerToast('✅ Synced with host playhead');
    }

    setTimeout(() => {
      setSyncStatus('synced');
    }, 600);
  };

  // Volume Change
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  // Change Playback Speed
  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
    triggerToast(`Playback speed: ${rate}x`, 1500);
  };

  // Toggle Picture in Picture
  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('Picture-in-Picture error:', err);
    }
  };

  // Toggle Fullscreen
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

  // Auto-hide controls timer on inactivity
  const handleActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSpeedMenu && !quickReactionOpen) {
        setShowControls(false);
      }
    }, 3200);
  };

  // Handle Touch Tap (Single tap vs Double tap for 10s skip)
  const handleTouchTap = (e) => {
    handleActivity();
    const now = Date.now();
    const touch = e.changedTouches[0];
    const container = containerRef.current?.getBoundingClientRect();

    if (container && now - lastTapRef.current.time < 300) {
      // Double tap detected
      const touchX = touch.clientX - container.left;
      const isRightSide = touchX > container.width * 0.65;
      const isLeftSide = touchX < container.width * 0.35;

      if (isRightSide && isHost) {
        skipRelativeTime(10);
        setDoubleTapFeedback({ side: 'right', text: '+10s' });
        setTimeout(() => setDoubleTapFeedback(null), 600);
      } else if (isLeftSide && isHost) {
        skipRelativeTime(-10);
        setDoubleTapFeedback({ side: 'left', text: '-10s' });
        setTimeout(() => setDoubleTapFeedback(null), 600);
      }
    }

    lastTapRef.current = { time: now, x: touch.clientX };
  };

  // Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        if (isHost) skipRelativeTime(10);
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        if (isHost) skipRelativeTime(-10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isHost, isMuted]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const quickEmojis = ['🍿', '🔥', '❤️', '😂', '👏', '😱'];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleActivity}
      onTouchStart={handleTouchTap}
      onMouseLeave={() => {
        if (isPlaying && !showSpeedMenu && !quickReactionOpen) {
          setShowControls(false);
        }
      }}
      className={`relative w-full ${
        isTheaterMode && !isFullscreen ? 'aspect-[21/9] min-h-[440px]' : 'aspect-video'
      } bg-black rounded-xl overflow-hidden select-none border border-zinc-800 shadow-2xl group flex items-center justify-center transition-all duration-300`}
    >
      {/* HTML5 Video Core */}
      <video
        ref={videoRef}
        src={currentVideoSrc}
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onError={handleVideoError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Buffering Spinner Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <span className="text-xs font-bold text-zinc-300 tracking-wide">Buffering Stream...</span>
          </div>
        </div>
      )}

      {/* Double Tap Skip Indicators */}
      {doubleTapFeedback && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${
            doubleTapFeedback.side === 'left' ? 'left-12' : 'right-12'
          } z-30 pointer-events-none bg-black/70 border border-zinc-700/80 rounded-full px-5 py-3 flex items-center gap-2 animate-ping`}
        >
          {doubleTapFeedback.side === 'left' ? (
            <RotateCcw className="w-5 h-5 text-red-400" />
          ) : (
            <RotateCw className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm font-bold text-white">{doubleTapFeedback.text}</span>
        </div>
      )}

      {/* Timeline Trivia Pop-up Overlay Card */}
      <TimelineTriviaCard
        trivia={activeTrivia}
        onDismiss={() => {
          if (activeTrivia) {
            setDismissedTriviaTimestamps((prev) => new Set([...prev, activeTrivia.timestamp]));
          }
          setActiveTrivia(null);
        }}
        onAskAIAboutTrivia={onAskAIAboutTrivia}
      />

      {/* Floating Reactions Canvas Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {floatingReactions.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-20 text-3xl sm:text-4xl animate-bounce transition-all duration-1000 select-none"
            style={{
              left: `${(item.id * 19) % 75 + 12}%`,
              transform: 'translateY(-60px)',
              opacity: 0.95,
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Multi-User Synchronized Toast Notice */}
      {syncToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300">
          <div className="px-3.5 py-1.5 rounded-full bg-zinc-950/90 text-zinc-100 text-xs font-semibold border border-zinc-700 shadow-xl backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>{syncToast}</span>
          </div>
        </div>
      )}

      {/* Top Controls Bar: Role Status & Multi-User Info */}
      <div
        className={`absolute top-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between text-xs z-25 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
          {/* Host vs Viewer Badge */}
          {isHost ? (
            <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs shadow-sm">
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span><span className="hidden sm:inline">Room </span>Host</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold bg-zinc-900/90 text-zinc-300 border border-zinc-700 text-[10px] sm:text-xs shadow-sm">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
              <span>Synced<span className="hidden sm:inline"> with {hostName}</span></span>
              {estimatedDrift > 0 && (
                <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">({estimatedDrift}s)</span>
              )}
            </span>
          )}

          {/* Demo Stream Trailer Badge */}
          <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-red-950/80 text-red-300 border border-red-800/80 text-[9px] sm:text-[10px] font-bold shadow-sm">
            <Film className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />
            <span>HD<span className="hidden sm:inline"> Demo Stream</span></span>
          </span>

          {/* Active Viewers Count Pill */}
          {activeUsers.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900/80 text-zinc-300 border border-zinc-800 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Users className="w-3 h-3 text-zinc-400" />
              <span>{activeUsers.length} watching</span>
            </span>
          )}

          <span className="hidden md:inline-block text-zinc-400 font-semibold truncate max-w-xs text-xs">
            • {movieTitle}
          </span>
        </div>

        {/* Top Right Utilities: Resync & Theater Mode */}
        <div className="flex items-center gap-2">
          {!isHost && (
            <button
              onClick={handleResyncWithRoom}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition cursor-pointer text-xs font-semibold ${
                syncStatus === 'syncing' ? 'opacity-70 ring-1 ring-red-500' : ''
              }`}
              title="Resync playhead with room host"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-red-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
              />
              <span>Resync</span>
            </button>
          )}

          {/* Theater Mode Toggle */}
          {!isFullscreen && (
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className="hidden sm:inline-flex p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition cursor-pointer"
              title={isTheaterMode ? 'Standard View' : 'Theater View'}
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center Big Play Button Overlay on Pause */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/95 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 transform hover:scale-105 active:scale-95 transition-all cursor-pointer z-25 group/playBtn"
          title={isHost ? 'Play Video' : 'Click to interact / Play'}
        >
          <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-current ml-1 group-hover/playBtn:scale-110 transition-transform" />
        </button>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/85 to-transparent z-25 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Hover Preview Tooltip */}
        {hoverScrubberTime !== null && (
          <div
            style={{ left: `${hoverScrubberPos}%` }}
            className="absolute -top-7 -translate-x-1/2 pointer-events-none z-30 px-2 py-0.5 rounded bg-zinc-900 text-white text-[11px] font-mono border border-zinc-700 shadow-lg"
          >
            {formatTime(hoverScrubberTime)}
          </div>
        )}

        {/* Interactive Progress Bar with Buffered Range & Trivia Pins */}
        <div
          onClick={handleSeek}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={handleScrubberMouseLeave}
          className={`relative w-full py-2 -my-1 cursor-${
            isHost ? 'pointer' : 'default'
          } group/progress transition-all touch-none`}
          title={isHost ? 'Tap to Seek' : 'Host controls seeking'}
        >
          <div className="relative w-full h-2 group-hover/progress:h-2.5 bg-zinc-800/90 rounded-full transition-all">
            {/* Buffered Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-zinc-600/70 rounded-full transition-all duration-150"
              style={{ width: `${duration ? (bufferedTime / duration) * 100 : 0}%` }}
            />

            {/* Played Progress Bar */}
            <div
              className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all duration-75 relative"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
              {/* Scrubber Thumb */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md shadow-red-600/50 opacity-90 sm:opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>

            {/* Timeline Trivia Markers */}
            {duration > 0 &&
              timelineTrivia.map((t, idx) => {
                const posPercent = (t.timestamp / duration) * 100;
                return (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToTrivia(t);
                    }}
                    style={{ left: `${posPercent}%` }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 hover:scale-175 ring-2 ring-zinc-950 transition cursor-pointer shadow-sm z-10"
                    title={`Trivia at ${t.timeFormatted}: ${t.title}`}
                  />
                );
              })}
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-zinc-200 gap-1 sm:gap-2">
          {/* Left Group: Playback & Volume */}
          <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
            {/* Play / Pause Button */}
            <button
              onClick={togglePlay}
              className={`p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800 text-white transition cursor-pointer shrink-0 ${
                !isHost ? 'opacity-80' : ''
              }`}
              title={isHost ? (isPlaying ? 'Pause (Space)' : 'Play (Space)') : 'Host controls playback'}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
            </button>

            {/* Rewind 10s */}
            {isHost && (
              <button
                onClick={() => skipRelativeTime(-10)}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
                title="Rewind 10s"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Forward 10s */}
            {isHost && (
              <button
                onClick={() => skipRelativeTime(10)}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
                title="Forward 10s"
              >
                <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Timestamps */}
            <span className="text-[10px] sm:text-xs font-mono text-zinc-300 select-none whitespace-nowrap">
              {formatTime(currentTime)} <span className="text-zinc-500">/</span> {formatTime(duration)}
            </span>

            {/* Volume Control: Slider hidden on mobile, mute button stays */}
            <div className="flex items-center gap-1 group/volume ml-0.5 sm:ml-1 shrink-0">
              <button
                onClick={toggleMute}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="hidden sm:block w-14 sm:w-20 h-1 accent-red-600 bg-zinc-700 rounded-lg cursor-pointer transition-all"
                title="Volume"
              />
            </div>
          </div>

          {/* Right Group: Reactions, Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick In-Player Floating Reaction Menu */}
            {onSendReaction && (
              <div className="relative">
                <button
                  onClick={() => setQuickReactionOpen(!quickReactionOpen)}
                  className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs font-bold text-amber-300 border border-zinc-700 flex items-center gap-1 transition cursor-pointer"
                  title="Send floating reaction to room"
                >
                  <span>🍿</span>
                  <span className="hidden sm:inline text-[11px] text-zinc-300">React</span>
                </button>

                {quickReactionOpen && (
                  <div className="absolute bottom-10 right-0 p-2 bg-zinc-950/95 border border-zinc-700 rounded-xl shadow-2xl flex items-center gap-1.5 z-40 backdrop-blur-md animate-fade-in">
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onSendReaction(emoji);
                          setQuickReactionOpen(false);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-lg hover:scale-125 transition transform cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold font-mono transition cursor-pointer"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 bg-zinc-950 border border-zinc-800 rounded-xl p-1 shadow-2xl z-40 min-w-24 backdrop-blur-md animate-fade-in">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1 border-b border-zinc-800">
                    Speed
                  </div>
                  {speeds.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`w-full text-left px-2 py-1 rounded text-xs font-mono transition cursor-pointer flex items-center justify-between ${
                        playbackRate === rate
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      <span>{rate}x</span>
                      {playbackRate === rate && <Zap className="w-3 h-3 fill-current" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            {'pictureInPictureEnabled' in document && (
              <button
                onClick={togglePictureInPicture}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer hidden sm:inline-flex"
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
