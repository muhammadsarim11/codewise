import express from "express";
import { forgotPassword, getUser, logout, refreshSession, resetPassword, ResendSignupOtp, SignIn, SignUp, VerifySignupOtp } from "../controller/user.controller.js";
import { LoginRateLimiter, forgotPasswordRateLimiter, signupRateLimiter, verifyOtpRateLimiter } from "../middleware/rateLimit.js";
import { ProtectedRoute } from "../middleware/protected.js";


const router = express.Router()
router.post("/signup", signupRateLimiter, SignUp)
router.post("/verify-signup", verifyOtpRateLimiter, VerifySignupOtp)
router.post("/resend-signup-otp", signupRateLimiter, ResendSignupOtp)
router.post("/signin", LoginRateLimiter, SignIn)
router.post("/auth/refresh", refreshSession)
router.post("/auth/logout", logout)
router.post("/forgot-password",forgotPasswordRateLimiter,forgotPassword)
router.post("/reset-password",resetPassword)
router.get("/profile", ProtectedRoute, getUser)

export default router;
