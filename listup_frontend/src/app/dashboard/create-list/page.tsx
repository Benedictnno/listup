"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createListing } from "@/lib/api/listing";
import { fetchCategories, Category } from "@/lib/api/categories";
import { CheckCircle, Loader2, AlertCircle, Smartphone, Monitor } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

interface ImageFile {
  file: File;
  id: string;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
}

export default function CreateListingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("new");
  const [images, setImages] = useState<(ImageFile | null)[]>(Array(4).fill(null));
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const mainCategories = [
      "Fashion & Clothing",
      "Beauty & Personal Care", 
      "Food & Snacks",
      "Handmade & Crafts",
      "Electronics",
      "Home & Garden",
      "Sports & Outdoors",
      "Books & Media"
    ];

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const fetchedCategories = await fetchCategories();
        
        // Filter to only show our main categories
        const filteredCategories = fetchedCategories.filter(category => 
          mainCategories.includes(category.name)
        );
        
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategoriesError("Failed to load categories. Please try again.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      alert("Please enter a product title");
      return;
    }
    
    if (!description.trim()) {
      alert("Please enter a product description");
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }
    
    if (!categoryId) {
      alert("Please select a category");
      return;
    }
    
    // Check if at least one image is uploaded
    const uploadedImages = images.filter(img => img !== null);
    if (uploadedImages.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("categoryId", categoryId);
      formData.append("location", location || "Not specified");
      formData.append("condition", condition);

      // Add images in order (filter out null values)
      uploadedImages.forEach((img) => {
        if (img) {
          formData.append("images", img.file);
        }
      });

      await createListing(formData);

      // Redirect vendor to their listings page
      router.push("/dashboard/vendor-listing");
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get the count of uploaded images
  const uploadedImageCount = images.filter(img => img !== null).length;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Mobile Header */}
        <div className="mb-6 text-center sm:hidden">
          <h1 className="text-xl font-bold text-gray-900">Create Listing</h1>
          <p className="text-sm text-gray-600 mt-1">Add your product to start selling</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Create New Listing
            </CardTitle>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Add your product to start selling on ListUp
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Product Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., iPhone 13 Pro Max - 256GB"
                  className="mt-2 h-11 sm:h-12 text-base"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {title.length}/100
                </p>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product in detail..."
                  rows={4}
                  className="mt-2 resize-none text-base"
                  required
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {description.length}/500
                </p>
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Price (₦) *
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                      ₦
                    </span>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="h-11 sm:h-12 text-base pl-8"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category *
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId} disabled={categoriesLoading}>
                    <SelectTrigger className="mt-2 h-11 sm:h-12">
                      <SelectValue placeholder={
                        categoriesLoading 
                          ? "Loading..." 
                          : categoriesError 
                            ? "Error loading" 
                            : "Select category"
                      } />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location and Condition Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Lagos, Abuja"
                    className="mt-2 h-11 sm:h-12 text-base"
                    maxLength={50}
                  />
                </div>

                <div>
                  <Label htmlFor="condition" className="text-sm font-medium text-gray-700">
                    Condition
                  </Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="mt-2 h-11 sm:h-12">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Brand New</SelectItem>
                      <SelectItem value="like-new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Product Images *
                </Label>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  Upload up to 4 images. First image will be the main product photo.
                </p>

                <ImageUploader
                  images={images as ImageFile[]}
                  onImagesChange={setImages}
                  maxImages={4}
                  maxFileSize={10}
                />
              </div>

              {/* Image Count Summary */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Images uploaded: <strong>{uploadedImageCount}/4</strong>
                  </span>
                  {uploadedImageCount === 0 && (
                    <span className="text-sm text-red-600">
                      ⚠️ At least one image is required
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile Tips */}
              <div className="sm:hidden p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">Mobile Tips:</p>
                    <ul className="mt-1 space-y-0.5">
                      <li>• Tap each photo slot to add images</li>
                      <li>• Use landscape mode for better photo capture</li>
                      <li>• Ensure good lighting when taking photos</li>
                      <li>• First photo will be your main product image</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || uploadedImageCount === 0}
                className="w-full h-12 sm:h-14 text-base font-medium bg-green-600 hover:bg-green-700 disabled:bg-gray-400 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Listing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Create Listing</span>
                  </div>
                )}
              </Button>

              {/* Form Validation Summary */}
              {uploadedImageCount === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Please upload at least one image to continue
                    </span>
                  </div>
                </div>
              )}

              {/* Desktop Tips */}
              <div className="hidden sm:block p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-gray-600" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">Desktop Tips:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Click each photo slot to add images</li>
                      <li>• Drag and drop images to reorder them</li>
                      <li>• Use the file browser to select multiple images</li>
                      <li>• Preview images before finalizing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
