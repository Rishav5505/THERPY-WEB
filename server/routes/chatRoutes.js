const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth");
const { sendNotification } = require("../controllers/notificationController");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads/chat");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname || mimetype) {
            return cb(null, true);
        }
        cb(new Error("Invalid file type. Only images and documents are allowed."));
    }
});

// Get all conversations for current user
router.get("/conversations", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const chats = await Chat.find({
            participants: userId,
            isActive: true
        })
            .populate("patient", "name email photoUrl")
            .populate("therapist", "name email photoUrl")
            .sort({ lastMessageAt: -1 });

        res.json(chats);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Error fetching conversations" });
    }
});

// Get or create chat between patient and therapist
router.post("/start", authMiddleware, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUser = req.user;

        if (!targetUserId) {
            return res.status(400).json({ message: "Target user ID is required" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Determine patient and therapist
        let patient, therapist;
        if (currentUser.role === "patient") {
            patient = currentUser.id;
            therapist = targetUserId;
        } else {
            therapist = currentUser.id;
            patient = targetUserId;
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
            patient,
            therapist
        }).populate("patient", "name email photoUrl")
            .populate("therapist", "name email photoUrl");

        if (!chat) {
            // Create new chat
            chat = new Chat({
                participants: [patient, therapist],
                patient,
                therapist,
                messages: []
            });
            await chat.save();
            chat = await Chat.findById(chat._id)
                .populate("patient", "name email photoUrl")
                .populate("therapist", "name email photoUrl");
        }

        res.json(chat);
    } catch (error) {
        console.error("Error starting chat:", error);
        res.status(500).json({ message: "Error starting chat" });
    }
});

// Get messages for a specific chat
router.get("/:chatId/messages", authMiddleware, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        }).populate("messages.sender", "name email photoUrl role");

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Mark messages as read
        chat.messages.forEach(msg => {
            if (!msg.readBy.includes(userId)) {
                msg.readBy.push(userId);
            }
        });
        await chat.save();

        res.json(chat.messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Error fetching messages" });
    }
});

