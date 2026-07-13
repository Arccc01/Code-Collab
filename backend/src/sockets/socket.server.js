require("dotenv").config();
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const sessionModel = require("../models/session.model");
const messageModel = require("../models/message.model");

function initsocketserver(httpServer) {
   const io = new Server(httpServer, {})

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      next(new Error("Authentication Error:No token provided"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) {
      return next(new Error("Authentication Error: User not found"))
    }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication Error:Invalid token"));
    }
  });

  // ─── Debounce Map (declare this inside initializeSocket, outside io.on) ───────
  const debounceTimers = new Map();

  io.on("connection", (socket) => {
    //join session
    socket.on("join-session", async (sessionId) => {
      try {
        // 1. Join the socket room
        socket.join(sessionId);

        // 2. Store sessionId on socket for disconnect handler
        socket.currentSession = sessionId;

        // 3. Add user to participants in MongoDB (no duplicates)
        await sessionModel.findOneAndUpdate(
          { sessionId },
          { $addToSet: { participants: socket.user._id } },
          { returnDocument: "after" },
        );

        // 4. Notify everyone else in the room
        socket.to(sessionId).emit("user-joined", {
          userId: socket.user._id,
          username: socket.user.username,
        });


        const session = await sessionModel.findOne({ sessionId });
        if (session) {
          socket.emit("session-state", {
            code: session.code,
            language: session.language,
          });
        }

      } catch (err) {
        console.error("join-session error:", err);
        socket.emit("error", { message: "Failed to join session" });
      }
    });

    // ─── Leave Session ─────────────────────────────────────────────────────
    socket.on("leave-session", (sessionId) => {
      try {
        // 1. Leave the socket room
        socket.leave(sessionId);

        // 2. Clear stored session
        socket.currentSession = null;

        // 3. Notify everyone remaining in the room
        socket.to(sessionId).emit("user-left", {
          userId: socket.user._id,
          username: socket.user.username,
        });

        
      } catch (err) {
        console.error("leave-session error:", err);
        socket.emit("error", { message: "Failed to leave session" });
      }
    });

    socket.on("disconnect", () => {
      try {
        const sessionId = socket.currentSession;

        // Only notify if user was in a session
        if (sessionId) {
          socket.to(sessionId).emit("user-left", {
            userId: socket.user._id,
            username: socket.user.username,
          });

          
        }
      } catch (err) {
        console.error("disconnect error:", err);
      }
    });

    socket.on("code-change", async ({ sessionId, newCode }) => {
      try {
        // 1. Instantly broadcast to everyone else in the room
        socket.to(sessionId).emit("code-update", { code: newCode });

        // 2. Debounced DB save — only saves after user stops typing for 1.5s
        if (debounceTimers.has(sessionId)) {
          clearTimeout(debounceTimers.get(sessionId));
        }

        const timer = setTimeout(async () => {
          await sessionModel.findOneAndUpdate(
            { sessionId },
            { code: newCode },
            { returnDocument: true },
          );
          debounceTimers.delete(sessionId);
        }, 1500);

        debounceTimers.set(sessionId, timer);
      } catch (err) {
        console.error("code-change error:", err);
        socket.emit("error", { message: "Failed to sync code" });
      }
    });

    socket.on("language-change", async ({ sessionId, language }) => {
      try {
        // 1. Instantly broadcast to everyone else in the room
        socket.to(sessionId).emit("language-update", { language });

        // 2. Save to DB immediately — language changes are infrequent
        await sessionModel.findOneAndUpdate({ sessionId }, { language });

      } catch (err) {
        console.error("language-change error:", err);
        socket.emit("error", { message: "Failed to sync language" });
      }
    });

    socket.on("send-message", async ({ sessionId, content }) => {
      try {
        if (!content || content.trim() === "") {
          return socket.emit("error", { message: "Message cannot be empty" });
        }
        const newMessage = new messageModel({
          sessionId,
          sender: socket.user._id,
          content,
        });
        await newMessage.save();
        const populatedMessage = await newMessage.populate(
          "sender",
          "email username",
        );
        io.to(sessionId).emit("receive-message", ({
          _id: populatedMessage._id,
          sessionId: populatedMessage.sessionId,
          content: populatedMessage.content,
          sender: populatedMessage.sender,
          createdAt: populatedMessage.createdAt,
        } ));


      } catch (err) {
        socket.emit("error", { message: "failed to send message" });
      }
    });
    // ─── Share peerId with room when user joins ────────────────────────────────
      socket.on('peer-ready', ({ sessionId, peerId }) => {
        socket.to(sessionId).emit('user-peer-ready', {
          userId: socket.user._id,
          peerId,
        })
})
  });
}

module.exports = initsocketserver;
