import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utility/jwt.js";
import { sendEmail } from "../services/nodemailer.js";

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

    const user = await prisma.User.create({
      data: { name, email, bio, password: hashedPassword },
      select: { id: true, name: true, email: true, bio: true, createdAt: true },
    });

    return res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error("Signup Error:", err);
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

    const accessToken = generateToken(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = generateToken(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Optional: Store refresh token in DB (good for security)
    await prisma.User.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // 🧈 Send refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
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

    // Use a single DB operation: updateMany will update if user exists and return count
    // We intentionally do not reveal whether the email exists — always return a generic response
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
    // Hash new password first (do CPU work before DB op)
    const hashed = await bcrypt.hash(newpassword, 8);

    // Perform verification + update in a single DB call to reduce roundtrips.
    // updateMany will update if there's a matching user (email + otp + not expired).
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
        refreshToken: null, // optionally invalidate refresh tokens
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
