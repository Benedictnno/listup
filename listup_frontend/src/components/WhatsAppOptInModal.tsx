"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/utils/axios";
import { MessageSquare, Check, X, Bell } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppOptInModal() {
  const { user, isInitialized, updateUser } = useAuthStore();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show modal if user is logged in, initialized, 
    // and hasn't made a choice yet (whatsappOptIn is undefined or null in DB logic, but we'll check for false if it's a new field)
    // Actually, we want to prompt users who have it as FALSE but haven't seen the prompt.
    // We can use localStorage to track if they've dismissed the prompt.
    
    if (isInitialized && user) {
      const hasSeenPrompt = localStorage.getItem(`wa_prompt_${user.id}`);
      // If whatsappOptIn is false and they haven't dismissed the prompt yet
      if (user.whatsappOptIn === false && !hasSeenPrompt) {
        // Delay slightly for better UX
        const timer = setTimeout(() => setShow(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInitialized, user]);

  const handleChoice = async (optIn: boolean) => {
    setLoading(true);
    try {
      const res = await api.put("/auth/update-profile", { 
        whatsappOptIn: optIn 
      });
      
      if (res.data.success) {
        updateUser({ whatsappOptIn: optIn });
        if (optIn) {
          toast.success("WhatsApp notifications enabled!");
        }
        setShow(false);
        localStorage.setItem(`wa_prompt_${user?.id}`, "true");
      }
    } catch (error) {
      console.error("Failed to update WhatsApp preference:", error);
      toast.error("Failed to save preference");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(`wa_prompt_${user?.id}`, "true");
  };

  if (!show || !user) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleDismiss}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-16 flex items-center justify-center">
          <div className="absolute -bottom-10 bg-white p-4 rounded-2xl shadow-lg">
            <MessageSquare className="w-12 h-12 text-lime-500" />
          </div>
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 cursor-pointer bg-red-500/80 hover:bg-red-500/90 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-14 pb-8 px-8 text-center">
          <h3 className="text-2xl font-bold text-slate-900">Never Miss a Lead!</h3>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Get instant alerts for new messages, orders, and market updates directly on your **WhatsApp**.
          </p>

          <div className="mt-6 space-y-3 text-left bg-slate-50 p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-lime-100 p-1 rounded-full">
                <Check className="w-3 h-3 text-lime-600" />
              </div>
              <p className="text-sm text-slate-600 font-medium">Real-time buyer inquiries</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-lime-100 p-1 rounded-full">
                <Check className="w-3 h-3 text-lime-600" />
              </div>
              <p className="text-sm text-slate-600 font-medium">Order status updates</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-lime-100 p-1 rounded-full">
                <Check className="w-3 h-3 text-lime-600" />
              </div>
              <p className="text-sm text-slate-600 font-medium">Exclusive market deals</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => handleChoice(true)}
              disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-lime-200 flex items-center justify-center gap-2"
            >
              <Bell className="w-5 h-5" />
              {loading ? "Enabling..." : "Enable WhatsApp Notifications"}
            </button>
            <button
              onClick={() => handleChoice(false)}
              disabled={loading}
              className="w-full py-3 text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
        
        <p className="pb-6 text-[10px] text-slate-400 text-center px-8">
          You can turn this off anytime in your Account Settings.
        </p>
      </div>
    </div>
  );
}
