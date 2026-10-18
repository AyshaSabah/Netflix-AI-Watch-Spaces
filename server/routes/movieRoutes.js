import express from 'express';
import { getAllMovies, getMovieById, getMovieTimelineEvents } from '../controllers/movieController.js';

const router = express.Router();

router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.get('/:id/timeline', getMovieTimelineEvents);

export default router;
