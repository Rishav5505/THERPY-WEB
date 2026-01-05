const Booking = require("../models/Booking");
const { sendNotification } = require("./notificationController");
const { awardPoints, incrementSessions } = require("./gamificationController");

// ✅ Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { therapistId, date, time } = req.body;
    const userId = req.user.id;

    const booking = new Booking({ user: userId, therapist: therapistId, date, time });
    await booking.save();

    const populatedBooking = await booking.populate("user", "name email photoUrl");

    // 🔔 PERSISTENT & REAL-TIME NOTIFICATION for Doctor
    await sendNotification(req.io, {
      recipient: therapistId,
      title: "New Booking Request",
      message: `${populatedBooking.user.name} has requested a session on ${date} at ${time}`,
      type: "booking_request",
      link: "/therapist/appointments",
      data: { bookingId: booking._id }
    });

    res.status(201).json({ message: "Booking created", booking: populatedBooking });
  } catch (err) {
    console.error("Booking create error:", err);
    res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
};

// ✅ Patient's Bookings
exports.getPatientBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("therapist", "_id name email photoUrl specializations");

    res.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// ✅ Therapist's Bookings
exports.getTherapistBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ therapist: req.user.id })
      .populate("user", "_id name email photoUrl");

    res.json(bookings);
  } catch (err) {
    console.error("Therapist bookings error:", err);
    res.status(500).json({ message: "Failed to fetch therapist bookings" });
  }
};

// ✅ Update Booking Status (Accept/Reject)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    const booking = await (await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )).populate("therapist", "name");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🎖️ GAMIFICATION: Award points for completed session
    if (status === "completed") {
      await awardPoints(booking.user, 50, "completing a session", req.io);
      await incrementSessions(booking.user, req.io);
    }

    // 🔔 PERSISTENT & REAL-TIME NOTIFICATION for Patient
    let title = "Booking Update";
    let message = `Your session status has been updated to ${status}`;

    if (status === "confirmed") {
      title = "Booking Confirmed! ✅";
      message = `Dr. ${booking.therapist.name} has confirmed your session for ${booking.date} at ${booking.time}`;
    } else if (status === "rejected") {
      title = "Booking Declined ❌";
      message = `Dr. ${booking.therapist.name} is unavailable for the requested slot.`;
    }

    await sendNotification(req.io, {
      recipient: booking.user,
      title: title,
      message: message,
      type: status === "confirmed" ? "booking_confirmed" : "system",
      link: "/patient/book",
      data: { bookingId: booking._id }
    });

    res.json(booking);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};

// ✅ Add Review (For Patient)
exports.addBookingReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Can only review completed sessions" });
    }

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    res.json({ message: "Review submitted successfully", booking });
  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ message: "Failed to submit review" });
  }
};
