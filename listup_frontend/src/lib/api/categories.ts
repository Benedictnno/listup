import api from "@/utils/axios";

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
    const response = await api.get(`/categories`);
    console.log(`✅ Fetched ${response.data.length} categories`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

// Fetch category by ID
export const fetchCategoryById = async (id: string): Promise<Category> => {
  try {
    console.log(`🔍 Fetching category by ID: ${id}`);
    const response = await api.get(`/categories/${id}`);
    console.log("✅ Category fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching category ${id}:`, error);
    throw new Error("Failed to fetch category");
  }
};

// Create new category (admin only)
export const createCategory = async (categoryData: { name: string; slug: string }): Promise<Category> => {
  try {
    console.log("🚀 Creating category with data:", categoryData);
    const response = await api.post(`/categories`, categoryData);
    console.log("✅ Category created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating category:", error);
    throw new Error("Failed to create category");
  }
};

// Update category (admin only)
export const updateCategory = async (id: string, categoryData: { name: string; slug: string }): Promise<Category> => {
  try {
    console.log(`🔄 Updating category ${id} with data:`, categoryData);
    const response = await api.put(`/categories/${id}`, categoryData);
    console.log("✅ Category updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating category ${id}:`, error);
    throw new Error("Failed to update category");
  }
};

// Delete category (admin only)
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    console.log(`🗑️ Deleting category ${id}`);
    await api.delete(`/categories/${id}`);
    console.log("✅ Category deleted successfully");
  } catch (error) {
    console.error(`❌ Error deleting category ${id}:`, error);
    throw new Error("Failed to delete category");
  }
};
