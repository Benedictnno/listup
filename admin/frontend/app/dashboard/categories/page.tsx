'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
// Using simple modal components instead of dialog
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="z-50 bg-white rounded-lg shadow-lg overflow-hidden p-6 max-w-md w-full">
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children }: { children: React.ReactNode }) => <div className="mb-4">{children}</div>;
const ModalTitle = ({ children }: { children: React.ReactNode }) => <h2 className="text-lg font-semibold">{children}</h2>;
const ModalFooter = ({ children }: { children: React.ReactNode }) => <div className="mt-6 flex justify-end space-x-2">{children}</div>;
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { Loader2, Plus } from 'lucide-react';
import axios from 'axios';

// Backend API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string, isNew = true) => {
    if (isNew) {
      const slug = generateSlug(value);
      setNewCategory({ name: value, slug });
    } else if (editCategory) {
      const slug = generateSlug(value);
      setEditCategory({ ...editCategory, name: value, slug });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`${API_URL}/categories`, newCategory, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      await fetchCategories();
      setIsAddDialogOpen(false);
      setNewCategory({ name: '', slug: '' });
      toast.success('Category added successfully');
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.error || 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editCategory) return;
    
    if (!editCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.put(`${API_URL}/categories/${editCategory.id}`, {
        name: editCategory.name,
        slug: editCategory.slug
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      await fetchCategories();
      setIsEditDialogOpen(false);
      setEditCategory(null);
      toast.success('Category updated successfully');
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.error || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      setIsSubmitting(true);
      await axios.delete(`${API_URL}/categories/${id}`, {
        withCredentials: true
      });
      
      await fetchCategories();
      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.error || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories Management</CardTitle>
          <div className="flex space-x-2">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setEditCategory(category);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Modal isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <ModalHeader>
          <ModalTitle>Add New Category</ModalTitle>
        </ModalHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={newCategory.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug" className="text-right">Slug</Label>
            <Input
              id="slug"
              value={newCategory.slug}
              onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAddCategory} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Category
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Category Dialog */}
      <Modal isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <ModalHeader>
          <ModalTitle>Edit Category</ModalTitle>
        </ModalHeader>
        {editCategory && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                value={editCategory.name}
                onChange={(e) => handleNameChange(e.target.value, false)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-slug" className="text-right">Slug</Label>
              <Input
                id="edit-slug"
                value={editCategory.slug}
                onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleEditCategory} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export const dynamic = 'force-dynamic';