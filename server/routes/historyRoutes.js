import express from 'express';
import { getUserWatchHistory, updateWatchHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/:userId', getUserWatchHistory);
router.post('/', updateWatchHistory);

export default router;
