"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/authStore';
import LoginPromptDialog from '@/components/LoginPromptDialog';
import axios from '@/utils/axios';

interface ChatButtonProps {
    sellerId: string;
    listingId?: string;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    label?: string;
}

const ChatButton = ({
    sellerId,
    listingId,
    variant = 'default',
    size = 'default',
    className = "",
    label = "Chat with Seller"
}: ChatButtonProps) => {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const handleChatClick = async () => {
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }

        if (user.id === sellerId) {
            // Can't chat with self
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('/chat/conversations', {
                sellerId,
                listingId
            });

            if (response.data.success) {
                const conversationId = response.data.conversationId;
                router.push(`/chat/${conversationId}`);
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
            alert('Failed to start chat. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleChatClick}
                disabled={isLoading || (user?.id === sellerId)}
                variant={variant}
                size={size}
                className={`flex items-center gap-2 ${className}`}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <MessageSquare className="h-4 w-4" />
                )}
                {label}
            </Button>

            <LoginPromptDialog
                open={showLoginPrompt}
                onOpenChange={setShowLoginPrompt}
            />
        </>
    );
};

export default ChatButton;
