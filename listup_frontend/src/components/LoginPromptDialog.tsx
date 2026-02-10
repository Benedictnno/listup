"use client";

import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type LoginAction = "save" | "chat";

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  action?: LoginAction;
}

const actionConfig = {
  save: {
    icon: Heart,
    iconColor: "text-red-500",
    title: "Save this listing",
    description: "Log in to save and access this listing later from your Saved posts.",
    message: "You need an account to save listings. Please log in if you already have an account, or sign up to create one.",
  },
  chat: {
    icon: MessageCircle,
    iconColor: "text-lime-500",
    title: "Start chatting",
    description: "Log in to message the seller and discuss this listing.",
    message: "You need an account to start a conversation. Please log in if you already have an account, or sign up to create one.",
  },
};

export default function LoginPromptDialog({ open, onOpenChange, action = "save" }: LoginPromptDialogProps) {
  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Icon className={config.iconColor} /> {config.title}
          </DialogTitle>
          <p className="text-sm text-gray-600">{config.description}</p>
        </DialogHeader>

        <div className="py-4">
          <div className="text-sm text-gray-700">{config.message}</div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 justify-end">
            <Link href="/signup">
              <button className="px-4 py-2 border rounded" onClick={() => onOpenChange(false)}>Create account</button>
            </Link>
            <Link href="/login">
              <button className="px-4 py-2 bg-lime-500 text-white rounded" onClick={() => onOpenChange(false)}>Log in</button>
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
