const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const { updateProfile, uploadPhoto, getProfile } = require("../controllers/userController");

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.post("/upload-photo", requireAuth, upload.single("photo"), uploadPhoto);

module.exports = router;
