import mongoose from 'mongoose';

// Movie Schema for Catalog and Streaming details
const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    default: '10 min',
  },
  thumbnailUrl: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: Number,
    default: 2024,
  },
  rating: {
    type: String,
    default: 'PG-13',
  },
  director: {
    type: String,
    default: 'Creative Studio',
  },
  cast: [{
    type: String,
  }],
  timelineTrivia: [{
    timestamp: Number, // in seconds
    timeFormatted: String, // e.g. "00:30"
    title: String,
    trivia: String,
    category: String, // 'Trivia', 'Behind the Scenes', 'Character Note'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Movie || mongoose.model('Movie', movieSchema);
