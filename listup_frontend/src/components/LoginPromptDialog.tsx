"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function LoginPromptDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Heart className="text-red-500" /> Save this listing
          </DialogTitle>
          <p className="text-sm text-gray-600">Log in to save and access this listing later from your Saved posts.</p>
        </DialogHeader>

        <div className="py-4">
          <div className="text-sm text-gray-700">You need an account to save listings. Please log in if you already have an account, or sign up to create one.</div>
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
