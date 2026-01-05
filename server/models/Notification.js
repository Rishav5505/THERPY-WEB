const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ["booking_request", "booking_confirmed", "session_reminder", "new_message", "system"],
        required: true
    },
    read: { type: Boolean, default: false },
    link: { type: String }, // Optional link to redirect user
    data: { type: Object }, // Additional metadata (like bookingId)
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
