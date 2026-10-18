import express from 'express';
import { createRoom, getAllRooms, getRoomById } from '../controllers/roomController.js';

const router = express.Router();

router.post('/', createRoom);
router.get('/', getAllRooms);
router.get('/:roomId', getRoomById);

export default router;
