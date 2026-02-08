"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface ChatContextType {
    unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuthStore();

    // Placeholder for real chat logic (e.g., polling or socket.io)
    useEffect(() => {
        if (user) {
            // In a real implementation, you would fetch the unread count from the API
            // e.g., fetchUnreadCount().then(setUnreadCount);
        } else {
            setUnreadCount(0);
        }
    }, [user]);

    return (
        <ChatContext.Provider value={{ unreadCount }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
