import express from 'express';
import { ProtectedRoute } from '../middleware/protected.js';
import { generateProjectDocs, getProjectDocs } from '../controller/document.controller.js';


const router = express.Router()


router.post('/projects/:projectId/docs/generate', ProtectedRoute, generateProjectDocs)
router.get('/projects/:projectId/docs', ProtectedRoute, getProjectDocs
)

export default router