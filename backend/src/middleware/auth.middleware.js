const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authmiddleware(req, res, next) {
  // ✅ read from Authorization header instead of cookies
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: "Unauthorised Access",
    });
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = authmiddleware;
