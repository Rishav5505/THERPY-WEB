const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String },
    messageType: {
        type: String,
        enum: ["text", "file", "image", "prescription"],
        default: "text"
    },
    fileUrl: { type: String }, // For file/image attachments
    fileName: { type: String }, // Original file name
    fileType: { type: String }, // MIME type
    prescription: {
        medications: [{
            name: String,
            dosage: String,
            frequency: String,
            duration: String,
            instructions: String
        }],
        diagnosis: String,
        notes: String,
        prescribedAt: { type: Date, default: Date.now }
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [messageSchema],
    lastMessage: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for faster queries
chatSchema.index({ patient: 1, therapist: 1 });
chatSchema.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);
