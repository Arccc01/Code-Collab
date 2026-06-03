const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function userRegister(req, res) {
  const {
    email,
    fullname: { firstname, lastname },
    username,
    password,
  } = req.body;
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return res.status(400).send({
      message: "user already exists",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new userModel({
    email,
    fullname: {
      firstname,
      lastname,
    },
    username,
    password: hashedPassword,
  });

  await user.save();
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
    },
    process.env.JWT_SECRET,
  );
  res.cookie("token", token, {
  httpOnly: true,
  sameSite: "lax",
  secure: false,        // false for localhost
});
  res
    .status(201)
    .json({ message: "User registered successfully", token, user });
}

async function userlogin(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
    },
    process.env.JWT_SECRET,
  );
  res.cookie("token", token);
  res.status(200).json({
    token,
    user: {
      message: "Login successful",
      email: user.email,
      username: user.username,
      fullname: user.fullname,
    },
  });
}

async function userlogout(req, res) {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logout successful",
  });
}

async function redirectController(req, res){
    const user = req.user;

    // Sign JWT with same payload as normal login
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Redirect to frontend with token in URL
    // Frontend will read it and store in localStorage
    res.redirect(`${process.env.VITE_URL}/auth/callback?token=${token}`);
  }

module.exports = { userRegister, userlogin, userlogout,redirectController };
