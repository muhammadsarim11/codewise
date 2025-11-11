import express from 'express';
import { createExplanation } from '../controller/code.explainer.controller.js';
import { ProtectedRoute } from '../middleware/protected.js';
import { uploadMiddleware } from '../middleware/multer.js';
import { explanationLimiter } from '../middleware/rateLimit.js';


const router = express.Router();


router.post('/explain-code',ProtectedRoute, explanationLimiter
    ,uploadMiddleware, createExplanation)

export default router