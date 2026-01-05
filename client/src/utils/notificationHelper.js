// utils/notificationHelper.js

const ICON_URL = "/logo.png"; // Make sure to have a logo in public folder

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("Browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === "granted") return true;

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const showBrowserNotification = (title, message, onClickUrl) => {
    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: message,
            icon: ICON_URL,
            badge: ICON_URL,
            silent: false,
        });

        notification.onclick = (event) => {
            event.preventDefault();
            if (onClickUrl) {
                window.focus();
                window.location.href = onClickUrl;
            }
            notification.close();
        };
    }
};
