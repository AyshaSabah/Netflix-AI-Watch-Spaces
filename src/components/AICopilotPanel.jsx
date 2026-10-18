import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, Clock, HelpCircle, Film, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function AICopilotPanel({
  movie,
  currentTimestamp = 0,
  prefilledQuestion,
  onClearPrefilled,
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hey! I'm your **Netflix AI Co-Pilot** powered by Gemini. Ask me anything about "${movie?.title || 'the movie'}", its storyline, characters, or the exact scene playing right now!`,
      timestamp: 'Now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle prefilled question from timeline trivia
  useEffect(() => {
    if (prefilledQuestion) {
      setInputQuestion(prefilledQuestion);
      if (onClearPrefilled) onClearPrefilled();
    }
  }, [prefilledQuestion, onClearPrefilled]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAsk = async (questionToAsk) => {
    const q = (questionToAsk || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMsg = {
      role: 'user',
      content: q,
      timestamp: formatTime(currentTimestamp),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const data = await api.askCopilot({
        movieId: movie?.id || movie?._id,
        currentTimestamp,
        question: q,
      });

      const aiMsg = {
        role: 'assistant',
        content: data.answer || '🍿 Enjoy the scene! Let me know if you have another question.',
        timestamp: formatTime(currentTimestamp),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I had trouble fetching the scene details right now. Please try asking again!',
          timestamp: formatTime(currentTimestamp),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    `What's happening at ${formatTime(currentTimestamp)}?`,
    'Tell me a fun behind-the-scenes fact',
    `Who is in the cast of ${movie?.title}?`,
    'Give me an easter egg from this scene',
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900/90 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
              <span>AI Co-Pilot</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-mono">
                Gemini 3.8
              </span>
            </h3>
          </div>
        </div>

        {/* Current scene sync tag */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Scene: {formatTime(currentTimestamp)}</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, index) => {
          const isAI = msg.role === 'assistant';

          return (
            <div
              key={index}
              className={`flex items-start gap-2 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {isAI ? (
                <div className="w-6 h-6 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5 text-[10px] font-bold">
                  YOU
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-2.5 text-xs leading-relaxed ${
                  isAI
                    ? 'bg-zinc-950/80 text-zinc-200 border border-zinc-800'
                    : 'bg-red-600 text-white shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-75">
                  <span className="font-semibold">{isAI ? 'AI Co-Pilot' : 'You'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>Analyzing scene at {formatTime(currentTimestamp)}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="p-2 border-t border-zinc-800 bg-zinc-950/60 overflow-x-auto flex gap-1.5 scrollbar-none">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(q)}
            disabled={isLoading}
            className="text-[10px] whitespace-nowrap bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 rounded-full border border-zinc-800 transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="p-2.5 bg-zinc-950 border-t border-zinc-800 flex gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={`Ask about ${movie?.title || 'the movie'} or scene...`}
          disabled={isLoading}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-md transition cursor-pointer flex items-center justify-center shadow-md shadow-red-600/20"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
