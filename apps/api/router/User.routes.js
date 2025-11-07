import express from "express";
import { SignIn, SignUp } from "../controller/user.controller.js";
import { LoginRateLimiter,forgotPasswordRateLimiter } from "../middleware/rateLimit.js";


const router = express.Router()
router.post("/signup", SignUp)
router.post("/signin", LoginRateLimiter, SignIn)

export default router;