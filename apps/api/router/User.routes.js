import express from "express";
import { forgotPassword, resetPassword, SignIn, SignUp } from "../controller/user.controller.js";
import { LoginRateLimiter,forgotPasswordRateLimiter } from "../middleware/rateLimit.js";


const router = express.Router()
router.post("/signup", SignUp)
router.post("/signin", LoginRateLimiter, SignIn)
router.post("/forgot-password",forgotPasswordRateLimiter,forgotPassword)
router.post("/reset-password",resetPassword)

export default router;