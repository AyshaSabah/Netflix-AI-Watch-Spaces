import WatchRoom from '../models/WatchRoom.js';
import Movie from '../models/Movie.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

// Generate short readable room ID e.g. "NETFLIX-7482"
const generateRoomId = () => {
  const letters = ['SPACE', 'NETFLIX', 'PARTY', 'CHILL', 'STREAM', 'CINEMA'];
  const prefix = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
};

// Create a new watch room
export const createRoom = async (req, res) => {
  try {
    const { movieId, roomName, hostId, hostName } = req.body;

    if (!movieId) {
      return res.status(400).json({ error: 'Movie ID is required to create a watch space.' });
    }

    // Look up movie details
    let movie = inMemoryStore.getMovieById(movieId);
    if (!movie && getIsMongoConnected()) {
      try {
        movie = await Movie.findById(movieId).lean();
      } catch (err) {
        // Ignored
      }
    }

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const roomId = generateRoomId();
    const finalRoomName = roomName && roomName.trim() ? roomName.trim() : `${movie.title} Party 🍿`;

    const roomPayload = {
      roomId,
      name: finalRoomName,
      movieId: movie.id || movie._id,
      movieTitle: movie.title,
      movieThumbnail: movie.thumbnailUrl,
      videoUrl: movie.videoUrl,
      hostId: hostId || 'host-1',
      hostName: hostName || 'Watch Host',
      isPlaying: false,
      currentTime: 0,
      activeUsersCount: 1,
    };

    const newRoomInMem = inMemoryStore.createRoom(roomPayload);

    // Also attempt MongoDB save if connected
    if (getIsMongoConnected()) {
      try {
        await WatchRoom.create(roomPayload);
      } catch (err) {
        // Safe to ignore mongo error
      }
    }

    return res.status(201).json({
      message: 'Watch space created successfully!',
      room: newRoomInMem,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ error: 'Failed to create watch space.' });
  }
};

// Get all active rooms
export const getAllRooms = async (req, res) => {
  try {
    let rooms = [];
    if (getIsMongoConnected()) {
      try {
        rooms = await WatchRoom.find().sort({ createdAt: -1 }).lean();
      } catch (err) {
        // Ignored
      }
    }

    if (!rooms || rooms.length === 0) {
      rooms = inMemoryStore.getAllRooms();
    }

    return res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    return res.status(500).json({ error: 'Failed to fetch rooms.' });
  }
};

// Get room details by roomId
export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const cleanRoomId = roomId.toUpperCase();

    let room = inMemoryStore.getRoomById(cleanRoomId);
    if (!room && getIsMongoConnected()) {
      try {
        room = await WatchRoom.findOne({ roomId: cleanRoomId }).lean();
      } catch (err) {
        // Ignored
      }
    }

    if (!room) {
      return res.status(404).json({ error: `Watch room "${roomId}" was not found.` });
    }

    // Attach movie details if needed
    const movie = inMemoryStore.getMovieById(room.movieId);

    return res.json({
      room,
      movie: movie || null,
    });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({ error: 'Failed to fetch room details.' });
  }
};
