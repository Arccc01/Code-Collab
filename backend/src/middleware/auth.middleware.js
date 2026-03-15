const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authmiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({
      message: "Unauthorised Access",
    });
  }

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
