const User = require("../models/User");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -otp");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, interests, specializations } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (interests) updateData.interests = interests;
        if (specializations) updateData.specializations = specializations;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select("-password -otp");

        res.json({ message: "Profile updated successfully", user });
    } catch (err) {
        res.status(500).json({ message: "Error updating profile", error: err.message });
    }
};

exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const photoUrl = `/uploads/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { photoUrl },
            { new: true }
        ).select("-password -otp");

        res.json({ message: "Photo uploaded successfully", user, photoUrl });
    } catch (err) {
        res.status(500).json({ message: "Error uploading photo", error: err.message });
    }
};
