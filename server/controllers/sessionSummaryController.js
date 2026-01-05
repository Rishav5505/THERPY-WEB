const SessionSummary = require("../models/SessionSummary");
const Booking = require("../models/Booking");
const sendMail = require("../utils/sendMail");

// 🤖 Simulate AI Generation
const generateAISummary = async (booking) => {
    // In a real app, you would pass session transcript to OpenAI/Gemini here
    const doctorName = booking.therapist?.name || "The Therapist";
    const patientName = booking.user?.name || "Patient";

    return {
        summary: `During the session on ${booking.date}, ${patientName} discussed feelings of ${booking.notes || 'general concern'}. We explored various coping mechanisms and focused on grounding techniques.`,
        keyTakeaways: [
            "Identified primary stress triggers in work-life balance.",
            "Discussed the importance of mindfulness during high-stress periods.",
            "Reflected on progress made over the last two weeks."
        ],
        actionItems: [
            "Practice 10-minute box breathing daily.",
            "Maintain a thought journal for at least 3 entries this week.",
            "Prepare specific topics for the next session."
        ]
    };
};

exports.generateSummary = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate("user therapist");

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const aiOutput = await generateAISummary(booking);

        let sessionSummary = await SessionSummary.findOne({ booking: bookingId });

        if (!sessionSummary) {
            sessionSummary = new SessionSummary({
                booking: bookingId,
                therapist: booking.therapist._id,
                patient: booking.user._id,
                ...aiOutput
            });
            await sessionSummary.save();
        }

        res.json(sessionSummary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const { summary, keyTakeaways, actionItems } = req.body;

        const updated = await SessionSummary.findByIdAndUpdate(
            id,
            { summary, keyTakeaways, actionItems },
            { new: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.sendSummaryEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const summaryDoc = await SessionSummary.findById(id).populate("patient therapist");

        if (!summaryDoc) return res.status(404).json({ message: "Summary not found" });

        const emailContent = `
Hello ${summaryDoc.patient.name},

Here is a summary of your therapy session on ${new Date(summaryDoc.createdAt).toLocaleDateString()} with ${summaryDoc.therapist.name}.

Summary:
${summaryDoc.summary}

Key Takeaways:
${summaryDoc.keyTakeaways.map(item => `- ${item}`).join('\n')}

Action Items:
${summaryDoc.actionItems.map(item => `- ${item}`).join('\n')}

We are proud of your progress! See you in the next session.

Warm regards,
MindMend Team
        `;

        await sendMail({
            to: summaryDoc.patient.email,
            subject: `Session Summary - ${new Date(summaryDoc.createdAt).toLocaleDateString()}`,
            text: emailContent
        });

        summaryDoc.status = "sent";
        summaryDoc.sentAt = new Date();
        await summaryDoc.save();

        res.json({ message: "Summary sent to patient email" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPatientSummaries = async (req, res) => {
    try {
        const summaries = await SessionSummary.find({ patient: req.user.id }) // Changed from _id to id
            .populate("therapist")
            .sort("-createdAt");
        res.json(summaries);
    } catch (err) {
        console.error("Fetch summaries error:", err);
        res.status(500).json({ message: err.message });
    }
};
