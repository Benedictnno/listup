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

export default function CreateListingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategoriesError("Failed to load categories. Please try again.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

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
    
    if (images.length === 0) {
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

      images.forEach((img) => {
        formData.append("images", img);
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

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter product title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price (₦)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                required
              />
            </div>

                         <div>
               <Label htmlFor="category">Category</Label>
               <Select value={categoryId} onValueChange={setCategoryId} disabled={categoriesLoading}>
                 <SelectTrigger>
                   <SelectValue placeholder={
                     categoriesLoading 
                       ? "Loading categories..." 
                       : categoriesError 
                         ? "Error loading categories" 
                         : categories.length === 0 
                           ? "No categories available"
                           : "Select a category"
                   } />
                 </SelectTrigger>
                 <SelectContent>
                   {categoriesLoading ? (
                     <div className="px-2 py-1.5 text-sm text-muted-foreground">
                       Loading categories...
                     </div>
                   ) : categoriesError ? (
                     <div className="px-2 py-1.5 text-sm text-muted-foreground">
                       Error loading categories
                     </div>
                   ) : categories.length === 0 ? (
                     <div className="px-2 py-1.5 text-sm text-muted-foreground">
                       No categories available
                     </div>
                   ) : (
                     categories.map((category) => (
                       <SelectItem key={category.id} value={category.id}>
                         {category.name}
                       </SelectItem>
                     ))
                   )}
                 </SelectContent>
               </Select>
               {categoriesError && (
                 <p className="text-sm text-red-600 mt-1">{categoriesError}</p>
               )}
             </div>

            <div>
              <Label htmlFor="images">Upload Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
