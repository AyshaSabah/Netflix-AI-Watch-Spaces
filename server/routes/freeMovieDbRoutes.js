import express from 'express';
import {
  search,
  justwatch,
  getPhoto,
  getMediaInfo,
  getTrending,
  importMovie,
} from '../controllers/freeMovieDbController.js';

const router = express.Router();

/**
 * Free Movie DB API (The Free Movie Database API - Swagger Specification 2.0)
 */

// 1. GET /api/imdb/search?q={query}&tt={imdbId}&lsn={season}&v={version}
router.get('/search', search);

// 2. GET /api/imdb/justwatch?q={query}&L={langCountry}
router.get('/justwatch', justwatch);

// 3. GET /api/imdb/photo/:id?w={width}&h={height}
router.get('/photo/:id', getPhoto);

// 4. GET /api/imdb/media/:id
router.get('/media/:id', getMediaInfo);

// 5. GET /api/imdb/trending?category={movies|series|anime|all}
router.get('/trending', getTrending);

// 6. POST /api/imdb/import
router.post('/import', importMovie);

export default router;
