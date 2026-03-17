const express = require("express");
const app = express();
const userRoutes = require("./router/user.routes");
const sessionRoutes = require("./router/session.routes.js");
const aiRoutes = require("./router/ai.routes.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin:process.env.VITE_URL,credentials:true}));
app.use("/auth", userRoutes);
app.use("/sessions", sessionRoutes);
app.use("/ai", aiRoutes);

module.exports = app;
