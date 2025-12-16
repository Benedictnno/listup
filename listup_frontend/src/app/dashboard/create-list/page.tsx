"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { createListing } from "@/lib/api/listing";
import { uploadImage } from "@/lib/api/upload";
import { fetchCategories, Category } from "@/lib/api/categories";
import { useRouter } from "next/navigation";

export default function CreateListing() {
  const { user } = useAuthStore();
  const router = useRouter();
  console.log(user);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Auto-populate location from user's signup data
  useEffect(() => {
    if (user?.vendorProfile?.storeAddress) {
      setLocation(user.vendorProfile.storeAddress);
    }
  }, [user]);

  // Fetch categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories. Please refresh the page.");
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const conditions = [
    "New",
    "Like New",
    "Used"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      setError("Please select an image");
      return;
    }

    if (!title.trim() || !description.trim() || !price || !categoryId || !condition) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // First upload the image
      const imageUploadResponse = await uploadImage(image);
      const imageUrl = imageUploadResponse.url;

      // Then create the listing with the image URL
      const listingData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        categoryId: categoryId,
        condition,
        location: location.trim(),
        images: [imageUrl] // Send as array with the uploaded image URL
      };

      await createListing(listingData);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error creating listing:", err);
      if (err.message) {
        setError(err.message);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to create listing. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
        <p className="text-gray-600 mt-2">Add your item to the marketplace</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter item title"
                  maxLength={100}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">{title.length}/100 characters</p>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item in detail"
                  rows={4}
                  maxLength={500}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">{description.length}/500 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00 NGN"
                      min="0"
                      step="0.01"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="no-categories" disabled>No categories found</SelectItem>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={condition} onValueChange={setCondition} >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {conditions.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {cond}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where in School area are you delievering from"
                    className="mt-1"
                    readOnly={!!user?.vendorProfile?.storeAddress}
                  />
                  {user?.vendorProfile?.storeAddress && (
                    <p className="text-sm text-gray-500 mt-1">
                      📍 Location automatically filled from your store address
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Image</h3>
              
              <div className="space-y-3">
                <Label htmlFor="image">Upload Image *</Label>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">📷</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">Image uploaded successfully</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div className="flex-1">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                    {error.includes('categoryId') && (
                      <p className="text-red-500 text-xs mt-1">
                        💡 Please select a category from the dropdown above
                      </p>
                    )}
                    {error.includes('image') && (
                      <p className="text-red-500 text-xs mt-1">
                        💡 Please select an image file (JPG, PNG, or GIF)
                      </p>
                    )}
                    {error.includes('price') && (
                      <p className="text-red-500 text-xs mt-1">
                        💡 Please enter a valid price (e.g., 25.99)
                      </p>
                    )}
                    {error.includes('location') && (
                      <p className="text-red-500 text-xs mt-1">
                        💡 Location is automatically filled from your store address
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading || !image}
                className="px-8"
              >
                {isLoading ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="mt-8 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Listings</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use clear, high-quality images in good lighting</li>
            <li>• Write detailed descriptions including any flaws or wear</li>
            <li>• Set competitive prices based on similar items</li>
            <li>• Be honest about the condition of your item</li>
            <li>• Respond quickly to buyer inquiries</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
