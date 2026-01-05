const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contact");
const moodRoutes = require("./routes/mood");
const bookingRoutes = require("./routes/bookingRoutes");
const forumRoutes = require("./routes/forumRoutes");
const patientRoutes = require("./routes/patientRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const sessionNotesRoutes = require("./routes/sessionNotes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://mind-mend-final.vercel.app"],
    methods: ["GET", "POST"],
  },
});

// ✅ Attach IO to Request for Controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/session-notes", sessionNotesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/session-summaries", require("./routes/sessionSummaryRoutes"));

// 🕒 BACKGROUND SCHEDULER for Session Reminders
const Booking = require("./models/Booking");
const { sendNotification } = require("./controllers/notificationController");

setInterval(async () => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const upcomingSessions = await Booking.find({
      status: "confirmed",
      date: todayStr,
      reminderSent: { $ne: true }
    });

    for (const session of upcomingSessions) {
      const [hours, minutes] = session.time.split(':').map(Number);
      const sessionTime = new Date(now);
      sessionTime.setHours(hours, minutes, 0, 0);

      const diff = (sessionTime - now) / 60000;

      if (diff > 0 && diff <= 30) {
        await sendNotification(io, {
          recipient: session.user,
          title: "Session Reminder 🔔",
          message: `Your therapy session starts in ${Math.round(diff)} minutes!`,
          type: "session_reminder",
          link: "/patient"
        });

        await sendNotification(io, {
          recipient: session.therapist,
          title: "Upcoming Session ⏳",
          message: `You have a session starting in ${Math.round(diff)} minutes.`,
          type: "session_reminder",
          link: "/therapist/appointments"
        });

        session.reminderSent = true;
        await session.save();
      }
    }
  } catch (err) {
    console.error("Scheduler Error:", err);
  }
}, 5 * 60000);

// 💬 Socket.IO Events
const ForumMessage = require("./models/ForumMessage");

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // ✅ Forum Messaging
  socket.on("sendMessage", async (data) => {
    try {
      const { message, username } = data;
      const newMessage = new ForumMessage({ message, username: username || "Anonymous" });
      await newMessage.save();

      // Broadcast to EVERYONE (including sender if we want, but client handles own state usually)
      socket.broadcast.emit("receiveMessage", {
        text: message,
        user: username || "Anonymous",
        id: newMessage._id,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      console.error("Forum socket error:", err);
    }
  });

  // ✅ Important: Join user to their private room for targeted notifications
  socket.on("join_user", (userId) => {
    socket.join(userId);
    console.log(`🏠 User ${userId} joined their notification room`);
  });

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
  });

  socket.on("send_message", (data) => {
    socket.to(data.chatId).emit("new_message", data);
  });

  socket.on("typing_start", (data) => {
    socket.to(data.chatId).emit("user_typing", { userId: data.userId, name: data.name });
  });

  socket.on("typing_stop", (data) => {
    socket.to(data.chatId).emit("user_stopped_typing", { userId: data.userId });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/mindmend")
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

app.get("/", (req, res) => {
  res.send("MindMend Backend Running ✅");
});
