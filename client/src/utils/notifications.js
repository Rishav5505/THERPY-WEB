// utils/notifications.js
// Smart Notification System for MindMend

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const showNotification = (title, options = {}) => {
    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            icon: "/logo.png", // Add your logo
            badge: "/badge.png",
            vibrate: [200, 100, 200],
            ...options,
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    }
};

// Specific notification types
export const notifyNewBooking = (patientName) => {
    showNotification("🔔 New Appointment Request", {
        body: `${patientName} has requested an appointment`,
        tag: "new-booking",
    });
};

export const notifySessionReminder = (doctorName, timeLeft) => {
    showNotification("⏰ Session Reminder", {
        body: `Your session with ${doctorName} starts in ${timeLeft} minutes`,
        tag: "session-reminder",
    });
};

export const notifySessionConfirmed = (doctorName, date, time) => {
    showNotification("✅ Session Confirmed", {
        body: `Your appointment with ${doctorName} on ${date} at ${time} has been confirmed!`,
        tag: "session-confirmed",
    });
};

export const notifyPrescriptionReceived = (doctorName) => {
    showNotification("💊 New Prescription", {
        body: `Dr. ${doctorName} has sent you a prescription`,
        tag: "prescription",
    });
};
