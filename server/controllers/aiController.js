import { askGeminiCopilot } from '../services/geminiService.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import Movie from '../models/Movie.js';
import { getIsMongoConnected } from '../config/db.js';

export const askCopilot = async (req, res) => {
  try {
    const { movieId, currentTimestamp, question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Please enter a question for the AI Co-Pilot.' });
    }

    // Retrieve movie context
    let movie = inMemoryStore.getMovieById(movieId);
    if (!movie && movieId && getIsMongoConnected()) {
      try {
        movie = await Movie.findById(movieId).lean();
      } catch (err) {
        // Ignored
      }
    }

    const movieTitle = movie ? movie.title : 'Featured Film';
    const movieDescription = movie ? movie.description : 'A gripping cinematic experience.';
    const movieGenre = movie ? movie.genre : 'Cinema';
    const director = movie ? movie.director : 'Director';
    const cast = movie ? movie.cast : [];
    const timelineTrivia = movie ? (movie.timelineTrivia || []) : [];

    const answer = await askGeminiCopilot({
      movieTitle,
      movieDescription,
      movieGenre,
      director,
      cast,
      timelineTrivia,
      currentTimestamp: Number(currentTimestamp) || 0,
      userQuestion: question.trim(),
    });

    return res.json({
      answer,
      timestamp: currentTimestamp,
      movieTitle,
    });
  } catch (error) {
    console.error('AI Copilot Controller error:', error);
    return res.status(500).json({
      error: 'AI Co-Pilot had trouble generating a response. Please try again.',
    });
  }
};
