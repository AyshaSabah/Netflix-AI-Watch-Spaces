import React, { useState, useEffect } from 'react';
import {
  Play,
  Users,
  Sparkles,
  Film,
  Compass,
  ArrowRight,
  Search,
  Tv,
  Flame,
  Star,
  Clapperboard,
  Tv2,
  Sword,
  Filter,
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import TrendingCard from '../components/TrendingCard';
import { api } from '../services/api';

export default function HomePage({
  movies = [],
  activeRooms = [],
  onWatchTogether,
  onWatchTrailer,
  onJoinRoom,
  onOpenCreateRoom,
  onOpenFreeMovieDbSearch,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'movies' | 'series' | 'anime'
  const [trendingData, setTrendingData] = useState({
    movies: [],
    series: [],
    anime: [],
  });
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  // Load trending movies, series, and anime from Free Movie DB API
  useEffect(() => {
    async function loadTrending() {
      try {
        setIsLoadingTrending(true);
        const data = await api.getTrending('all');
        if (data && data.ok) {
          setTrendingData({
            movies: data.movies || [],
            series: data.series || [],
            anime: data.anime || [],
          });
        }
      } catch (err) {
        console.error('Failed to load trending titles:', err);
      } finally {
        setIsLoadingTrending(false);
      }
    }
    loadTrending();
  }, []);

  const featuredMovie = movies[0] || {
    id: 'trending-mov-1',
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family in this sweeping cinematic sci-fi triumph.',
    genre: 'Sci-Fi / Adventure',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    duration: '2h 46m',
  };

  const defaultHeroPoster = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80';

  const handleHeroImageError = (e) => {
    if (e.target.src !== defaultHeroPoster) {
      e.target.src = defaultHeroPoster;
    }
  };

  const sciFiMovies = movies.filter((m) => m.genre?.toLowerCase().includes('sci-fi'));

  // Handle JustWatch inspection from trending card
  const handleInspectJustWatch = (item) => {
    if (onOpenFreeMovieDbSearch) {
      onOpenFreeMovieDbSearch(item.title);
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-zinc-950 text-white">
      {/* Hero Featured Movie Banner */}
      <div className="relative w-full aspect-auto sm:aspect-[21/9] min-h-[460px] sm:min-h-[440px] md:min-h-[540px] max-h-[640px] overflow-hidden">
        <img
          src={featuredMovie?.thumbnailUrl || defaultHeroPoster}
          alt={featuredMovie?.title || 'Featured Movie'}
          referrerPolicy="no-referrer"
          onError={handleHeroImageError}
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle Netflix Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-6 md:left-12 right-4 sm:right-6 md:right-12 max-w-2xl z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest bg-red-600 text-white uppercase shadow-md shadow-red-600/40">
              FEATURED WATCH PARTY
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-zinc-900/90 text-zinc-300 border border-zinc-700">
              {featuredMovie.genre}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2 sm:mb-3 drop-shadow-md">
            {featuredMovie.title}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-300 line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 leading-relaxed max-w-xl">
            {featuredMovie.description}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => onWatchTrailer ? onWatchTrailer(featuredMovie) : onWatchTogether(featuredMovie)}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/40 transition transform active:scale-98 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Trailer / Clip</span>
            </button>

            <button
              onClick={() => onWatchTogether(featuredMovie)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs sm:text-sm border border-zinc-700 hover:border-red-500/60 transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Users className="w-4 h-4 text-red-500" />
              <span>Watch with Friends</span>
            </button>

            <button
              onClick={() => onOpenFreeMovieDbSearch()}
              className="w-full sm:w-auto px-3.5 sm:px-4 py-2 sm:py-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-medium text-xs border border-zinc-800 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>Search Catalog</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-14">
        {/* Search Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900/80 to-zinc-900/40 border border-zinc-800/80 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                  FM-DB v0.3.1
                </span>
                <span className="text-xs text-zinc-400 font-medium">Free Movie Database & JustWatch API</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Search Any Movie, Series, or Anime
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Lookup millions of titles, inspect real JustWatch streaming options, and launch synchronized watch rooms with Gemini AI Co-Pilot commentary.
              </p>
            </div>

            <button
              onClick={() => onOpenFreeMovieDbSearch()}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search Movies</span>
            </button>
          </div>
        </section>

        {/* Live Active Watch Rooms Carousel */}
        {activeRooms.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <span>Live Watch Spaces Right Now</span>
                  <span className="text-xs font-normal text-zinc-400">
                    ({activeRooms.length} active)
                  </span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => onJoinRoom(room.roomId)}
                  className="group bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600/60 rounded-xl p-3.5 flex items-center gap-3.5 cursor-pointer transition shadow-md"
                >
                  <img
                    src={room.movieThumbnail || defaultHeroPoster}
                    alt={room.movieTitle}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = defaultHeroPoster; }}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800/80 px-1.5 py-0.5 rounded">
                        {room.roomId}
                      </span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-red-500" />
                        {room.activeUsersCount || 1} watching
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white truncate group-hover:text-red-400 transition">
                      {room.name}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate">
                      Watching: {room.movieTitle}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-red-600 flex items-center justify-center text-zinc-300 group-hover:text-white shrink-0 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TRENDING MOVIES / SERIES / ANIME SHOWCASE SECTION                         */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          {/* Header & Category Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded bg-red-600/20 text-red-500">
                  <Flame className="w-4 h-4 fill-current" />
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Trending on FM-DB & IMDb
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-amber-300 border border-zinc-700">
                  Live Global Popularity
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Explore top-rated movies, prestige series, and anime. Launch a synchronized watch space for any title in 1 click!
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 self-start md:self-auto max-w-full overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span>🌟</span>
                <span>All Trending</span>
              </button>

              <button
                onClick={() => setSelectedCategory('movies')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedCategory === 'movies'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5" />
                <span>Movies</span>
              </button>

              <button
                onClick={() => setSelectedCategory('series')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedCategory === 'series'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Tv2 className="w-3.5 h-3.5" />
                <span>Series</span>
              </button>

              <button
                onClick={() => setSelectedCategory('anime')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedCategory === 'anime'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Anime</span>
              </button>
            </div>
          </div>

          {/* 1. Trending Movies Row */}
          {(selectedCategory === 'all' || selectedCategory === 'movies') && (
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-red-600" />
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>🍿 Trending Movies</span>
                    <span className="text-xs font-normal text-zinc-400 font-mono">
                      ({trendingData.movies.length} titles)
                    </span>
                  </h3>
                </div>
                {selectedCategory === 'all' && (
                  <button
                    onClick={() => setSelectedCategory('movies')}
                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>View all movies</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingData.movies.map((item) => (
                  <TrendingCard
                    key={item.id}
                    item={item}
                    onWatchTogether={onWatchTogether}
                    onWatchTrailer={onWatchTrailer}
                    onInspectJustWatch={handleInspectJustWatch}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Trending Series Row */}
          {(selectedCategory === 'all' || selectedCategory === 'series') && (
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-blue-600" />
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>📺 Trending Series & TV Shows</span>
                    <span className="text-xs font-normal text-zinc-400 font-mono">
                      ({trendingData.series.length} titles)
                    </span>
                  </h3>
                </div>
                {selectedCategory === 'all' && (
                  <button
                    onClick={() => setSelectedCategory('series')}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>View all series</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingData.series.map((item) => (
                  <TrendingCard
                    key={item.id}
                    item={item}
                    onWatchTogether={onWatchTogether}
                    onWatchTrailer={onWatchTrailer}
                    onInspectJustWatch={handleInspectJustWatch}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. Trending Anime Row */}
          {(selectedCategory === 'all' || selectedCategory === 'anime') && (
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-purple-600" />
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>⛩️ Trending Anime</span>
                    <span className="text-xs font-normal text-zinc-400 font-mono">
                      ({trendingData.anime.length} titles)
                    </span>
                  </h3>
                </div>
                {selectedCategory === 'all' && (
                  <button
                    onClick={() => setSelectedCategory('anime')}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>View all anime</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingData.anime.map((item) => (
                  <TrendingCard
                    key={item.id}
                    item={item}
                    onWatchTogether={onWatchTogether}
                    onWatchTrailer={onWatchTrailer}
                    onInspectJustWatch={handleInspectJustWatch}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Classic Movie Catalog */}
        <section className="pt-6 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Classic Open-Source Cinema Archive</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full-length milestone open cinema films with pre-configured trivia cue markers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id || movie._id}
                movie={movie}
                onWatchTogether={onWatchTogether}
                onWatchTrailer={onWatchTrailer}
              />
            ))}
          </div>
        </section>

        {/* Sci-Fi / Cyberpunk Category Row */}
        {sciFiMovies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Sci-Fi & Cyberpunk Expeditions</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {sciFiMovies.map((movie) => (
                <MovieCard
                  key={movie.id || movie._id}
                  movie={movie}
                  onWatchTogether={onWatchTogether}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
