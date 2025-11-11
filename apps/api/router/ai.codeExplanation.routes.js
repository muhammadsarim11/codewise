import express from 'express';
import { createExplanation,  getExplanation,  getPublicExplanation, shareExplanation } from '../controller/code.explainer.controller.js';
import { ProtectedRoute } from '../middleware/protected.js';
import { uploadMiddleware } from '../middleware/multer.js';
import { explanationLimiter } from '../middleware/rateLimit.js';


const router = express.Router();


router.post('/explainations',ProtectedRoute, explanationLimiter
    ,uploadMiddleware, createExplanation)
    router.patch("/explainations/:id/share",ProtectedRoute,shareExplanation)

    router.get("/share/:shareId",getPublicExplanation)
router.get("/explainations/:id",ProtectedRoute,getExplanation)
export default router