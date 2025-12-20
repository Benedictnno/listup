"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserSettings, updateStoreSettings, updatePersonalInfo, updatePassword, uploadStoreImage } from "@/lib/api/settings";
import api from "@/utils/axios";
import {
  Store,
  User,
  Shield,
  Camera,
  CheckCircle,
  AlertTriangle,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Clock,
  Link as LinkIcon,
  Copy,
  Upload
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [storeForm, setStoreForm] = useState({
    storeId: "",
    storeName: "",
    storeDescription: "",
    businessCategory: "",
    storeAddress: "",
    storeEmail: "",
    storePhone: "",
    coverImage: "",
    logo: "",
    website: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: ""
    },
    businessHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "09:00", close: "18:00", closed: true }
    },
    storeAnnouncement: ""
  });

  const [personalForm, setPersonalForm] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    personalPhone: "",
  });

  const tabs = [
    { id: 'store', label: 'Store Settings', icon: Store },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getUserSettings();
        const user = response?.data ?? response;

        const vendorProfile = user?.vendorProfile;

        setStoreForm(prev => ({
          ...prev,
          storeId: vendorProfile?.id || "",
          storeName: vendorProfile?.storeName || "",
          storeDescription: vendorProfile?.storeDescription || "",
          businessCategory: vendorProfile?.businessCategory || "",
          storeAddress: vendorProfile?.storeAddress || "",
          storeEmail: user?.email || "",
          storePhone: user?.phone || "",
          coverImage: vendorProfile?.coverImage || "",
          logo: vendorProfile?.logo || "",
          website: vendorProfile?.website || "",
          socialMedia: {
            instagram: vendorProfile?.socialMedia?.instagram || "",
            facebook: vendorProfile?.socialMedia?.facebook || "",
            twitter: vendorProfile?.socialMedia?.twitter || "",
            linkedin: vendorProfile?.socialMedia?.linkedin || ""
          },
          businessHours: vendorProfile?.businessHours
            ? Object.fromEntries(
              Object.entries(vendorProfile.businessHours).filter(([key]) =>
                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key)
              )
            ) as any
            : prev.businessHours,
          storeAnnouncement: vendorProfile?.storeAnnouncement || ""
        }));

        const fullName = user?.name || "";
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ");

        setPersonalForm(prev => ({
          ...prev,
          firstName: firstName || "",
          lastName: lastName || "",
          personalEmail: user?.email || "",
          personalPhone: user?.phone || "",
        }));
      } catch (error) {
        console.error("Failed to load user settings", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      if (section === 'Store') {
        const { storeName, businessCategory, storeDescription, storeAddress } = storeForm;

        if (!storeName || !businessCategory || !storeAddress) {
          setMessage({ type: 'error', text: 'Please fill in all required fields (Store Name, Category, Address).' });
          return;
        }

        // Sanitize business hours to remove any Prisma metadata
        const sanitizedBusinessHours = Object.fromEntries(
          Object.entries(storeForm.businessHours).filter(([key]) =>
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key)
          )
        ) as any;

        await updateStoreSettings({
          storeName,
          storeDescription,
          businessCategory,
          storeAddress,
          website: storeForm.website,
          socialMedia: storeForm.socialMedia,
          businessHours: sanitizedBusinessHours,
          storeAnnouncement: storeForm.storeAnnouncement
        } as any);

        setMessage({ type: 'success', text: 'Store settings updated successfully!' });
      } else if (section === 'Personal') {
        const { firstName, lastName, personalEmail, personalPhone } = personalForm;

        if (!firstName || !lastName || !personalEmail || !personalPhone) {
          setMessage({ type: 'error', text: 'Please fill in all required personal fields.' });
          return;
        }

        await updatePersonalInfo({
          name: `${firstName} ${lastName}`.trim(),
          phone: personalPhone,
        });

        setMessage({ type: 'success', text: 'Personal settings updated successfully!' });
      } else if (section === 'Security') {
        const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement)?.value || '';
        const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value || '';
        const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value || '';

        if (!currentPassword || !newPassword || !confirmPassword) {
          setMessage({ type: 'error', text: 'Please fill in all password fields.' });
          return;
        }

        if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
          return;
        }

        if (newPassword.length < 6) {
          setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
          return;
        }

        await updatePassword({ currentPassword, newPassword });

        // Clear password fields after successful update
        (document.getElementById('currentPassword') as HTMLInputElement).value = '';
        (document.getElementById('newPassword') as HTMLInputElement).value = '';
        (document.getElementById('confirmPassword') as HTMLInputElement).value = '';

        setMessage({ type: 'success', text: 'Password updated successfully!' });
      } else {
        setMessage({ type: 'success', text: `${section} settings updated successfully!` });
      }
    } catch (error: any) {
      const errorText = error?.response?.data?.message || `Failed to update ${section} settings. Please try again.`;
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      // 1. Get signature
      const sigData = await api.get('/uploads/cloudinary-signature').then(res => res.data);

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const cloudData = await cloudRes.json();

      if (cloudData.secure_url) {
        // 3. Update backend
        await uploadStoreImage({ imageUrl: cloudData.secure_url, imageType: type });
        setStoreForm(prev => ({ ...prev, [type === 'logo' ? 'logo' : 'coverImage']: cloudData.secure_url }));
        setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Cover image'} updated successfully!` });
      }
    } catch (error) {
      console.error("Upload failed", error);
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
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
          {/* Store Link Section */}
          <div className="p-4 bg-lime-50 rounded-lg border border-lime-100 mb-4">
            <Label className="text-lime-800 font-semibold flex items-center gap-2 mb-2">
              <LinkIcon size={16} />
              Your Store Link
            </Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`listup.ng/stores/${storeForm.storeName.toLowerCase().replace(/\s+/g, '-') || '...'}`}
                className="bg-white border-lime-200"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const link = `listup.ng/stores/${storeForm.storeName.toLowerCase().replace(/\s+/g, '-')}`;
                  navigator.clipboard.writeText(link);
                  setMessage({ type: 'success', text: 'Link copied to clipboard!' });
                  setTimeout(() => setMessage(null), 2000);
                }}
              >
                <Copy size={16} />
              </Button>
            </div>
            <p className="text-xs text-lime-600 mt-2">Share this link with your customers to visit your store front directly.</p>
          </div>

          {/* Store Logo & Cover Image Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Store Logo</Label>
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group mx-auto">
                {storeForm.logo ? (
                  <>
                    <Image
                      src={storeForm.logo}
                      alt="Store Logo"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Label htmlFor="logo-upload" className="cursor-pointer text-white p-1 rounded-full">
                        <Upload size={16} />
                      </Label>
                    </div>
                  </>
                ) : (
                  <Label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center gap-1 text-gray-500 text-[10px] text-center p-2">
                    <Upload size={16} />
                    <span>Logo</span>
                  </Label>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Store Cover Image</Label>
              <div className="relative h-24 w-full rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group">
                {storeForm.coverImage ? (
                  <>
                    <Image
                      src={storeForm.coverImage}
                      alt="Store Cover"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Label htmlFor="cover-upload" className="cursor-pointer text-white flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full text-xs">
                        <Upload size={14} />
                        Change
                      </Label>
                    </div>
                  </>
                ) : (
                  <Label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center gap-1 text-gray-500 text-xs">
                    <Upload size={20} />
                    <span>Upload Cover Image</span>
                  </Label>
                )}
                <input
                  id="cover-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'cover')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                placeholder="Enter store name"
                className="w-full"
                value={storeForm.storeName}
                onChange={(e) => setStoreForm(prev => ({ ...prev, storeName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="businessCategory">Business Category *</Label>
              <Select
                value={storeForm.businessCategory}
                onValueChange={(value) => setStoreForm(prev => ({ ...prev, businessCategory: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                  <SelectItem value="food">Food & Groceries</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                placeholder="https://yourstore.com"
                className="w-full"
                value={storeForm.website}
                onChange={(e) => setStoreForm(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="storeAddress">Store Address *</Label>
            <Textarea
              id="storeAddress"
              placeholder="Enter your physical store address"
              rows={2}
              className="w-full"
              value={storeForm.storeAddress}
              onChange={(e) => setStoreForm(prev => ({ ...prev, storeAddress: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="storeDescription">Store Description</Label>
            <Textarea
              id="storeDescription"
              placeholder="Describe your store and what you offer"
              rows={3}
              className="w-full"
              value={storeForm.storeDescription}
              onChange={(e) => setStoreForm(prev => ({ ...prev, storeDescription: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="storeAnnouncement">Store Announcement / Special Offer (Visible on storefront)</Label>
            <Input
              id="storeAnnouncement"
              placeholder="e.g. 🔥 This Week's Bestseller: 20% off all water bottles!"
              className="w-full"
              value={storeForm.storeAnnouncement}
              onChange={(e) => setStoreForm(prev => ({ ...prev, storeAnnouncement: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <LinkIcon size={20} />
            Social Media Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram size={16} className="text-pink-600" />
                Instagram
              </Label>
              <Input
                id="instagram"
                placeholder="@username"
                value={storeForm.socialMedia.instagram}
                onChange={(e) => setStoreForm(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <Facebook size={16} className="text-blue-600" />
                Facebook
              </Label>
              <Input
                id="facebook"
                placeholder="facebook.com/yourstore"
                value={storeForm.socialMedia.facebook}
                onChange={(e) => setStoreForm(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter size={16} className="text-sky-500" />
                Twitter (X)
              </Label>
              <Input
                id="twitter"
                placeholder="@username"
                value={storeForm.socialMedia.twitter}
                onChange={(e) => setStoreForm(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin size={16} className="text-blue-700" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                placeholder="linkedin.com/company/yourstore"
                value={storeForm.socialMedia.linkedin}
                onChange={(e) => setStoreForm(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Clock size={20} />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(storeForm.businessHours)
              .filter(([day]) => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day))
              .map(([day, hours]: [string, any]) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-[120px]">
                    <span className="capitalize font-medium w-24">{day}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {hours.closed ? (
                      <span className="text-red-500 text-sm font-medium px-3 py-1 bg-red-50 rounded border border-red-100">Closed</span>
                    ) : (
                      <>
                        <Input
                          type="time"
                          className="w-28 h-9"
                          value={hours.open}
                          onChange={(e) => setStoreForm(prev => ({
                            ...prev,
                            businessHours: {
                              ...prev.businessHours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          }))}
                        />
                        <span className="text-gray-400">to</span>
                        <Input
                          type="time"
                          className="w-28 h-9"
                          value={hours.close}
                          onChange={(e) => setStoreForm(prev => ({
                            ...prev,
                            businessHours: {
                              ...prev.businessHours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          }))}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={hours.closed ? "text-green-600" : "text-red-600"}
                      onClick={() => setStoreForm(prev => ({
                        ...prev,
                        businessHours: {
                          ...prev.businessHours,
                          [day]: { ...hours, closed: !hours.closed }
                        }
                      }))}
                    >
                      {hours.closed ? "Open" : "Mark Closed"}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => handleSave('Store')}
          disabled={loading}
          className="w-full md:w-auto bg-lime-600 hover:bg-lime-700"
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
              <Input
                id="firstName"
                placeholder="First name"
                className="w-full"
                value={personalForm.firstName}
                onChange={(e) => setPersonalForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                className="w-full"
                value={personalForm.lastName}
                onChange={(e) => setPersonalForm(prev => ({ ...prev, lastName: e.target.value }))}
              />
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
                value={personalForm.personalEmail}
                onChange={(e) => setPersonalForm(prev => ({ ...prev, personalEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="personalPhone">Phone *</Label>
              <Input
                id="personalPhone"
                placeholder="+234 801 234 5678"
                className="w-full"
                value={personalForm.personalPhone}
                onChange={(e) => setPersonalForm(prev => ({ ...prev, personalPhone: e.target.value }))}
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

  const renderContent = () => {
    switch (activeTab) {
      case 'store':
        return renderStoreSettings();
      case 'personal':
        return renderPersonalSettings();
      case 'security':
        return renderSecuritySettings();
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
          <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
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
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === tab.id
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
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === tab.id
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
