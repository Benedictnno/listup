"use client";

import React from 'react';
import Image from 'next/image';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogPortal,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImagePreviewModalProps {
    imageUrl: string;
    isOpen: boolean;
    onClose: () => void;
}

const ImagePreviewModal = ({ imageUrl, isOpen, onClose }: ImagePreviewModalProps) => {
    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `listup-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download image:', error);
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogPortal>
                <DialogOverlay className="bg-slate-900/60 backdrop-blur-md z-[100]" />
                <DialogContent
                    className="fixed inset-0 z-[101] flex items-center justify-center p-0 border-none bg-transparent shadow-none max-w-none w-screen h-screen translate-x-0 translate-y-0 top-0 left-0 outline-none focus:ring-0 overflow-hidden"
                    showCloseButton={false}
                >
                    {/* Toolbar */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
                        <div className="text-white text-sm font-semibold drop-shadow-md">Image Preview</div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 rounded-full transition-colors h-10 w-10"
                                onClick={handleDownload}
                                title="Download"
                            >
                                <Download className="h-6 w-6" />
                            </Button>
                            <DialogClose asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20 rounded-full transition-colors h-10 w-10"
                                    title="Close"
                                >
                                    <X className="h-7 w-7" />
                                </Button>
                            </DialogClose>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
                        <img
                            src={imageUrl}
                            alt="Shared preview"
                            className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl transition-all duration-300 transform"
                        />
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};

export default ImagePreviewModal;
