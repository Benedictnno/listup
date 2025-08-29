"use client";

import { useState, useCallback, useRef } from "react";

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

interface ImageUploaderProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  className?: string;
  enableCompression?: boolean;
  compressionQuality?: number; // 0.1 to 1.0
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 4,
  maxFileSize = 10,
  className = "",
  enableCompression = true,
  compressionQuality = 0.8
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image function
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!enableCompression || file.size <= 1024 * 1024) { // Skip if < 1MB
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          compressionQuality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection for a specific slot
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    if (e.target.files && e.target.files[0]) {
      handleSingleFile(e.target.files[0], slotIndex);
    }
  };

  // Handle single file upload
  const handleSingleFile = async (file: File, slotIndex: number) => {
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`);
      return;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      alert(`${file.name} is too large. Maximum size is ${maxFileSize}MB`);
      return;
    }

    setCompressing(true);
    
    try {
      const compressedFile = await compressImage(file);
      const originalSize = file.size;
      const compressedSize = compressedFile.size;
      
      const newImage: ImageFile = {
        file: compressedFile,
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(compressedFile),
        uploading: false,
        uploaded: false,
        originalSize,
        compressedSize
      };
      
      // Update the specific slot
      const newImages = [...images];
      newImages[slotIndex] = newImage;
      onImagesChange(newImages);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setCompressing(false);
    }
  };

  // Remove image from a specific slot
  const removeImage = (slotIndex: number) => {
    const image = images[slotIndex];
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    
    const newImages = [...images];
    newImages[slotIndex] = null as any;
    onImagesChange(newImages);
  };

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropReorder = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    onImagesChange(newImages);
    setDraggedIndex(null);
  };

  // Touch-friendly reordering for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setTouchStart(index);
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    setTouchEnd(index);
  };

  const handleTouchEnd = () => {
    if (touchStart !== null && touchEnd !== null && touchStart !== touchEnd) {
      const newImages = [...images];
      const [movedImage] = newImages.splice(touchStart, 1);
      newImages.splice(touchEnd, 0, movedImage);
      
      onImagesChange(newImages);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Trigger file input for a specific slot
  const triggerFileInput = (slotIndex: number) => {
    const input = document.getElementById(`image-upload-${slotIndex}`) as HTMLInputElement;
    input?.click();
  };

  // Create empty slots array
  const slots = Array.from({ length: maxImages }, (_, index) => index);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image Upload Grid */}
      <div className="grid grid-cols-2 gap-4">
        {slots.map((slotIndex) => {
          const image = images[slotIndex];
          const isEmpty = !image;
          
          return (
            <div
              key={slotIndex}
              className={`relative aspect-square rounded-lg border-2 transition-all duration-200 ${
                isEmpty 
                  ? 'border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100' 
                  : 'border-solid border-gray-200 bg-white shadow-sm'
              }`}
            >
              {isEmpty ? (
                /* Empty Upload Slot */
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <input
                    id={`image-upload-${slotIndex}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, slotIndex)}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => triggerFileInput(slotIndex)}
                    className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <span className="text-3xl">📷</span>
                    <span className="text-sm font-medium">Add Photo</span>
                    <span className="text-xs text-gray-400">
                      {slotIndex === 0 ? 'Main Photo' : `Photo ${slotIndex + 1}`}
                    </span>
                  </button>
                  
                  {/* Slot Number Badge */}
                  <div className="absolute top-2 left-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                    {slotIndex + 1}
                  </div>
                </div>
              ) : (
                /* Image Preview */
                <div
                  className="relative w-full h-full group"
                  draggable
                  onDragStart={(e) => handleDragStart(e, slotIndex)}
                  onDragOver={(e) => handleDragOver(e, slotIndex)}
                  onDrop={(e) => handleDropReorder(e, slotIndex)}
                  onTouchStart={(e) => handleTouchStart(e, slotIndex)}
                  onTouchMove={(e) => handleTouchMove(e, slotIndex)}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={image.preview}
                    alt={`Preview ${slotIndex + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  
                  {/* Slot Number Badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {slotIndex + 1}
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(slotIndex)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                    aria-label="Remove image"
                  >
                    <span className="text-white text-sm">×</span>
                  </button>
                  
                  {/* Drag Handle */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <span className="text-white text-xs">⋮⋮</span>
                  </div>

                  {/* Compression Indicator */}
                  {image.originalSize && image.compressedSize && image.compressedSize < image.originalSize && (
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>🗜️</span>
                    </div>
                  )}

                  {/* Upload Status */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}

                  {image.error && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center rounded-lg">
                      <span className="text-white text-xl">⚠️</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compression Status */}
      {compressing && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">Compressing image...</span>
          </div>
        </div>
      )}
      
      {/* Compression Summary */}
      {enableCompression && images.some(img => img?.originalSize && img?.compressedSize && img.compressedSize < img.originalSize) && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">🗜️</span>
            <div className="text-sm text-green-800">
              <p className="font-medium">Images optimized!</p>
              <p className="text-xs mt-1">
                {images.filter(img => img?.originalSize && img?.compressedSize && img.compressedSize < img.originalSize).length} images were compressed to save space and improve upload speed.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">📸</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Image Tips:</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• <strong>First image</strong> will be the main product photo</li>
              <li>• <strong>Tap each slot</strong> to add photos individually</li>
              <li>• Use <strong>high-quality, well-lit</strong> images</li>
              <li>• Show product from <strong>multiple angles</strong></li>
              <li>• Ensure product is <strong>clearly visible</strong></li>
              {enableCompression && (
                <li>• Images are <strong>automatically compressed</strong> for better performance</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Instructions */}
      <div className="md:hidden p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800 text-center">
          💡 <strong>Mobile Tip:</strong> Tap each photo slot to add images. You can reorder by tapping and holding.
        </p>
      </div>

      {/* File Size Info */}
      <div className="text-center text-xs text-gray-500">
        <p>PNG, JPG, JPEG up to {maxFileSize}MB each • Max {maxImages} images</p>
        {enableCompression && (
          <p className="mt-1">🔄 Images are automatically compressed for better performance</p>
        )}
      </div>
    </div>
  );
}
