import WatchHistory from '../models/WatchHistory.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

// Get watch history for user
export const getUserWatchHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    let history = [];
    if (getIsMongoConnected()) {
      try {
        history = await WatchHistory.find({ userId }).sort({ lastWatchedAt: -1 }).lean();
      } catch (err) {
        // Ignored
      }
    }

    if (!history || history.length === 0) {
      history = inMemoryStore.getUserHistory(userId);
    }

    return res.json({ history });
  } catch (error) {
    console.error('Get watch history error:', error);
    return res.status(500).json({ error: 'Failed to fetch watch history.' });
  }
};

// Record or update watch history
export const updateWatchHistory = async (req, res) => {
  try {
    const { userId, movieId, movieTitle, movieThumbnail, movieGenre, progressSeconds, durationSeconds } = req.body;

    if (!userId || !movieId) {
      return res.status(400).json({ error: 'userId and movieId are required.' });
    }

    const updated = inMemoryStore.updateWatchHistory(userId, {
      movieId,
      movieTitle,
      movieThumbnail,
      movieGenre,
      progressSeconds,
      durationSeconds,
    });

    if (getIsMongoConnected()) {
      try {
        await WatchHistory.findOneAndUpdate(
          { userId, movieId },
          {
            userId,
            movieId,
            movieTitle,
            movieThumbnail,
            movieGenre,
            progressSeconds,
            durationSeconds,
            lastWatchedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        // Ignored
      }
    }

    return res.json({ historyItem: updated });
  } catch (error) {
    console.error('Update watch history error:', error);
    return res.status(500).json({ error: 'Failed to update watch history.' });
  }
};
