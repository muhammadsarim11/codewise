import prisma from "../config/prisma.js"
import bcrypt from "bcryptjs"
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