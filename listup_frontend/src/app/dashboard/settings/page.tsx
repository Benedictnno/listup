"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Store, 
  User, 
  Shield, 
  Bell, 
  Settings as SettingsIcon,
  Camera,
  CheckCircle,
  AlertTriangle,
  Menu,
  X
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const tabs = [
    { id: 'store', label: 'Store Settings', icon: Store },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon }
  ];

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: `${section} settings updated successfully!` });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: `Failed to update ${section} settings. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const renderStoreSettings = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Store size={20} />
            Basic Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="storeName">Store Name *</Label>
              <Input id="storeName" placeholder="Enter store name" className="w-full" />
            </div>
            <div>
              <Label htmlFor="businessCategory">Business Category *</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="storeDescription">Store Description</Label>
            <Textarea
              id="storeDescription"
              placeholder="Describe your store and what you offer"
              rows={3}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="storeEmail">Store Email *</Label>
              <Input
                id="storeEmail"
                type="email"
                placeholder="store@email.com"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="storePhone">Store Phone *</Label>
              <Input
                id="storePhone"
                placeholder="+234 801 234 5678"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => handleSave('Store')} 
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Saving...' : 'Save Store Settings'}
        </Button>
      </div>
    </div>
  );

  const renderPersonalSettings = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <User size={20} />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <User size={32} className="text-gray-400" />
            </div>
            <div className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Camera size={16} className="mr-2" />
                Change Photo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" placeholder="First name" className="w-full" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" placeholder="Last name" className="w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="personalEmail">Email *</Label>
              <Input
                id="personalEmail"
                type="email"
                placeholder="your@email.com"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="personalPhone">Phone *</Label>
              <Input
                id="personalPhone"
                placeholder="+234 801 234 5678"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => handleSave('Personal')} 
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Saving...' : 'Save Personal Settings'}
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Shield size={20} />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password *</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter current password"
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => handleSave('Security')} 
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Bell size={20} />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm md:text-base">Order Updates</p>
                <p className="text-xs md:text-sm text-gray-600">Get notified when order status changes</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm md:text-base">New Messages</p>
                <p className="text-xs md:text-sm text-gray-600">Get notified of new customer messages</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm md:text-base">Low Stock Alerts</p>
                <p className="text-xs md:text-sm text-gray-600">Get notified when products are running low</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => handleSave('Notification')} 
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  );

  const renderPreferenceSettings = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <SettingsIcon size={20} />
            General Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="africa/lagos">Africa/Lagos</SelectItem>
                  <SelectItem value="africa/accra">Africa/Accra</SelectItem>
                  <SelectItem value="africa/nairobi">Africa/Nairobi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN (₦)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => handleSave('Preference')} 
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Saving...' : 'Save Preference Settings'}
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'store':
        return renderStoreSettings();
      case 'personal':
        return renderPersonalSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'preferences':
        return renderPreferenceSettings();
      default:
        return renderStoreSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-sm text-gray-600">Manage your preferences</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your store and personal preferences</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className="mx-4 md:mx-6 mt-4">
          <div className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <AlertTriangle size={20} className="text-red-600" />
            )}
            <span className="text-sm md:text-base">{message.text}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-lime-50 text-lime-700 border border-lime-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-6 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-lime-50 text-lime-700 border border-lime-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
