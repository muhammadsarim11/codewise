import express from "express";
import { forgotPassword, getUser, resetPassword, SignIn, SignUp } from "../controller/user.controller.js";
import { LoginRateLimiter,forgotPasswordRateLimiter } from "../middleware/rateLimit.js";
import { ProtectedRoute } from "../middleware/protected.js";


const router = express.Router()
router.post("/signup", SignUp)
router.post("/signin", LoginRateLimiter, SignIn)
router.post("/forgot-password",forgotPasswordRateLimiter,forgotPassword)
router.post("/reset-password",resetPassword)
router.get("/profile", ProtectedRoute, getUser)

export default router;