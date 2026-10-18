import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Copy,
  Check,
  Sparkles,
  MessageSquare,
  Bot,
  Info,
  ArrowLeft,
  Crown,
  Share2,
  Calendar,
  Clock,
  Film,
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import ChatPanel from '../components/ChatPanel';
import AICopilotPanel from '../components/AICopilotPanel';
import { getSocket } from '../services/socket';
import { api } from '../services/api';

export default function WatchRoomPage({
  roomId,
  currentUser,
  onLeaveRoom,
  onOpenAuth,
}) {
  const [roomData, setRoomData] = useState(null);
  const [movie, setMovie] = useState(null);
  const [timelineTrivia, setTimelineTrivia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'ai' | 'trivia'

  // Real-time state
  const [activeUsers, setActiveUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [remoteSync, setRemoteSync] = useState(null);
  const [hostId, setHostId] = useState('');
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [prefilledAIQuestion, setPrefilledAIQuestion] = useState('');

  // Socket instance ref
  const socketRef = useRef(null);

  const isHost = currentUser && hostId ? currentUser.id === hostId : false;

  // 1. Fetch Room and Movie Details
  useEffect(() => {
    let isMounted = true;

    async function loadRoom() {
      try {
        setLoading(true);
        const data = await api.getRoom(roomId);
        if (!isMounted) return;

        setRoomData(data.room);
        setMovie(data.movie);
        setHostId(data.room.hostId);

        if (data.movie && data.movie.timelineTrivia) {
          setTimelineTrivia(data.movie.timelineTrivia);
        } else if (data.room.movieId) {
          const events = await api.getMovieTimeline(data.room.movieId);
          if (isMounted) setTimelineTrivia(events);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load room details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRoom();
    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // 2. Setup Real-time Socket.io listeners
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();
    socketRef.current = socket;

    const joinPayload = {
      roomId,
      user: currentUser || {
        id: `guest-${Math.random().toString(36).substring(2, 7)}`,
        name: 'Guest Viewer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
    };

    // Join room
    socket.emit('join:room', joinPayload);

    // Initial state received from server
    socket.on('room:state', (data) => {
      if (data.hostId) setHostId(data.hostId);
      if (data.activeUsers) setActiveUsers(data.activeUsers);
      if (data.messages) setChatMessages(data.messages);
      if (data.currentTime !== undefined) {
        setRemoteSync({
          type: data.isPlaying ? 'play' : 'pause',
          time: data.currentTime,
        });
      }
    });

    // Remote Play
    socket.on('video:play', (data) => {
      setRemoteSync({
        type: 'play',
        time: data.currentTime,
        timestamp: Date.now(),
      });
    });

    // Remote Pause
    socket.on('video:pause', (data) => {
      setRemoteSync({
        type: 'pause',
        time: data.currentTime,
        timestamp: Date.now(),
      });
    });

    // Remote Seek
    socket.on('video:seek', (data) => {
      setRemoteSync({
        type: 'seek',
        time: data.currentTime,
        timestamp: Date.now(),
        senderName: data.senderId === hostId ? 'Host' : 'Viewer',
      });
    });

    // Remote Sync Response
    socket.on('video:sync-response', (data) => {
      setRemoteSync({
        type: data.isPlaying ? 'play' : 'pause',
        time: data.currentTime,
        timestamp: Date.now(),
        senderName: 'Room Host',
      });
    });

    // Chat Message received
    socket.on('chat:message', (newMsg) => {
      setChatMessages((prev) => [...prev, newMsg]);
    });

    // Emoji reaction received
    socket.on('reaction:received', (reactionData) => {
      setFloatingReactions((prev) => [...prev, reactionData]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== reactionData.id));
      }, 2500);
    });

    // User joined/left
    socket.on('user:joined', (data) => {
      if (data.activeUsers) setActiveUsers(data.activeUsers);
    });

    socket.on('user:left', (data) => {
      if (data.activeUsers) setActiveUsers(data.activeUsers);
    });

    // Host Updated
    socket.on('host:updated', (data) => {
      setHostId(data.newHostId);
      if (data.activeUsers) setActiveUsers(data.activeUsers);
    });

    return () => {
      socket.off('room:state');
      socket.off('video:play');
      socket.off('video:pause');
      socket.off('video:seek');
      socket.off('video:sync-response');
      socket.off('chat:message');
      socket.off('reaction:received');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('host:updated');
    };
  }, [roomId, currentUser]);

  // Periodic watch history tracking
  useEffect(() => {
    if (!currentUser || !movie) return;

    const interval = setInterval(() => {
      if (currentPlaybackTime > 5) {
        api.updateHistory({
          userId: currentUser.id,
          movieId: movie.id || movie._id,
          movieTitle: movie.title,
          movieThumbnail: movie.thumbnailUrl,
          movieGenre: movie.genre,
          progressSeconds: Math.round(currentPlaybackTime),
        }).catch(() => {});
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentUser, movie, currentPlaybackTime]);

  // Playback Control Handlers
  const handleHostPlay = (time) => {
    setCurrentPlaybackTime(time);
    socketRef.current?.emit('video:play', {
      roomId,
      currentTime: time,
      userId: currentUser?.id,
    });
  };

  const handleHostPause = (time) => {
    setCurrentPlaybackTime(time);
    socketRef.current?.emit('video:pause', {
      roomId,
      currentTime: time,
      userId: currentUser?.id,
    });
  };

  const handleHostSeek = (time) => {
    setCurrentPlaybackTime(time);
    socketRef.current?.emit('video:seek', {
      roomId,
      currentTime: time,
      userId: currentUser?.id,
    });
  };

  // Chat message send handler
  const handleSendMessage = (text) => {
    socketRef.current?.emit('chat:send', {
      roomId,
      message: text,
      user: currentUser || {
        id: `guest-${Math.random().toString(36).substring(2, 7)}`,
        name: 'Guest Viewer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
    });
  };

  // Reaction send handler
  const handleSendReaction = (emoji) => {
    socketRef.current?.emit('reaction:send', {
      roomId,
      emoji,
      user: currentUser || { name: 'Guest' },
    });
  };

  // Copy Room Code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Quick ask AI from timeline card
  const handleAskAIAboutTrivia = (triviaItem) => {
    setActiveTab('ai');
    setPrefilledAIQuestion(`Tell me more about "${triviaItem.title}" and why it happens at ${triviaItem.timeFormatted}.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold text-zinc-300">
          Entering Watch Space {roomId}...
        </p>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md text-center">
          <span className="text-4xl mb-3 block">🍿</span>
          <h2 className="text-lg font-bold text-white mb-2">Watch Space Not Found</h2>
          <p className="text-xs text-zinc-400 mb-6">
            {error || `Room with code "${roomId}" does not exist or has ended.`}
          </p>
          <button
            onClick={onLeaveRoom}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Bar for Watch Space */}
      <div className="bg-zinc-950/95 border-b border-zinc-800 px-3 sm:px-4 md:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white px-2 py-1.5 rounded-md hover:bg-zinc-900 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Leave Space</span>
            <span className="sm:hidden">Exit</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 shrink-0" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
              <span className="truncate">{roomData.name}</span>
              <span className="hidden md:inline text-xs font-normal text-zinc-400 truncate">
                • {movie?.title}
              </span>
            </h1>
          </div>
        </div>

        {/* Room Code Badge with Copy button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 px-2 sm:px-2.5 py-1 rounded-md text-xs font-mono">
            <span className="hidden sm:inline text-zinc-400 font-sans text-[11px]">Room Code:</span>
            <span className="font-bold text-red-500 uppercase tracking-wider text-[11px] sm:text-xs">{roomId}</span>
            <button
              onClick={handleCopyCode}
              className="ml-1 text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer transition"
              title="Copy Room Code to share with friends"
            >
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Watch Layout: Video & Controls (Left) + Interactive Side Panel (Right) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Video & Movie Information */}
        <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
          <VideoPlayer
            videoUrl={
              (!roomData.videoUrl || roomData.videoUrl.includes('commondatastorage.googleapis.com'))
                ? (movie?.videoUrl && !movie.videoUrl.includes('commondatastorage.googleapis.com')
                    ? movie.videoUrl
                    : 'https://vjs.zencdn.net/v/oceans.mp4')
                : roomData.videoUrl
            }
            movieTitle={roomData.movieTitle}
            isHost={isHost}
            hostName={roomData.hostName}
            timelineTrivia={timelineTrivia}
            onPlay={handleHostPlay}
            onPause={handleHostPause}
            onSeek={handleHostSeek}
            onAskAIAboutTrivia={handleAskAIAboutTrivia}
            remoteSync={remoteSync}
            floatingReactions={floatingReactions}
            activeUsers={activeUsers}
            currentUser={currentUser}
            onRequestSync={() => {
              socketRef.current?.emit('video:sync-request', { roomId });
            }}
            onSendReaction={handleSendReaction}
          />

          {/* Room Controls Bar & Info */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex flex-wrap items-center gap-2">
                  <span>{movie?.title || roomData.movieTitle}</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                    {movie?.rating || 'PG-13'}
                  </span>
                  <span className="text-[10px] sm:text-xs text-red-400 font-bold">
                    {movie?.genre}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
                  Host: <span className="text-zinc-200 font-semibold">{roomData.hostName}</span>
                  {isHost && ' (You)'} • {activeUsers.length} watching now
                </p>
              </div>

              {/* Share invite action */}
              <button
                onClick={handleCopyCode}
                className="px-2.5 sm:px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-red-400" />
                <span>{copiedCode ? 'Copied!' : 'Invite Friends'}</span>
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-3">
              {movie?.description}
            </p>

            {/* Movie metadata badges */}
            <div className="flex flex-wrap gap-3 sm:gap-4 text-[11px] sm:text-xs text-zinc-400 pt-2.5 border-t border-zinc-800/80">
              {movie?.director && (
                <div>
                  <span className="text-zinc-500">Director: </span>
                  <span className="text-zinc-300 font-medium">{movie.director}</span>
                </div>
              )}
              {movie?.cast && movie.cast.length > 0 && (
                <div>
                  <span className="text-zinc-500">Cast: </span>
                  <span className="text-zinc-300 font-medium">{movie.cast.join(', ')}</span>
                </div>
              )}
              {movie?.releaseYear && (
                <div>
                  <span className="text-zinc-500">Released: </span>
                  <span className="text-zinc-300 font-medium">{movie.releaseYear}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Social & AI Panel */}
        <div className="flex flex-col h-[480px] sm:h-[540px] lg:h-auto min-h-[420px]">
          {/* Navigation Tabs: Live Chat | AI Co-Pilot | Timeline Trivia */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 mb-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Co-Pilot</span>
            </button>

            <button
              onClick={() => setActiveTab('trivia')}
              className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer ${
                activeTab === 'trivia'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Trivia ({timelineTrivia.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0">
            {activeTab === 'chat' && (
              <ChatPanel
                messages={chatMessages}
                activeUsers={activeUsers}
                currentUser={currentUser}
                hostId={hostId}
                onSendMessage={handleSendMessage}
                onSendReaction={handleSendReaction}
              />
            )}

            {activeTab === 'ai' && (
              <AICopilotPanel
                movie={movie}
                currentTimestamp={currentPlaybackTime}
                prefilledQuestion={prefilledAIQuestion}
                onClearPrefilled={() => setPrefilledAIQuestion('')}
              />
            )}

            {activeTab === 'trivia' && (
              <div className="flex flex-col h-full bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scene Timeline Trivia Directory</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {timelineTrivia.length} cues
                  </span>
                </div>

                {timelineTrivia.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (isHost) {
                        handleHostSeek(item.timestamp);
                      }
                    }}
                    className={`p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg transition ${
                      isHost ? 'cursor-pointer hover:border-amber-500/60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                        {item.timeFormatted}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-semibold">
                        {item.category || 'Trivia'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed mb-2">
                      {item.trivia}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAskAIAboutTrivia(item);
                      }}
                      className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Bot className="w-3 h-3" />
                      <span>Ask AI Co-Pilot about this scene</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
