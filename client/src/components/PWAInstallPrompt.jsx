import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Show the customized install prompt
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the native install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        // Reset the deferred prompt
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 md:left-auto md:right-10 md:bottom-10 md:w-96 bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl z-[1000] border border-white/20 backdrop-blur-lg"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl text-2xl">
                            📱
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-lg">Install MindMend</h3>
                            <p className="text-sm text-indigo-100 mb-4">Add MindMend to your home screen for a better, app-like experience.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleInstallClick}
                                    className="flex-1 bg-white text-indigo-600 py-2.5 rounded-xl font-black text-sm hover:bg-slate-50 transition-colors shadow-lg"
                                >
                                    Install Now
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="px-4 py-2.5 rounded-xl font-bold text-sm text-white/70 hover:text-white transition-colors"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PWAInstallPrompt;
