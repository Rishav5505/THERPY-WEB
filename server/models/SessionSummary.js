const mongoose = require("mongoose");

const sessionSummarySchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    summary: { type: String, required: true },
    keyTakeaways: [String],
    actionItems: [String],
    sentAt: { type: Date },
    status: { type: String, enum: ["draft", "sent"], default: "draft" }
}, { timestamps: true });

module.exports = mongoose.model("SessionSummary", sessionSummarySchema);
