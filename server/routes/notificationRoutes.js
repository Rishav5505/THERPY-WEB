const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getNotifications, markAsRead, markAllRead } = require("../controllers/notificationController");

router.get("/", auth, getNotifications);
router.put("/:id/read", auth, markAsRead);
router.put("/read-all", auth, markAllRead);

module.exports = router;
