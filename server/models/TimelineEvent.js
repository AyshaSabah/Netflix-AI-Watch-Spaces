import mongoose from 'mongoose';

// TimelineEvent Schema for Scene Trivia & Context
const timelineEventSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
  },
  timestampSeconds: {
    type: Number,
    required: true,
  },
  timeFormatted: {
    type: String,
    required: true, // e.g. "00:30"
  },
  title: {
    type: String,
    required: true,
  },
  trivia: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Trivia', 'Behind the Scenes', 'Character Note', 'Plot Hint'],
    default: 'Trivia',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TimelineEvent || mongoose.model('TimelineEvent', timelineEventSchema);
