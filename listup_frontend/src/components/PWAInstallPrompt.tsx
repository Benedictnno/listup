"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "./ui/button";

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
            console.log("PWA install prompt deferred");
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setShowPrompt(false);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User responded to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-[60] md:bottom-6 md:left-auto md:right-6 md:w-80 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">Install ListUp App</h3>
                        <p className="text-slate-400 text-xs mt-1">
                            Install our app for a faster, better marketplace experience.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="mt-4 flex gap-2">
                    <Button
                        onClick={handleInstallClick}
                        className="w-full bg-lime-500 hover:bg-lime-600 text-slate-950 font-bold text-xs h-9 rounded-xl"
                    >
                        <Download size={14} className="mr-2" />
                        Install Now
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setShowPrompt(false)}
                        className="text-slate-400 hover:text-white text-xs h-9"
                    >
                        Not now
                    </Button>
                </div>
            </div>
        </div>
    );
}
