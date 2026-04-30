"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { toast } from "sonner";
import { User, Lock, Save } from "lucide-react";

export default function SettingsPage() {
  const { user, isInitialized, initializeAuth } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push("/login");
    } else {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user, isInitialized, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming a generic update endpoint exists, or we use a settings endpoint
      const res = await api.put("/auth/update-profile", { name, phone });
      if (res.data.success) {
        toast.success("Profile updated successfully");
        await initializeAuth(); // Refresh global user state
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    
    setLoading(true);
    try {
      const res = await api.put("/auth/change-password", {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-500 mt-2">Manage your personal information and security preferences.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === "profile" 
                  ? "text-lime-600 border-b-2 border-lime-500 bg-lime-50/50" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <User className="w-4 h-4" />
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === "password" 
                  ? "text-lime-600 border-b-2 border-lime-500 bg-lime-50/50" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Lock className="w-4 h-4" />
              Security
            </button>
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" 
                  />
                  <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all outline-none" 
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Leave blank if you signed up with Google"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all outline-none" 
                  />
                  <p className="mt-1 text-xs text-slate-400">Required only if you already have a password set.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all outline-none" 
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
