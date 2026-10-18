import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import TimelineEvent from '../models/TimelineEvent.js';
import { initialMovies } from './inMemoryStore.js';

let isMongoConnected = false;

// Disable Mongoose command buffering so queries never hang when not connected
mongoose.set('bufferCommands', false);

export const getIsMongoConnected = () => isMongoConnected;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️  No MONGODB_URI provided in environment. Using robust in-memory database store.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB successfully via Mongoose.');

    // Seed initial movies if database is empty
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('🌱 Seeding initial movies and timeline events into MongoDB...');
      for (const m of initialMovies) {
        const createdMovie = await Movie.create({
          title: m.title,
          description: m.description,
          genre: m.genre,
          duration: m.duration,
          thumbnailUrl: m.thumbnailUrl,
          videoUrl: m.videoUrl,
          releaseYear: m.releaseYear,
          rating: m.rating,
          director: m.director,
          cast: m.cast,
          timelineTrivia: m.timelineTrivia,
        });

        if (m.timelineTrivia && m.timelineTrivia.length > 0) {
          for (const t of m.timelineTrivia) {
            await TimelineEvent.create({
              movieId: createdMovie._id.toString(),
              timestampSeconds: t.timestamp,
              timeFormatted: t.timeFormatted,
              title: t.title,
              trivia: t.trivia,
              category: t.category,
            });
          }
        }
      }
      console.log('✅ MongoDB movie seed complete.');
    }

    return true;
  } catch (error) {
    console.warn('⚠️  Could not connect to MongoDB:', error.message);
    console.log('ℹ️  Falling back gracefully to in-memory database store. All features will work smoothly!');
    isMongoConnected = false;
    return false;
  }
};

export const getDbStatus = () => {
  return {
    isMongoConnected,
    mode: isMongoConnected ? 'MongoDB (Mongoose)' : 'In-Memory Store (Auto Fallback)',
  };
};
