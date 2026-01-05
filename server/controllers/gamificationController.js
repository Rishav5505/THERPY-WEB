const User = require("../models/User");
const { sendNotification } = require("./notificationController");

/**
 * 🎖️ Gamification Helper
 * Handles awarding points, badges, and updating streaks.
 */
exports.awardPoints = async (userId, points, reason, io) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        user.points += points;
        await user.save();

        // 🔔 Notify user of points earned
        await sendNotification(io, {
            recipient: userId,
            title: "Points Earned! 🎖️",
            message: `You earned ${points} points for ${reason}!`,
            type: "system"
        });

        return user;
    } catch (err) {
        console.error("Error awarding points:", err);
    }
};

exports.updateStreak = async (userId, io) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastLog = user.lastMoodLogDate ? new Date(user.lastMoodLogDate) : null;
        if (lastLog) lastLog.setHours(0, 0, 0, 0);

        if (!lastLog) {
            user.currentStreak = 1;
        } else {
            const diffTime = Math.abs(today - lastLog);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.currentStreak += 1;

                // 🏆 Check for Streak Badges
                if (user.currentStreak === 7) {
                    await this.awardBadge(userId, "7-Day Streak", "🔥", io);
                } else if (user.currentStreak === 30) {
                    await this.awardBadge(userId, "30-Day Warrior", "🛡️", io);
                }
            } else if (diffDays > 1) {
                user.currentStreak = 1;
            }
        }

        user.lastMoodLogDate = new Date();
        await user.save();
        return user;
    } catch (err) {
        console.error("Error updating streak:", err);
    }
};

exports.awardBadge = async (userId, badgeName, icon, io) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Check if user already has this badge
        const hasBadge = user.badges.some(b => b.name === badgeName);
        if (hasBadge) return;

        user.badges.push({ name: badgeName, icon: icon });
        await user.save();

        // 🔔 Notify user
        await sendNotification(io, {
            recipient: userId,
            title: "New Badge Unlocked! 🎖️",
            message: `Congratulations! You've earned the "${badgeName}" badge ${icon}`,
            type: "system"
        });

        return user;
    } catch (err) {
        console.error("Error awarding badge:", err);
    }
};

exports.incrementSessions = async (userId, io) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        user.totalSessionsCompleted += 1;

        // 🏆 First Session Badge
        if (user.totalSessionsCompleted === 1) {
            await this.awardBadge(userId, "First Session", "🌱", io);
        } else if (user.totalSessionsCompleted === 10) {
            await this.awardBadge(userId, "Mindfulness Pro", "💎", io);
        }

        await user.save();
        return user;
    } catch (err) {
        console.error("Error incrementing sessions:", err);
    }
};

// 🏆 Leaderboard API
exports.getLeaderboard = async (req, res) => {
    try {
        // Return top 10 players anonymously
        const leaderboard = await User.find({ role: "patient" })
            .select("name points photoUrl")
            .sort({ points: -1 })
            .limit(10);

        // Anonymize names if needed (e.g., "John D.")
        const anonymized = leaderboard.map(u => ({
            name: u.name.split(' ')[0] + (u.name.split(' ')[1] ? ` ${u.name.split(' ')[1][0]}.` : ''),
            points: u.points,
            photoUrl: u.photoUrl
        }));

        res.json(anonymized);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
};
