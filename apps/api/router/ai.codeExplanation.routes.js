import express from 'express';
import { createExplanation } from '../controller/code.explainer.controller.js';
import { ProtectedRoute } from '../middleware/protected.js';
import { uploadMiddleware } from '../middleware/multer.js';


const router = express.Router();


router.post('/explain-code',ProtectedRoute,uploadMiddleware, createExplanation)

export default router