import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and application settings"
};

export default function SettingsPage() {
  // Redirect to profile settings by default
  redirect("/settings/profile");
}