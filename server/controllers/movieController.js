import Movie from '../models/Movie.js';
import TimelineEvent from '../models/TimelineEvent.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

// Get all movies in catalog
export const getAllMovies = async (req, res) => {
  try {
    let movies = [];
    if (getIsMongoConnected()) {
      try {
        movies = await Movie.find().lean();
      } catch (err) {
        // Ignored
      }
    }

    if (!movies || movies.length === 0) {
      movies = inMemoryStore.getAllMovies();
    }

    return res.json({ movies });
  } catch (error) {
    console.error('Get movies error:', error);
    return res.status(500).json({ error: 'Failed to fetch movies.' });
  }
};

// Get single movie by ID with timeline trivia
export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    let movie = null;
    if (getIsMongoConnected()) {
      try {
        movie = await Movie.findById(id).lean();
      } catch (err) {
        // Ignored
      }
    }

    if (!movie) {
      movie = inMemoryStore.getMovieById(id);
    }

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    return res.json({ movie });
  } catch (error) {
    console.error('Get movie error:', error);
    return res.status(500).json({ error: 'Failed to fetch movie details.' });
  }
};

// Get timeline trivia events for a movie
export const getMovieTimelineEvents = async (req, res) => {
  try {
    const { id } = req.params;
    let events = [];

    if (getIsMongoConnected()) {
      try {
        events = await TimelineEvent.find({ movieId: id }).sort('timestampSeconds').lean();
      } catch (err) {
        // Ignored
      }
    }

    if (!events || events.length === 0) {
      const movie = inMemoryStore.getMovieById(id);
      if (movie && movie.timelineTrivia) {
        events = movie.timelineTrivia;
      }
    }

    return res.json({ events });
  } catch (error) {
    console.error('Get timeline trivia error:', error);
    return res.status(500).json({ error: 'Failed to fetch timeline trivia.' });
  }
};
