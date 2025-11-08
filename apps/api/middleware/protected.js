import jwt from 'jsonwebtoken'

export const ProtectedRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Access Denied. No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid Token" });
  }
};