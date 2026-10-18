import mongoose from 'mongoose';

// WatchRoom Schema for Active Social Rooms
const watchRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
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
  },
  videoUrl: {
    type: String,
    required: true,
  },
  hostId: {
    type: String,
    required: true,
  },
  hostName: {
    type: String,
    required: true,
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
  currentTime: {
    type: Number,
    default: 0,
  },
  activeUsersCount: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.WatchRoom || mongoose.model('WatchRoom', watchRoomSchema);
