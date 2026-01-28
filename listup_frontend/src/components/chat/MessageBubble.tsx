"use client";

import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import ImagePreviewModal from './ImagePreviewModal';

interface Message {
    id: string;
    content: string | null;
    imageUrl: string | null;
    messageType: string;
    senderId: string;
    isRead: boolean;
    createdAt: string;
}

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const time = format(new Date(message.createdAt), 'HH:mm');

    return (
        <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl p-3 shadow-sm ${isOwn
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                {message.messageType === 'IMAGE' && message.imageUrl && (
                    <>
                        <div
                            className="relative mb-2 rounded-lg overflow-hidden bg-gray-100 group border cursor-pointer"
                            onClick={() => setIsPreviewOpen(true)}
                        >
                            <Image
                                src={message.imageUrl}
                                alt="Chat image"
                                width={300}
                                height={300}
                                className="object-cover w-full h-auto max-w-[300px] transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-full">
                                    <ZoomIn className="h-5 w-5" />
                                </span>
                            </div>
                        </div>
                        <ImagePreviewModal
                            imageUrl={message.imageUrl}
                            isOpen={isPreviewOpen}
                            onClose={() => setIsPreviewOpen(false)}
                        />
                    </>
                )}

                {message.content && (
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )}

                <div className={`flex items-center gap-1 mt-1 text-[10px] ${isOwn ? 'text-blue-100 justify-end' : 'text-gray-400'}`}>
                    <span>{time}</span>
                    {isOwn && (
                        <span>
                            {message.isRead ? (
                                <CheckCheck className="h-3 w-3" />
                            ) : (
                                <Check className="h-3 w-3" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
