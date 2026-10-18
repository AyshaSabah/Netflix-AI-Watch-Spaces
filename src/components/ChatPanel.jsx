import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, Smile, Shield } from 'lucide-react';

export default function ChatPanel({
  messages = [],
  activeUsers = [],
  currentUser,
  hostId,
  onSendMessage,
  onSendReaction,
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickReactions = ['🍿', '❤️', '😂', '😱', '🔥', '👏'];

  return (
    <div className="flex flex-col h-full bg-zinc-900/90 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
      {/* Header with active users count */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-200">
            Live Party Chat
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
          <Users className="w-3.5 h-3.5 text-red-500" />
          <span>{activeUsers.length || 1} online</span>
        </div>
      </div>

      {/* Online Users Avatar Row */}
      {activeUsers.length > 0 && (
        <div className="px-3 py-2 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center gap-1.5 overflow-x-auto text-[11px] text-zinc-400">
          <span className="text-[10px] uppercase font-bold text-zinc-400 shrink-0">In Room:</span>
          {activeUsers.map((u, i) => (
            <div
              key={u.id || i}
              className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 shrink-0"
              title={u.name}
            >
              <img
                src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                alt={u.name}
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
              <span className="font-medium text-zinc-300 max-w-[70px] truncate">{u.name}</span>
              {u.id === hostId && (
                <Shield className="w-3 h-3 text-amber-400 fill-amber-400/20" title="Host" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-400">
            <span className="text-3xl mb-2">🍿</span>
            <p className="text-xs font-medium">Welcome to the Watch Space!</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Say hello or react with emojis while watching together.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id || index} className="text-center my-1">
                  <span className="text-[10px] text-zinc-400 bg-zinc-950/60 px-2.5 py-0.5 rounded-full border border-zinc-800">
                    {msg.message}
                  </span>
                </div>
              );
            }

            const isMe = currentUser && msg.userId === currentUser.id;
            const isMsgHost = msg.userId === hostId;

            return (
              <div
                key={msg.id || index}
                className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img
                  src={
                    msg.userAvatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'
                  }
                  alt={msg.userName}
                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-zinc-700"
                />

                <div
                  className={`max-w-[75%] rounded-lg p-2.5 text-xs ${
                    isMe
                      ? 'bg-red-600 text-white rounded-tr-none'
                      : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`font-bold text-[11px] ${
                        isMe ? 'text-red-100' : 'text-zinc-300'
                      }`}
                    >
                      {msg.userName}
                    </span>

                    {isMsgHost && (
                      <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded">
                        HOST
                      </span>
                    )}

                    <span
                      className={`text-[9px] ${
                        isMe ? 'text-red-200' : 'text-zinc-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="leading-relaxed break-words">{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions Bar */}
      <div className="px-3 py-1.5 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between gap-1">
        <span className="text-[10px] text-zinc-400 font-medium">React:</span>
        <div className="flex items-center gap-1">
          {quickReactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(emoji)}
              className="text-base p-1 hover:bg-zinc-800 rounded active:scale-125 transition cursor-pointer"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-zinc-950 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a message to everyone..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-md transition cursor-pointer flex items-center justify-center shadow-md shadow-red-600/20"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
