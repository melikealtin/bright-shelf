import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer", "");

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(401).json({ message: "Token is not valid" });

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default authenticateUser;
