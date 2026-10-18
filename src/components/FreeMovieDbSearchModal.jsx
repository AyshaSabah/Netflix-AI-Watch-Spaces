import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Film,
  Users,
  ExternalLink,
  Tv,
  Star,
  Play,
  Sparkles,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';

export default function FreeMovieDbSearchModal({
  isOpen,
  onClose,
  onStartWatchSpace,
  initialQuery = '',
}) {
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [streamingSources, setStreamingSources] = useState(null);
  const [loadingSources, setLoadingSources] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchFreeMovieDb(query.trim());
        setResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch JustWatch streaming availability when selecting a movie
  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie);
    setStreamingSources(null);
    setLoadingSources(true);

    try {
      const jwData = await api.getJustWatch(movie['#TITLE'] || movie.title);
      if (jwData && jwData.description && jwData.description.length > 0) {
        setStreamingSources(jwData.description[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch JustWatch data:', e);
    } finally {
      setLoadingSources(false);
    }
  };

  // Import into Watch Space
  const handleLaunchSpace = async () => {
    if (!selectedMovie) return;
    setImporting(true);

    try {
      const importedMovie = await api.importFreeMovieDb({
        imdbId: selectedMovie['#IMDB_ID'],
        title: selectedMovie['#TITLE'],
        year: selectedMovie['#YEAR'],
        poster: selectedMovie['#IMG_POSTER'],
        actors: selectedMovie['#ACTORS'],
        genre: selectedMovie['#TYPE'] === 'feature' ? 'Movie / Cinema' : 'Series / TV',
      });

      onClose();
      onStartWatchSpace(importedMovie);
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  const sampleQuickQueries = [
    'Inception',
    'Interstellar',
    'Stranger Things',
    'The Matrix',
    'Spirited Away',
    'Dune',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-600/30">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Search Movies & Shows
                </h2>
                <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 px-1.5 py-0.5 rounded">
                  FM-DB v0.3.1
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Search millions of movies and shows. Check streaming availability and watch together!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movie title, series, or IMDb ID (e.g. Inception, tt0816692)..."
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Query Chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[11px] text-zinc-500 shrink-0 font-medium">Quick Suggestions:</span>
            {sampleQuickQueries.map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 rounded-full border border-zinc-800 hover:border-zinc-700 transition shrink-0 cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Results List + Movie Detail Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Results Grid / List */}
          <div className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 border-r border-zinc-800/80 ${selectedMovie ? 'hidden md:block' : 'block'}`}>
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="text-xs">Querying Free Movie DB & IMDb...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <Film className="w-10 h-10 text-zinc-700 mb-2" />
                <p className="text-sm font-semibold text-zinc-400">
                  {query ? 'No movies found matching your query.' : 'Type to search Free Movie DB & IMDb'}
                </p>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Powered by the Free Movie Database REST API with live JustWatch streaming availability.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((movie) => {
                  const isSelected = selectedMovie && selectedMovie['#IMDB_ID'] === movie['#IMDB_ID'];

                  return (
                    <div
                      key={movie['#IMDB_ID']}
                      onClick={() => handleSelectMovie(movie)}
                      className={`group p-2.5 rounded-xl border flex gap-3 cursor-pointer transition ${
                        isSelected
                          ? 'bg-red-950/40 border-red-600 ring-1 ring-red-600'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-16 h-24 rounded-lg bg-zinc-950 overflow-hidden shrink-0 relative">
                        {movie['#IMG_POSTER'] && typeof movie['#IMG_POSTER'] === 'string' && movie['#IMG_POSTER'].trim() !== '' ? (
                          <img
                            src={movie['#IMG_POSTER']}
                            alt={movie['#TITLE']}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : null}
                        <div
                          style={{ display: movie['#IMG_POSTER'] && typeof movie['#IMG_POSTER'] === 'string' && movie['#IMG_POSTER'].trim() !== '' ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center bg-zinc-800 text-zinc-400 text-[10px] text-center p-1 font-bold"
                        >
                          {movie['#TITLE']}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-mono bg-zinc-800 text-red-400 px-1.5 py-0.2 rounded border border-zinc-700">
                              {movie['#IMDB_ID']}
                            </span>
                            {movie['#YEAR'] && (
                              <span className="text-[10px] text-zinc-400 font-semibold">
                                {movie['#YEAR']}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition line-clamp-1">
                            {movie['#TITLE']}
                          </h4>

                          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                            {movie['#ACTORS'] || 'Cast ensemble'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                          <span>{movie['#TYPE'] || 'Movie'}</span>
                          <span className="text-red-500 font-semibold group-hover:underline">
                            Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Movie Detail Pane */}
          {selectedMovie ? (
            <div className="w-full md:w-80 lg:w-96 bg-zinc-950 p-3.5 sm:p-4 md:p-5 overflow-y-auto flex flex-col justify-between gap-4">
              <div>
                {/* Mobile Back Button to return to results */}
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="md:hidden mb-3 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer w-full justify-center"
                >
                  <span>← Back to search results</span>
                </button>

                {/* Poster & Header */}
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black mb-3.5 border border-zinc-800">
                  <img
                    src={
                      selectedMovie['#IMG_POSTER'] ||
                      'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg'
                    }
                    alt={selectedMovie['#TITLE']}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                      {selectedMovie['#IMDB_ID']}
                    </span>
                    <h3 className="text-base font-black text-white mt-1 drop-shadow-md">
                      {selectedMovie['#TITLE']}
                    </h3>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/80 pb-2">
                    <span>Release Year:</span>
                    <span className="text-white font-semibold">{selectedMovie['#YEAR'] || 'Unknown'}</span>
                  </div>

                  <div className="border-b border-zinc-800/80 pb-2">
                    <span className="text-zinc-500 block mb-0.5">Top Cast:</span>
                    <p className="text-zinc-300 font-medium leading-relaxed">
                      {selectedMovie['#ACTORS'] || 'Not specified'}
                    </p>
                  </div>

                  {selectedMovie['#IMDB_URL'] && (
                    <a
                      href={selectedMovie['#IMDB_URL']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View on IMDb Official Page</span>
                    </a>
                  )}

                  {/* JustWatch Streaming Availability */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                        <Tv className="w-3.5 h-3.5 text-red-500" />
                        <span>Streaming on JustWatch</span>
                      </span>
                    </div>

                    {loadingSources ? (
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 py-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                        <span>Checking streaming providers...</span>
                      </div>
                    ) : streamingSources && streamingSources.offers && streamingSources.offers.length > 0 ? (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {streamingSources.offers.slice(0, 6).map((offer, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px]"
                          >
                            <span className="font-semibold text-zinc-200 truncate mr-2">
                              {offer.name}
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                              {offer.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-500">
                        {streamingSources ? 'Check JustWatch for current regional availability.' : 'No regional streaming offers found.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button: Watch Together in Space */}
              <div className="pt-3 border-t border-zinc-800">
                <button
                  onClick={handleLaunchSpace}
                  disabled={importing}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importing to Watch Space...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Watch Together in Netflix Space</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex w-80 lg:w-96 bg-zinc-950 p-6 flex-col items-center justify-center text-center text-zinc-500 border-l border-zinc-800/80">
              <Film className="w-12 h-12 text-zinc-800 mb-2" />
              <p className="text-xs font-semibold text-zinc-400">Select any movie to see full IMDb metadata</p>
              <p className="text-[11px] text-zinc-600 mt-1">
                View cast, JustWatch streaming providers, and launch a synced room with AI Co-Pilot commentary.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
