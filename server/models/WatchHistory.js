import mongoose from 'mongoose';

// WatchHistory Schema for User Dashboard
const watchHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  movieId: {
    type: String,
    required: true,
  },
  movieTitle: {
    type: String,
    required: true,
  },
  movieThumbnail: {
    type: String,
    required: true,
  },
  movieGenre: {
    type: String,
    default: 'Movie',
  },
  progressSeconds: {
    type: Number,
    default: 0,
  },
  durationSeconds: {
    type: Number,
    default: 600,
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.WatchHistory || mongoose.model('WatchHistory', watchHistorySchema);
