import express from 'express';
import { 
    createSession, 
    getSessions, 
    getHistory, 
    sendMessage 
} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(authMiddleware);

router.post('/sessions', createSession);
router.get('/sessions', getSessions);
router.get('/history/:sessionId', getHistory);
router.post('/', sendMessage);

export default router;
