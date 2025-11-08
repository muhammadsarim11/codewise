import express from 'express'
import { CreateProject, DeleteProject, EditProject, getProject } from '../controller/project.controller.js'
import { ProtectedRoute } from '../middleware/protected.js'



const router = express.Router()

router.post("/create", ProtectedRoute, CreateProject)
router.put("/edit/:id", ProtectedRoute, EditProject)
router.get("/get", ProtectedRoute, getProject)
router.delete("/delete/:id", ProtectedRoute, DeleteProject)


export default router