import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// Fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    console.log("🔄 Fetching categories...");
    const response = await axios.get(`${API_BASE}/categories`);
    console.log(`✅ Fetched ${response.data.length} categories`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw new Error("Failed to fetch categories");
  }
};

// Fetch category by ID
export const fetchCategoryById = async (id: string): Promise<Category> => {
  try {
    console.log(`🔍 Fetching category by ID: ${id}`);
    const response = await axios.get(`${API_BASE}/categories/${id}`);
    console.log("✅ Category fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching category ${id}:`, error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw new Error("Failed to fetch category");
  }
};

// Create new category (admin only)
export const createCategory = async (categoryData: { name: string; slug: string }): Promise<Category> => {
  try {
    console.log("🚀 Creating category with data:", categoryData);
    const response = await axios.post(`${API_BASE}/categories`, categoryData);
    console.log("✅ Category created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating category:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw new Error("Failed to create category");
  }
};

// Update category (admin only)
export const updateCategory = async (id: string, categoryData: { name: string; slug: string }): Promise<Category> => {
  try {
    console.log(`🔄 Updating category ${id} with data:`, categoryData);
    const response = await axios.put(`${API_BASE}/categories/${id}`, categoryData);
    console.log("✅ Category updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating category ${id}:`, error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw new Error("Failed to update category");
  }
};

// Delete category (admin only)
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    console.log(`🗑️ Deleting category ${id}`);
    await axios.delete(`${API_BASE}/categories/${id}`);
    console.log("✅ Category deleted successfully");
  } catch (error) {
    console.error(`❌ Error deleting category ${id}:`, error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
    }
    throw new Error("Failed to delete category");
  }
};
