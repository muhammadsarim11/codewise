import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { generateToken } from "../utility/jwt.js";
import { sendEmail } from "../services/nodemailer.js";
import {
  savePendingSignup,
  getPendingSignup,
  recordFailedAttempt,
  clearPendingSignup,
  MAX_ATTEMPTS,
} from "../services/pendingSignup.service.js";
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  accessCookieOptions,
  refreshCookieOptions,
  clearCookieOptions,
} from "../utility/cookies.js";

// crypto.randomInt is a CSPRNG; Math.random() (used elsewhere in this file for
// the password-reset OTP) is not, and there's no reason to guess weaker here.
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

// Every user query that reaches a response body uses this allow-list. Never
// return a bare findUnique: the row carries the password hash, the refresh
// token, and a live password-reset OTP.
const PUBLIC_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  bio: true,
  role: true,
  createdAt: true,
};

// Mints a fresh token pair, persists the refresh token, and writes both cookies.
// Used by sign-in and by refresh, so rotation behaves identically in both.
const issueSession = async (req, res, user) => {
  const accessToken = generateToken(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = generateToken(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.cookie("accessToken", accessToken, accessCookieOptions(req));
  res.cookie("refreshToken", refreshToken, refreshCookieOptions(req));

  return accessToken;
};

// Sends the OTP but does not touch Postgres. The account is only created once
// VerifySignupOtp confirms the code, so an abandoned or mistyped signup never
// leaves a half-created user behind and never blocks the email for a retry.
export const SignUp = async (req, res) => {
  try {
    const { name, email, bio, password } = req.body;

    if (!(name && email && bio && password)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [existingUser, hashedPassword] = await Promise.all([
      prisma.User.findUnique({ where: { email } }),
      bcrypt.hash(password, 8),
    ]);

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const otp = generateOtp();
    await savePendingSignup(email, { name, bio, hashedPassword, otp });

    sendEmail(
      email,
      "Verify your email — CodeWise",
      `Your CodeWise verification code is ${otp}. It expires in 10 minutes.`
    ).catch((err) => console.error('Failed to send signup verification email:', err));

    return res.status(200).json({
      message: "We sent a verification code to your email.",
      email,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const VerifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!(email && otp)) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const pending = await getPendingSignup(email);
    if (!pending) {
      return res.status(400).json({
        error: "That code has expired or was never issued. Please sign up again.",
      });
    }

    if (pending.otp !== otp) {
      const { locked } = await recordFailedAttempt(email, pending);
      if (locked) {
        return res.status(429).json({
          error: `Too many incorrect attempts (max ${MAX_ATTEMPTS}). Please sign up again.`,
        });
      }
      return res.status(400).json({ error: "Incorrect code." });
    }

    // Email is unique on the User table: guard against a duplicate signup
    // racing this one to completion while the OTP was outstanding.
    const alreadyExists = await prisma.User.findUnique({ where: { email } });
    if (alreadyExists) {
      await clearPendingSignup(email);
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await prisma.User.create({
      data: {
        name: pending.name,
        email,
        bio: pending.bio,
        password: pending.hashedPassword,
      },
      select: { id: true, name: true, email: true, bio: true, role: true, createdAt: true },
    });

    await clearPendingSignup(email);

    const accessToken = await issueSession(req, res, user);

    return res.status(201).json({
      message: "Account created successfully",
      user,
      accessToken,
    });
  } catch (err) {
    console.error("Verify Signup OTP Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const ResendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const pending = await getPendingSignup(email);
    if (!pending) {
      return res.status(400).json({
        error: "No pending signup found for this email. Please sign up again.",
      });
    }

    const otp = generateOtp();
    await savePendingSignup(email, { ...pending, otp });

    sendEmail(
      email,
      "Your new CodeWise verification code",
      `Your CodeWise verification code is ${otp}. It expires in 10 minutes.`
    ).catch((err) => console.error('Failed to send resent verification email:', err));

    return res.status(200).json({ message: "We sent a new verification code to your email." });
  } catch (err) {
    console.error("Resend Signup OTP Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const SignIn = async (req, res) => {
  try {
    // 1. Input Validation
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    // 2. Find User (with selected fields only)
    const user = await prisma.User.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true, // needed for comparison
        name: true,
        bio: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // 3. Verify Password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    const accessToken = await issueSession(req, res, user);

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      // Transitional: the session now lives in httpOnly cookies. This field is
      // kept for one release so clients still holding a bearer token keep
      // working, and should be dropped once the frontend stops reading it.
      accessToken,
    });
  }
  catch (error) {
    console.error('SignIn Error:', error);
    return res.status(500).json({
      success: false,
      error: "An error occurred during sign in"
    });
  }
};



/**
 * Exchanges a valid refresh token for a fresh pair. The token is rotated on
 * every use, so a stolen refresh cookie is good for at most one call, and the
 * theft surfaces the next time the real user refreshes and is rejected.
 */
export const refreshSession = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, error: "No refresh token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: "Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, refreshToken: true },
    });

    // A mismatch means the token was already rotated away, or revoked by
    // logout, so it is no longer a live session even though it still verifies.
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, error: "Invalid refresh token" });
    }

    const accessToken = await issueSession(req, res, user);

    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    console.error('Refresh Error:', error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Clears the session in the browser and server-side. Always 204: logging out of
 * an already-dead session is not a failure.
 */
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await prisma.user.updateMany({
          where: { id: decoded.id },
          data: { refreshToken: null },
        });
      } catch {
        // Expired or forged token: nothing to revoke, but still clear cookies.
      }
    }

    res.clearCookie("accessToken", clearCookieOptions(req));
    res.clearCookie("refreshToken", clearCookieOptions(req));

    return res.status(204).send();
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


export const forgotPassword = async (req, res) => {

  try {
    const { email } = req.body
    if (!email) {
      return res.status(404).json({
        message: "email is required!"
      })
    }
    // generate otp and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    
    await prisma.User.updateMany({
      where: { email },
      data: { otpCode: otp, otpExpiry: expiry },
    });

    // send email asynchronously; do not leak email send errors to the client
    sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP code is ${otp}. It will expire in 10 minutes.`
    ).catch((err) => console.error('Failed to send password reset email:', err));

    return res.status(200).json({
      message: "If an account with that email exists, a password reset OTP has been sent."
    })

  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
}



export const resetPassword = async (req, res) => {

  try {
    const { email, otp, newpassword } = req.body

    if (!(email && otp && newpassword)) {
      return res.status(404).json({
        message: "all fields are required"
      })


    }
 
    const hashed = await bcrypt.hash(newpassword, 8);

  
    const result = await prisma.User.updateMany({
      where: {
        email,
        otpCode: otp,
        otpExpiry: { gt: new Date() },
      },
      data: {
        password: hashed,
        otpCode: null,
        otpExpiry: null,
        refreshToken: null, 
      },
    });

    if (result.count === 0) {
      return res.status(400).json({ message: "invalid otp or otp expired" });
    }

    return res.status(200).json({ message: "password reset successful" });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error"
    })
  }

}


export const getUser = async (req, res) => {
  try {
    const id = req.user.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER_FIELDS,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
