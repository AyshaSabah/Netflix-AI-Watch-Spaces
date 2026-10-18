import {
  searchFreeMovieDb,
  searchJustWatch,
  getPhotoUrl,
  getMedia,
  getTrending as getTrendingService,
} from '../services/freeMovieDbService.js';
import Movie from '../models/Movie.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

// 1. Search movies on Free Movie DB / IMDb (Swagger path: /search)
export const search = async (req, res) => {
  try {
    const { q, tt, lsn, v } = req.query;

    if (!q && !tt) {
      return res.status(400).json({
        ok: false,
        error: "At least one argument ('q' or 'tt') is required.",
      });
    }

    const results = await searchFreeMovieDb({ q, tt, lsn, v });
    return res.json(results);
  } catch (error) {
    console.error('Free Movie DB search error:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error while searching.' });
  }
};

// 2. Search JustWatch streaming sources (Swagger path: /justwatch)
export const justwatch = async (req, res) => {
  try {
    const { q, L } = req.query;

    if (!q) {
      return res.status(400).json({ ok: false, error: "Query parameter 'q' is required." });
    }

    const data = await searchJustWatch({ q, L: L || 'en_IN' });
    return res.json(data);
  } catch (error) {
    console.error('Free Movie DB JustWatch error:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error while fetching JustWatch sources.' });
  }
};

// 3. Get poster photo of an IMDb ID (Swagger path: /photo/:id)
export const getPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { w, h } = req.query;

    if (!id) {
      return res.status(400).json({ ok: false, error: 'IMDb ID parameter is required.' });
    }

    const photoUrl = await getPhotoUrl(id, { w: Number(w) || undefined, h: Number(h) || undefined });
    if (!photoUrl) {
      return res.redirect('https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg');
    }

    try {
      const imgRes = await fetch(photoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (imgRes.ok) {
        const arrayBuf = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=604800, immutable');
        res.set('Access-Control-Allow-Origin', '*');
        return res.send(Buffer.from(arrayBuf));
      }
    } catch (fetchErr) {
      console.warn('Upstream image proxy notice:', fetchErr.message);
    }

    // Direct redirect fallback if proxy stream fails
    return res.redirect(photoUrl);
  } catch (error) {
    console.error('Free Movie DB photo error:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error while fetching photo.' });
  }
};

// 4. Get media / trailer video for an IMDb ID (Swagger path: /media/:id)
export const getMediaInfo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ ok: false, error: 'IMDb ID parameter is required.' });
    }

    const media = await getMedia(id);
    return res.json(media);
  } catch (error) {
    console.error('Free Movie DB media error:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error while fetching media.' });
  }
};

// 5. Get Trending Movies, Series, and Anime (Swagger / Category extension)
export const getTrending = async (req, res) => {
  try {
    const { category } = req.query;
    const trending = getTrendingService(category || 'all');
    return res.json(trending);
  } catch (error) {
    console.error('Get trending error:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error while fetching trending titles.' });
  }
};

// 6. Import an IMDb / Trending title into Netflix AI Watch Spaces
export const importMovie = async (req, res) => {
  try {
    const {
      imdbId,
      title,
      year,
      poster,
      actors,
      description,
      genre,
      videoUrl,
      duration,
      rating,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required to import.' });
    }

    const cleanTitle = title.trim();
    const existing = inMemoryStore.getAllMovies().find(
      (m) => (m.imdbId && m.imdbId === imdbId) || m.title.toLowerCase() === cleanTitle.toLowerCase()
    );

    if (existing) {
      return res.json({ movie: existing, alreadyExisted: true });
    }

    // Default reliable sample video streams if not specified
    const sampleVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    ];
    const assignedVideoUrl = videoUrl || sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

    const movieObj = {
      id: `imdb-${imdbId || Date.now()}`,
      _id: `imdb-${imdbId || Date.now()}`,
      imdbId: imdbId || '',
      title: cleanTitle,
      description: description || `Experience "${cleanTitle}" (${year || 'Film'}). Starring ${actors || 'an acclaimed cast'}. Join with friends in real-time with synchronized playback and Gemini AI Co-Pilot commentary.`,
      genre: genre || 'Drama / Cinema',
      duration: duration || '12 min',
      thumbnailUrl: poster || 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg',
      videoUrl: assignedVideoUrl,
      releaseYear: parseInt(year, 10) || 2024,
      rating: rating || 'PG-13',
      director: 'Acclaimed Director',
      cast: typeof actors === 'string' ? actors.split(',').map((s) => s.trim()) : (actors || []),
      timelineTrivia: [
        {
          timestamp: 15,
          timeFormatted: '00:15',
          title: 'Opening Scene & Cinematic Hook',
          trivia: `Notice the opening sequence of ${cleanTitle}, establishing key atmospheric mood and character dynamics.`,
          category: 'Behind the Scenes',
        },
        {
          timestamp: 45,
          timeFormatted: '00:45',
          title: 'Performance & Cast Dynamics',
          trivia: `Starring ${actors || 'notable actors'}, this critical moment sets up the central conflict of the story.`,
          category: 'Character Note',
        },
        {
          timestamp: 120,
          timeFormatted: '02:00',
          title: 'Plot Progression',
          trivia: 'The pacing accelerates here as hidden motivations begin to surface.',
          category: 'Plot Hint',
        },
      ],
    };

    // Store in memory
    inMemoryStore.movies.unshift(movieObj);

    // Also attempt MongoDB save if connected
    if (getIsMongoConnected()) {
      try {
        await Movie.create(movieObj);
      } catch (err) {
        // Ignored
      }
    }

    return res.status(201).json({
      message: `Successfully imported "${cleanTitle}" into Netflix AI Watch Spaces!`,
      movie: movieObj,
    });
  } catch (error) {
    console.error('Import movie error:', error);
    return res.status(500).json({ error: 'Failed to import movie.' });
  }
};
