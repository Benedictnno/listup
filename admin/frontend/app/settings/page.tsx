"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Button  from "@/components/ui/button";

export default function SettingsPage() {
  const [section, setSection] = useState<"profile" | "preferences" | "security">("profile");

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application settings</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={section === "profile" ? "default" : "outline"} onClick={() => setSection("profile")}>Profile</Button>
          <Button variant={section === "preferences" ? "default" : "outline"} onClick={() => setSection("preferences")}>Preferences</Button>
          <Button variant={section === "security" ? "default" : "outline"} onClick={() => setSection("security")}>Security</Button>
        </div>

        {section === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div className="flex justify-end">
                <Button>Save</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {section === "preferences" && (
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <select className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>System</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Language</label>
                <select className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>English</option>
                  <option>Spanish</option>
                </select>
              </div>
              <div className="flex justify-end">
                <Button>Save</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {section === "security" && (
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Password</label>
                <Input type="password" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}