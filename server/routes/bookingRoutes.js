const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createBooking,
  getPatientBookings,
  getTherapistBookings,
  updateBookingStatus,
  addBookingReview
} = require("../controllers/bookingController");

router.post("/", auth, createBooking);               // For patient booking
router.get("/", auth, getPatientBookings);           // Patient booking list
router.get("/therapist", auth, getTherapistBookings); // ✅ Therapist dashboard view
router.put("/:id/status", auth, updateBookingStatus); // ✅ Accept/Reject/Complete booking
router.post("/:id/review", auth, addBookingReview);   // ✅ Submit review

module.exports = router;
