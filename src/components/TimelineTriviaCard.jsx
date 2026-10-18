import React from 'react';
import { Sparkles, X, MessageSquareQuote, Film } from 'lucide-react';

export default function TimelineTriviaCard({
  trivia,
  onDismiss,
  onAskAIAboutTrivia,
}) {
  if (!trivia) return null;

  const categoryColor = {
    'Behind the Scenes': 'bg-purple-950/80 text-purple-300 border-purple-500/50',
    'Trivia': 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    'Character Note': 'bg-blue-950/80 text-blue-300 border-blue-500/50',
    'Plot Hint': 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
  }[trivia.category] || 'bg-red-950/80 text-red-300 border-red-500/50';

  return (
    <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-sm z-30 animate-fade-in">
      <div className="bg-zinc-950/95 backdrop-blur-md border border-zinc-700/80 rounded-lg p-3.5 shadow-2xl shadow-black/80 flex flex-col gap-2">
        {/* Header with category and dismiss */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${categoryColor}`}>
              {trivia.category || 'Trivia'}
            </span>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              {trivia.timeFormatted}
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-900 transition cursor-pointer"
            title="Dismiss trivia card"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title and Trivia Body */}
        <div>
          <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{trivia.title}</span>
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {trivia.trivia}
          </p>
        </div>

        {/* Action Button: Ask AI Co-Pilot */}
        {onAskAIAboutTrivia && (
          <div className="pt-1.5 border-t border-zinc-800 flex justify-end">
            <button
              onClick={() => onAskAIAboutTrivia(trivia)}
              className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition"
            >
              <MessageSquareQuote className="w-3 h-3" />
              <span>Ask AI Co-Pilot about this</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
