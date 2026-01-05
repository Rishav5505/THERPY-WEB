const Notification = require("../models/Notification");

// ✅ Create and Emit Notification helper
const sendNotification = async (io, { recipient, title, message, type, link, data }) => {
    try {
        const notification = new Notification({
            recipient,
            title,
            message,
            type,
            link,
            data
        });
        await notification.save();

        // 🔔 Real-time push via Socket.IO
        if (io) {
            // Emit to a specific user room (userId)
            io.to(recipient.toString()).emit("notification_received", notification);
            console.log(`📡 Notification sent to user: ${recipient}`);
        }
        return notification;
    } catch (err) {
        console.error("Error sending notification:", err);
    }
};

// ✅ Get Notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// ✅ Mark as Read
exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error updating notification" });
    }
};

// ✅ Mark All as Read
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error updating notifications" });
    }
};

exports.sendNotification = sendNotification;
