"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type ProfileData = {
  displayName: string;
  email: string;
  jobTitle: string;
  bio: string;
  avatarUrl: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "Admin User",
    email: "admin@example.com",
    jobTitle: "System Administrator",
    bio: "Managing the ListUp platform and vendors.",
    avatarUrl: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    if (isSaved) setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSaved(true);
    }, 800);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Display Name</label>
                <Input 
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Email</label>
                <Input 
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Job Title</label>
              <Input 
                name="jobTitle"
                value={profile.jobTitle}
                onChange={handleChange}
                placeholder="Your position"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                className="h-24 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              {isSaved && <span className="text-green-600 self-center">Changes saved!</span>}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}