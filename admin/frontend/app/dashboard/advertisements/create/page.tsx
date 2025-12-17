'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { Upload, Loader2 } from 'lucide-react';

interface AdFormData {
  title: string;
  imageUrl: string;
  targetUrl?: string;
  duration: number;
}

type UploadMode = 'url' | 'file';

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdFormData>();

  const imageUrl = watch('imageUrl');

  // Update preview when image URL changes
  const handleImageUrlChange = (url: string) => {
    if (url && /^https?:\/\/.+/.test(url)) {
      setImagePreview(url);
    } else {
      setImagePreview('');
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload button click
  const handleUploadClick = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      const uploadedUrl = await uploadToCloudinary(selectedFile);
      setValue('imageUrl', uploadedUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    }
  };

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Using api service automatically handles auth headers
      const response = await api.post('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: AdFormData) => {
    setIsLoading(true);
    try {
      // Validate imageUrl
      if (!data.imageUrl) {
        toast.error('Please upload an image or provide an image URL');
        setIsLoading(false);
        return;
      }



      // Prepare payload - only include targetUrl if it has a value
      const payload: any = {
        title: data.title,
        imageUrl: data.imageUrl,
        duration: data.duration,
      };

      // Only add targetUrl if it's not empty
      if (data.targetUrl && data.targetUrl.trim()) {
        payload.targetUrl = data.targetUrl.trim();
      }

      await api.post('/advertisements', payload);

      toast.success('Advertisement created successfully');
      router.push('/dashboard/advertisements');
    } catch (error: any) {
      console.error('Error creating advertisement:', error);
      toast.error(error.response?.data?.message || 'Failed to create advertisement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Advertisement</CardTitle>
          <CardDescription>
            Create a new graphical advertisement to display on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Advertisement title"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Advertisement Image <span className="text-red-500">*</span>
              </label>

              {/* Upload Mode Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('file');
                    setValue('imageUrl', '');
                    setImagePreview('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${uploadMode === 'file'
                    ? 'bg-lime-500 text-white border-lime-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-lime-500'
                    }`}
                >
                  <Upload className="inline-block w-4 h-4 mr-2" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('url');
                    setSelectedFile(null);
                    setImagePreview('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${uploadMode === 'url'
                    ? 'bg-lime-500 text-white border-lime-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-lime-500'
                    }`}
                >
                  Image URL
                </button>
              </div>

              {/* File Upload Mode */}
              {uploadMode === 'file' && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-lime-500 transition-colors">
                    <input
                      type="file"
                      id="imageFile"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="imageFile"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {selectedFile ? selectedFile.name : 'Click to select image'}
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </label>
                  </div>

                  {/* Upload Button */}
                  {selectedFile && (
                    <Button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={isUploading || !!watch('imageUrl')}
                      className="w-full bg-lime-500 hover:bg-lime-600 text-white"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : watch('imageUrl') ? (
                        '✓ Uploaded'
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload to Cloudinary
                        </>
                      )}
                    </Button>
                  )}

                  {!selectedFile && !watch('imageUrl') && (
                    <p className="text-sm text-red-500">Please select an image file</p>
                  )}
                </div>
              )}

              {/* URL Input Mode */}
              {uploadMode === 'url' && (
                <div>
                  <Input
                    id="imageUrl"
                    {...register('imageUrl', {
                      required: uploadMode === 'url' ? 'Image URL is required' : false,
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL starting with http:// or https://'
                      }
                    })}
                    placeholder="https://example.com/ad-image.jpg"
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.imageUrl.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a direct URL to your hosted image
                  </p>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto"
                      onError={() => setImagePreview('')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="targetUrl" className="text-sm font-medium">
                Target URL (Optional)
              </label>
              <Input
                id="targetUrl"
                {...register('targetUrl', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL starting with http:// or https://'
                  }
                })}
                placeholder="https://example.com/landing-page"
              />
              {errors.targetUrl && (
                <p className="text-sm text-red-500">{errors.targetUrl.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Where users will be redirected when they click the ad
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Duration <span className="text-red-500">*</span>
              </label>
              <select
                id="duration"
                {...register('duration', {
                  required: 'Duration is required',
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 border rounded-md bg-white"
              >
                <option value="">Select duration</option>
                <option value="3">3 days</option>
                <option value="7">7 days (1 week)</option>
                <option value="15">15 days (2 weeks)</option>
                <option value="31">31 days (1 month)</option>
              </select>
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Advertisements will be displayed randomly to users</li>
                <li>The ad will automatically expire after the selected duration</li>
                <li>You can manually deactivate the ad at any time</li>
                <li>Impressions and clicks will be tracked automatically</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading || isUploading || !watch('imageUrl')}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Advertisement'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/advertisements')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
