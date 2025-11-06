import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utility/jwt.js";

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