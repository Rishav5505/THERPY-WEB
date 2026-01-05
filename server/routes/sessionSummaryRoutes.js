const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const {
    generateSummary,
    updateSummary,
    sendSummaryEmail,
    getPatientSummaries
} = require("../controllers/sessionSummaryController");

router.get("/patient", requireAuth, getPatientSummaries);
router.post("/generate/:bookingId", requireAuth, generateSummary);
router.put("/:id", requireAuth, updateSummary);
router.post("/:id/send", requireAuth, sendSummaryEmail);

module.exports = router;