// Send a text message
router.post("/send", authMiddleware, async (req, res) => {
    try {
        const { chatId, content } = req.body;
        const userId = req.user.id;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const newMessage = {
            sender: userId,
            content,
            messageType: "text",
            readBy: [userId],
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = content.substring(0, 100);
        chat.lastMessageAt = new Date();
        await chat.save();

        // Get the saved message with populated sender
        const savedChat = await Chat.findById(chatId)
            .populate("messages.sender", "name email photoUrl role");

        const savedMessage = savedChat.messages[savedChat.messages.length - 1];

        // Emit via Socket.IO
        if (req.io) {
            req.io.to(chatId).emit("new_message", savedMessage);

            // 🔔 Send persistent notification to recipient
            const recipientId = chat.participants.find(p => p.toString() !== userId.toString());
            await sendNotification(req.io, {
                recipient: recipientId,
                title: `New Message from ${savedMessage.sender.name}`,
                message: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
                type: "new_message",
                link: savedMessage.sender.role === "therapist" ? "/patient/chat" : "/therapist/chat",
                data: { chatId }
            });
        }

        res.json(savedMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Error sending message" });
    }
});

// Send file/image message
router.post("/send-file", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const isImage = file.mimetype.startsWith("image/");
        const fileUrl = `/uploads/chat/${file.filename}`;

        const newMessage = {
            sender: userId,
            content: file.originalname,
            messageType: isImage ? "image" : "file",
            fileUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            readBy: [userId],
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = isImage ? "📷 Image" : `📎 ${file.originalname}`;
        chat.lastMessageAt = new Date();
        await chat.save();

        // Get the saved message with populated sender
        const savedChat = await Chat.findById(chatId)
            .populate("messages.sender", "name email photoUrl role");

        const savedMessage = savedChat.messages[savedChat.messages.length - 1];

        // Emit via Socket.IO
        if (req.io) {
            req.io.to(chatId).emit("new_message", savedMessage);

            // 🔔 Send persistent notification to recipient
            const recipientId = chat.participants.find(p => p.toString() !== userId.toString());
            await sendNotification(req.io, {
                recipient: recipientId,
                title: `New File from ${savedMessage.sender.name}`,
                message: isImage ? "📷 Sent an image" : `📎 Sent a file: ${file.originalname}`,
                type: "new_message",
                link: savedMessage.sender.role === "therapist" ? "/patient/chat" : "/therapist/chat",
                data: { chatId }
            });
        }

        res.json(savedMessage);
    } catch (error) {
        console.error("Error sending file:", error);
        res.status(500).json({ message: "Error sending file" });
    }
});

// Send prescription (therapist only)
router.post("/send-prescription", authMiddleware, async (req, res) => {
    try {
        const { chatId, prescription } = req.body;
        const userId = req.user.id;

        // Only therapists can send prescriptions
        if (req.user.role !== "therapist") {
            return res.status(403).json({ message: "Only therapists can send prescriptions" });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const newMessage = {
            sender: userId,
            content: "Prescription",
            messageType: "prescription",
            prescription: {
                ...prescription,
                prescribedAt: new Date()
            },
            readBy: [userId],
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = "📋 Prescription sent";
        chat.lastMessageAt = new Date();
        await chat.save();

        // Get the saved message with populated sender
        const savedChat = await Chat.findById(chatId)
            .populate("messages.sender", "name email photoUrl role");

        const savedMessage = savedChat.messages[savedChat.messages.length - 1];

        // Emit via Socket.IO
        if (req.io) {
            req.io.to(chatId).emit("new_message", savedMessage);

            // 🔔 Send persistent notification to recipient
            const recipientId = chat.participants.find(p => p.toString() !== userId.toString());
            await sendNotification(req.io, {
                recipient: recipientId,
                title: "New Prescription 📋",
                message: `Dr. ${savedMessage.sender.name} has sent you a new prescription.`,
                type: "new_message",
                link: "/patient/chat",
                data: { chatId }
            });
        }

        res.json(savedMessage);
    } catch (error) {
        console.error("Error sending prescription:", error);
        res.status(500).json({ message: "Error sending prescription" });
    }
});

// Get list of users to chat with (based on bookings)
router.get("/available-users", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let users = [];

        if (userRole === "patient") {
            // Get therapists from patient's bookings
            const bookings = await Booking.find({ user: userId }).distinct("therapist");
            console.log("Patient Bookings (therapist IDs):", bookings);

            const therapists = await User.find({
                _id: { $in: bookings },
                role: "therapist"
            }).select("name email photoUrl");
            console.log("Matched Therapists:", therapists.length);

            users = therapists;
        } else {
            // Get patients from therapist's bookings
            const bookings = await Booking.find({ therapist: userId }).distinct("user");
            console.log("Therapist Bookings (patient IDs):", bookings);

            const patients = await User.find({
                _id: { $in: bookings },
                role: "patient"
            }).select("name email photoUrl");
            console.log("Matched Patients:", patients.length);

            users = patients;
        }

        res.json(users);
    } catch (error) {
        console.error("Error fetching available users:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
});

// Mark messages as read
router.put("/:chatId/read", authMiddleware, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        chat.messages.forEach(msg => {
            if (!msg.readBy.includes(userId)) {
                msg.readBy.push(userId);
            }
        });
        await chat.save();

        res.json({ message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ message: "Error updating read status" });
    }
});

// Get unread count
router.get("/unread-count", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const chats = await Chat.find({
            participants: userId,
            isActive: true
        });

        let unreadCount = 0;
        chats.forEach(chat => {
            chat.messages.forEach(msg => {
                if (!msg.readBy.includes(userId) && msg.sender.toString() !== userId.toString()) {
                    unreadCount++;
                }
            });
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error("Error getting unread count:", error);
        res.status(500).json({ message: "Error getting unread count" });
    }
});

module.exports = router;
