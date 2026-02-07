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
  position: 'HERO_CAROUSEL' | 'RANDOM';
}

interface QueuedFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  url?: string;
}

type UploadMode = 'url' | 'file';

export default function CreateAdvertisementPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);

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
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newQueuedFiles: QueuedFile[] = [];

      files.forEach(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image`);
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 5MB)`);
          return;
        }

        const preview = URL.createObjectURL(file);
        newQueuedFiles.push({
          file,
          preview,
          status: 'pending'
        });
      });

      setQueuedFiles(prev => [...prev, ...newQueuedFiles]);
    }
  };

  const removeQueuedFile = (index: number) => {
    setQueuedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Handle upload button click
  const handleUploadAll = async () => {
    if (queuedFiles.length === 0) {
      toast.error('Please select images first');
      return;
    }

    setIsUploading(true);
    const updatedFiles = [...queuedFiles];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'uploaded') continue;

      try {
        updatedFiles[i].status = 'uploading';
        setQueuedFiles([...updatedFiles]);

        const url = await uploadToCloudinary(updatedFiles[i].file);
        updatedFiles[i].status = 'uploaded';
        updatedFiles[i].url = url;
        setQueuedFiles([...updatedFiles]);
      } catch (error) {
        updatedFiles[i].status = 'error';
        setQueuedFiles([...updatedFiles]);
        toast.error(`Failed to upload ${updatedFiles[i].file.name}`);
      }
    }
    setIsUploading(false);
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
      if (uploadMode === 'file') {
        const uploadedFiles = queuedFiles.filter(f => f.status === 'uploaded');
        if (uploadedFiles.length === 0) {
          toast.error('Please upload at least one image');
          setIsLoading(false);
          return;
        }

        if (uploadedFiles.length === 1) {
          // Single creation
          const payload = {
            title: data.title,
            imageUrl: uploadedFiles[0].url,
            duration: data.duration,
            position: data.position,
            targetUrl: data.targetUrl?.trim() || null
          };
          await api.post('/advertisements', payload);
        } else {
          // Bulk creation
          const payload = {
            ads: uploadedFiles.map(f => ({
              title: data.title,
              imageUrl: f.url,
              duration: data.duration,
              position: data.position,
              targetUrl: data.targetUrl?.trim() || null
            }))
          };
          await api.post('/advertisements/bulk', payload);
        }
      } else {
        // URL Mode - Single creation
        if (!data.imageUrl) {
          toast.error('Please provide an image URL');
          setIsLoading(false);
          return;
        }

        const payload = {
          title: data.title,
          imageUrl: data.imageUrl,
          duration: data.duration,
          position: data.position,
          targetUrl: data.targetUrl?.trim() || null
        };
        await api.post('/advertisements', payload);
      }

      toast.success('Advertisement(s) created successfully');
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
                      multiple
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
                        Click to select images (multiple allowed)
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </label>
                  </div>

                  {/* Queued Files List */}
                  {queuedFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {queuedFiles.map((file, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border">
                          <img src={file.preview} alt="preview" className="w-full h-24 object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => removeQueuedFile(idx)}
                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                              disabled={isUploading}
                            >
                              <Upload className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                          {file.status === 'uploading' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                          {file.status === 'uploaded' && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white p-0.5 rounded-full">
                              <Loader2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {queuedFiles.some(f => f.status !== 'uploaded') && (
                    <Button
                      type="button"
                      onClick={handleUploadAll}
                      disabled={isUploading}
                      className="w-full bg-lime-500 hover:bg-lime-600 text-white"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload {queuedFiles.filter(f => f.status !== 'uploaded').length} Images to Cloudinary
                        </>
                      )}
                    </Button>
                  )}

                  {queuedFiles.length > 0 && queuedFiles.every(f => f.status === 'uploaded') && (
                    <p className="text-sm text-green-600 font-medium text-center italic">
                      All images uploaded successfully!
                    </p>
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

            <div className="space-y-2">
              <label htmlFor="position" className="text-sm font-medium">
                Ad Position <span className="text-red-500">*</span>
              </label>
              <select
                id="position"
                {...register('position', { required: 'Position is required' })}
                className="w-full px-3 py-2 border rounded-md bg-white"
                defaultValue="RANDOM"
              >
                <option value="RANDOM">Random Section</option>
                <option value="HERO_CAROUSEL">Hero Carousel (Top Sliding View)</option>
              </select>
              {errors.position && (
                <p className="text-sm text-red-500">{errors.position.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>Hero Carousel</strong> ads will be displayed in the sliding gallery at the top.</li>
                <li><strong>Random Section</strong> ads appear scattered throughout the site.</li>
                <li>Multiple images will create separate ads with the same details.</li>
                <li>The ads will automatically expire after the selected duration.</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading || isUploading || (uploadMode === 'file' && queuedFiles.filter(f => f.status === 'uploaded').length === 0)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  queuedFiles.filter(f => f.status === 'uploaded').length > 1
                    ? `Create ${queuedFiles.filter(f => f.status === 'uploaded').length} Advertisements`
                    : 'Create Advertisement'
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
