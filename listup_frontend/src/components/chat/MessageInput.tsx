"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import axios from '@/utils/axios';

interface MessageInputProps {
    conversationId: string;
    onMessageSent?: (message: any) => void;
    socket?: any;
}

const MessageInput = ({ conversationId, onMessageSent, socket }: MessageInputProps) => {
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Typing indicator logic
    useEffect(() => {
        if (!socket || !content.trim()) return;

        const timer = setTimeout(() => {
            socket.emit('typing:stop', { conversationId });
        }, 3000);

        socket.emit('typing:start', { conversationId });

        return () => clearTimeout(timer);
    }, [content, socket, conversationId]);

    const handleSend = async () => {
        if ((!content.trim() && !selectedFile) || isSending || isUploading) return;

        setIsSending(true);
        try {
            if (selectedFile) {
                setIsUploading(true);
                const formData = new FormData();
                formData.append('conversationId', conversationId);
                formData.append('image', selectedFile);

                const response = await axios.post('/chat/messages/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    onMessageSent?.(response.data.message);
                    setImagePreview(null);
                    setSelectedFile(null);
                }
                setIsUploading(false);
            }

            if (content.trim()) {
                const response = await axios.post('/chat/messages', {
                    conversationId,
                    content: content.trim()
                });

                if (response.data.success) {
                    onMessageSent?.(response.data.message);
                    setContent('');
                }
            }

            socket?.emit('typing:stop', { conversationId });
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message.');
        } finally {
            setIsSending(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 border-t bg-white">
            {imagePreview && (
                <div className="relative inline-block mb-2 group">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                        <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            <div className="flex items-end gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending || isUploading}
                >
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <div className="flex-1 relative">
                    <Textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="min-h-[40px] max-h-[120px] py-2 px-4 rounded-2xl resize-none bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                        rows={1}
                    />
                </div>

                <Button
                    variant="default"
                    size="icon"
                    className="shrink-0 rounded-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleSend}
                    disabled={(!content.trim() && !selectedFile) || isSending || isUploading}
                >
                    {isSending || isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
};

export default MessageInput;
